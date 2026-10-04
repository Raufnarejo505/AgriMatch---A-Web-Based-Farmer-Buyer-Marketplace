from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user
from ..models import Conversation, Offer, Order, OrderStatusHistory, User
from ..schemas import OfferCounter, OfferCreate, OfferOut, OrderOut
from ..ws import manager
from .conversations import conversation_context, conversation_for
from .orders import order_out

router = APIRouter(prefix="/offers", tags=["offers"])


def _offer_for(db: Session, offer_id: int, user: User) -> tuple[Offer, Conversation]:
    offer = db.get(Offer, offer_id)
    if offer is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Offer not found")
    conversation = conversation_for(db, offer.conversation_id, user)
    return offer, conversation


def _offer_out(db: Session, offer: Offer, conversation: Conversation, viewer_id: int) -> OfferOut:
    crop, unit, _ = conversation_context(db, conversation)
    sender = db.get(User, offer.from_user_id)
    other_id = (
        conversation.buyer_id if viewer_id == conversation.farmer_id else conversation.farmer_id
    )
    other = db.get(User, other_id)
    return OfferOut(
        id=offer.id,
        conversation_id=offer.conversation_id,
        from_user_id=offer.from_user_id,
        from_user_name=sender.name if sender is not None else "Unknown",
        price_per_unit=offer.price_per_unit,
        quantity=offer.quantity,
        status=offer.status,
        parent_offer_id=offer.parent_offer_id,
        crop=crop,
        unit=unit,
        counterpart_name=other.name if other is not None else "Unknown",
        created_at=offer.created_at,
    )


async def _broadcast_offer(db: Session, offer: Offer, conversation: Conversation, viewer_id: int) -> None:
    payload = _offer_out(db, offer, conversation, viewer_id).model_dump(mode="json")
    await manager.broadcast(offer.conversation_id, {"type": "offer", "data": payload})


@router.get("", response_model=list[OfferOut])
def list_offers(
    conversation_id: int = Query(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[OfferOut]:
    conversation = conversation_for(db, conversation_id, user)
    offers = db.scalars(
        select(Offer)
        .where(Offer.conversation_id == conversation_id)
        .order_by(Offer.created_at.asc(), Offer.id.asc())
    ).all()
    return [_offer_out(db, offer, conversation, user.id) for offer in offers]


@router.get("/mine", response_model=list[OfferOut])
def my_offers(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[OfferOut]:
    conversations = db.scalars(
        select(Conversation).where(
            (Conversation.farmer_id == user.id) | (Conversation.buyer_id == user.id)
        )
    ).all()
    conversation_map = {conversation.id: conversation for conversation in conversations}
    if not conversation_map:
        return []
    offers = db.scalars(
        select(Offer)
        .where(Offer.conversation_id.in_(list(conversation_map.keys())))
        .order_by(Offer.created_at.desc(), Offer.id.desc())
    ).all()
    return [
        _offer_out(db, offer, conversation_map[offer.conversation_id], user.id) for offer in offers
    ]


@router.post("", response_model=OfferOut, status_code=status.HTTP_201_CREATED)
async def create_offer(
    payload: OfferCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> OfferOut:
    conversation = conversation_for(db, payload.conversation_id, user)
    offer = Offer(
        conversation_id=conversation.id,
        from_user_id=user.id,
        price_per_unit=payload.price_per_unit,
        quantity=payload.quantity,
        status="pending",
    )
    db.add(offer)
    db.commit()
    db.refresh(offer)
    result = _offer_out(db, offer, conversation, user.id)
    await _broadcast_offer(db, offer, conversation, user.id)
    return result


@router.post("/{offer_id}/accept", response_model=OrderOut)
async def accept_offer(
    offer_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> OrderOut:
    offer, conversation = _offer_for(db, offer_id, user)
    if offer.status != "pending":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Only pending offers can be accepted")
    if offer.from_user_id == user.id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "You cannot accept your own offer")

    offer.status = "accepted"
    crop, _, _ = conversation_context(db, conversation)
    order = Order(
        offer_id=offer.id,
        farmer_id=conversation.farmer_id,
        buyer_id=conversation.buyer_id,
        crop=crop,
        quantity=offer.quantity,
        price_per_unit=offer.price_per_unit,
        status="pending",
    )
    db.add(order)
    db.flush()
    db.add(OrderStatusHistory(order_id=order.id, status="pending"))
    db.commit()
    db.refresh(order)

    result = order_out(db, order)
    await _broadcast_offer(db, offer, conversation, user.id)
    return result


@router.post("/{offer_id}/reject", response_model=OfferOut)
async def reject_offer(
    offer_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> OfferOut:
    offer, conversation = _offer_for(db, offer_id, user)
    if offer.status != "pending":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Only pending offers can be rejected")
    if offer.from_user_id == user.id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "You cannot reject your own offer")

    offer.status = "rejected"
    db.commit()
    db.refresh(offer)
    result = _offer_out(db, offer, conversation, user.id)
    await _broadcast_offer(db, offer, conversation, user.id)
    return result


@router.post("/{offer_id}/counter", response_model=OfferOut, status_code=status.HTTP_201_CREATED)
async def counter_offer(
    offer_id: int,
    payload: OfferCounter,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> OfferOut:
    parent, conversation = _offer_for(db, offer_id, user)
    if parent.status != "pending":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Only pending offers can be countered")
    if parent.from_user_id == user.id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "You cannot counter your own offer")

    parent.status = "countered"
    counter = Offer(
        conversation_id=conversation.id,
        from_user_id=user.id,
        price_per_unit=payload.price_per_unit,
        quantity=payload.quantity,
        status="pending",
        parent_offer_id=parent.id,
    )
    db.add(counter)
    db.commit()
    db.refresh(counter)
    result = _offer_out(db, counter, conversation, user.id)
    await _broadcast_offer(db, parent, conversation, user.id)
    await _broadcast_offer(db, counter, conversation, user.id)
    return result
