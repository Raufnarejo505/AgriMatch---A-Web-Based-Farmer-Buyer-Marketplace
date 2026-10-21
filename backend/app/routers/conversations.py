from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user
from ..models import Conversation, Listing, Message, Requirement, User
from ..schemas import ConversationCreate, ConversationOut, MessageOut

router = APIRouter(prefix="/conversations", tags=["conversations"])


def conversation_context(db: Session, conversation: Conversation) -> tuple[str, str, float | None]:
    if conversation.listing_id is not None:
        listing = db.get(Listing, conversation.listing_id)
        if listing is not None:
            return listing.crop, listing.unit, listing.price_per_unit
    if conversation.requirement_id is not None:
        requirement = db.get(Requirement, conversation.requirement_id)
        if requirement is not None:
            return requirement.crop, requirement.unit, requirement.max_price
    return "Conversation", "unit", None


def counterpart_name(db: Session, conversation: Conversation, viewer_id: int) -> str:
    other_id = conversation.buyer_id if viewer_id == conversation.farmer_id else conversation.farmer_id
    other = db.get(User, other_id)
    return other.name if other is not None else "Unknown"


def conversation_out(db: Session, conversation: Conversation, viewer_id: int) -> ConversationOut:
    crop, unit, reference_price = conversation_context(db, conversation)
    return ConversationOut(
        id=conversation.id,
        farmer_id=conversation.farmer_id,
        buyer_id=conversation.buyer_id,
        listing_id=conversation.listing_id,
        requirement_id=conversation.requirement_id,
        counterpart_name=counterpart_name(db, conversation, viewer_id),
        crop=crop,
        unit=unit,
        reference_price=reference_price,
        created_at=conversation.created_at,
    )


def message_out(message: Message, sender_name: str) -> MessageOut:
    return MessageOut(
        id=message.id,
        conversation_id=message.conversation_id,
        sender_id=message.sender_id,
        sender_name=sender_name,
        body=message.body,
        created_at=message.created_at,
    )


def conversation_for(db: Session, conversation_id: int, user: User) -> Conversation:
    conversation = db.get(Conversation, conversation_id)
    if conversation is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Conversation not found")
    if user.id not in (conversation.farmer_id, conversation.buyer_id):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not a participant in this conversation")
    return conversation


@router.post("", response_model=ConversationOut)
def start_conversation(
    payload: ConversationCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ConversationOut:
    if payload.listing_id is not None:
        listing = db.get(Listing, payload.listing_id)
        if listing is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Listing not found")
        if user.role != "buyer":
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Only buyers can contact farmers")
        if listing.farmer_id == user.id:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "This is your own listing")

        existing = db.scalar(
            select(Conversation).where(
                Conversation.farmer_id == listing.farmer_id,
                Conversation.buyer_id == user.id,
                Conversation.listing_id == listing.id,
            )
        )
        if existing is not None:
            return conversation_out(db, existing, user.id)

        conversation = Conversation(
            farmer_id=listing.farmer_id,
            buyer_id=user.id,
            listing_id=listing.id,
        )
    else:
        requirement = db.get(Requirement, payload.requirement_id)
        if requirement is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Requirement not found")
        if user.role != "farmer":
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Only farmers can contact buyers")
        if requirement.buyer_id == user.id:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "This is your own requirement")

        existing = db.scalar(
            select(Conversation).where(
                Conversation.farmer_id == user.id,
                Conversation.buyer_id == requirement.buyer_id,
                Conversation.requirement_id == requirement.id,
            )
        )
        if existing is not None:
            return conversation_out(db, existing, user.id)

        conversation = Conversation(
            farmer_id=user.id,
            buyer_id=requirement.buyer_id,
            requirement_id=requirement.id,
        )

    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation_out(db, conversation, user.id)


@router.get("", response_model=list[ConversationOut])
def list_conversations(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[ConversationOut]:
    conversations = db.scalars(
        select(Conversation)
        .where(or_(Conversation.farmer_id == user.id, Conversation.buyer_id == user.id))
        .order_by(Conversation.created_at.desc(), Conversation.id.desc())
    ).all()
    return [conversation_out(db, conversation, user.id) for conversation in conversations]


@router.get("/{conversation_id}", response_model=ConversationOut)
def get_conversation(
    conversation_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ConversationOut:
    conversation = conversation_for(db, conversation_id, user)
    return conversation_out(db, conversation, user.id)


@router.get("/{conversation_id}/messages", response_model=list[MessageOut])
def list_messages(
    conversation_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[MessageOut]:
    conversation_for(db, conversation_id, user)
    messages = db.scalars(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc(), Message.id.asc())
    ).all()
    sender_ids = {message.sender_id for message in messages}
    names: dict[int, str] = {}
    if sender_ids:
        names = {
            sender.id: sender.name
            for sender in db.scalars(select(User).where(User.id.in_(sender_ids))).all()
        }
    return [message_out(message, names.get(message.sender_id, "Unknown")) for message in messages]
