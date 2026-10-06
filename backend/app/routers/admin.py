from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from ..database import get_db
from ..deps import get_current_user, require_role
from ..models import Listing, Order, Requirement, User
from ..schemas import (
    AdminStats,
    ListingOut,
    OrderOut,
    RequirementOut,
    UserOut,
    UserStatusUpdate,
)
from .orders import order_out

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(require_role("admin"))],
)


def _count(db: Session, column_owner) -> int:
    return db.scalar(select(func.count()).select_from(column_owner)) or 0


@router.get("/stats", response_model=AdminStats)
def stats(db: Session = Depends(get_db)) -> AdminStats:
    return AdminStats(
        users=_count(db, User),
        farmers=db.scalar(select(func.count()).select_from(User).where(User.role == "farmer")) or 0,
        buyers=db.scalar(select(func.count()).select_from(User).where(User.role == "buyer")) or 0,
        suspended=db.scalar(select(func.count()).select_from(User).where(User.status == "suspended")) or 0,
        listings=_count(db, Listing),
        requirements=_count(db, Requirement),
        orders=_count(db, Order),
        pending_orders=db.scalar(
            select(func.count()).select_from(Order).where(Order.status == "pending")
        )
        or 0,
    )


@router.get("/users", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db)) -> list[User]:
    return list(
        db.scalars(select(User).order_by(User.created_at.desc(), User.id.desc())).all()
    )


@router.patch("/users/{user_id}/status", response_model=UserOut)
def set_user_status(
    user_id: int,
    payload: UserStatusUpdate,
    admin: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> User:
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    if user.id == admin.id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "You cannot change your own status")
    user.status = payload.status
    db.commit()
    db.refresh(user)
    return user


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    admin: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    if user.id == admin.id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "You cannot delete your own account")
    order_count = db.scalar(
        select(func.count())
        .select_from(Order)
        .where((Order.farmer_id == user.id) | (Order.buyer_id == user.id))
    )
    if order_count:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            "User has orders; suspend the account instead",
        )
    db.delete(user)
    db.commit()


@router.get("/listings", response_model=list[ListingOut])
def list_listings(db: Session = Depends(get_db)) -> list[Listing]:
    return list(
        db.scalars(
            select(Listing).order_by(Listing.created_at.desc(), Listing.id.desc())
        ).all()
    )


@router.delete("/listings/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_listing(listing_id: int, db: Session = Depends(get_db)) -> None:
    listing = db.get(Listing, listing_id)
    if listing is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Listing not found")
    db.delete(listing)
    db.commit()


@router.get("/requirements", response_model=list[RequirementOut])
def list_requirements(db: Session = Depends(get_db)) -> list[Requirement]:
    return list(
        db.scalars(
            select(Requirement).order_by(Requirement.created_at.desc(), Requirement.id.desc())
        ).all()
    )


@router.delete("/requirements/{requirement_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_requirement(requirement_id: int, db: Session = Depends(get_db)) -> None:
    requirement = db.get(Requirement, requirement_id)
    if requirement is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Requirement not found")
    db.delete(requirement)
    db.commit()


@router.get("/orders", response_model=list[OrderOut])
def list_orders(db: Session = Depends(get_db)) -> list[OrderOut]:
    orders = db.scalars(
        select(Order)
        .options(selectinload(Order.history))
        .order_by(Order.created_at.desc(), Order.id.desc())
    ).all()
    return [order_out(db, order) for order in orders]
