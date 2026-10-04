from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from ..database import get_db
from ..deps import get_current_user, require_role
from ..models import Order, OrderStatusHistory, User
from ..schemas import OrderOut, OrderStatusHistoryOut, OrderStatusUpdate

router = APIRouter(prefix="/orders", tags=["orders"])

TRANSITIONS: dict[str, set[str]] = {
    "pending": {"confirmed", "cancelled"},
    "confirmed": {"ready", "cancelled"},
    "ready": {"completed", "cancelled"},
    "completed": set(),
    "cancelled": set(),
}


def order_out(db: Session, order: Order) -> OrderOut:
    farmer = db.get(User, order.farmer_id)
    buyer = db.get(User, order.buyer_id)
    return OrderOut(
        id=order.id,
        offer_id=order.offer_id,
        farmer_id=order.farmer_id,
        buyer_id=order.buyer_id,
        crop=order.crop,
        quantity=order.quantity,
        price_per_unit=order.price_per_unit,
        status=order.status,
        created_at=order.created_at,
        farmer_name=farmer.name if farmer is not None else "Unknown",
        buyer_name=buyer.name if buyer is not None else "Unknown",
        history=[OrderStatusHistoryOut.model_validate(entry) for entry in order.history],
    )


@router.get("", response_model=list[OrderOut])
def list_orders(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[OrderOut]:
    stmt = (
        select(Order)
        .options(selectinload(Order.history))
        .order_by(Order.created_at.desc(), Order.id.desc())
    )
    if user.role != "admin":
        stmt = stmt.where((Order.farmer_id == user.id) | (Order.buyer_id == user.id))
    orders = db.scalars(stmt).all()
    return [order_out(db, order) for order in orders]


@router.get("/{order_id}", response_model=OrderOut)
def get_order(
    order_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> OrderOut:
    order = db.get(Order, order_id)
    if order is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Order not found")
    if user.role != "admin" and user.id not in (order.farmer_id, order.buyer_id):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "You are not part of this order")
    return order_out(db, order)


@router.patch("/{order_id}/status", response_model=OrderOut)
def update_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    user: User = Depends(require_role("farmer")),
    db: Session = Depends(get_db),
) -> OrderOut:
    order = db.get(Order, order_id)
    if order is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Order not found")
    if order.farmer_id != user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Only the farmer can update this order")
    if payload.status not in TRANSITIONS.get(order.status, set()):
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"Cannot change order status from {order.status} to {payload.status}",
        )

    order.status = payload.status
    db.add(OrderStatusHistory(order_id=order.id, status=payload.status))
    db.commit()
    db.refresh(order)
    return order_out(db, order)
