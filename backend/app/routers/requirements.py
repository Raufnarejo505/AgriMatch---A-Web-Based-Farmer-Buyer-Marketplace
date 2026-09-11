from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user, require_role
from ..models import Requirement, User
from ..pagination import paginate
from ..schemas import (
    Page,
    RequirementCreate,
    RequirementOut,
    RequirementStatus,
    RequirementUpdate,
)

router = APIRouter(prefix="/requirements", tags=["requirements"])


def _owned_requirement(requirement_id: int, user: User, db: Session) -> Requirement:
    requirement = db.get(Requirement, requirement_id)
    if requirement is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Requirement not found")
    if requirement.buyer_id != user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "You do not own this requirement")
    return requirement


@router.get("", response_model=Page[RequirementOut])
def search_requirements(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
    crop: str | None = None,
    location: str | None = None,
    min_quantity: float | None = Query(None, ge=0),
    max_quantity: float | None = Query(None, ge=0),
    min_price: float | None = Query(None, ge=0),
    max_price: float | None = Query(None, ge=0),
    requirement_status: RequirementStatus | None = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    size: int = Query(9, ge=1, le=100),
) -> Page[RequirementOut]:
    stmt = select(Requirement)
    if crop:
        stmt = stmt.where(Requirement.crop.ilike(f"%{crop}%"))
    if location:
        stmt = stmt.where(Requirement.delivery_area.ilike(f"%{location}%"))
    if min_quantity is not None:
        stmt = stmt.where(Requirement.quantity >= min_quantity)
    if max_quantity is not None:
        stmt = stmt.where(Requirement.quantity <= max_quantity)
    if min_price is not None:
        stmt = stmt.where(Requirement.max_price >= min_price)
    if max_price is not None:
        stmt = stmt.where(Requirement.min_price <= max_price)
    if requirement_status:
        stmt = stmt.where(Requirement.status == requirement_status)

    rows, total = paginate(
        db, stmt.order_by(Requirement.created_at.desc(), Requirement.id.desc()), page, size
    )
    return Page[RequirementOut](
        items=[RequirementOut.model_validate(row) for row in rows],
        total=total,
        page=page,
        size=size,
    )


@router.get("/mine", response_model=list[RequirementOut])
def my_requirements(
    user: User = Depends(require_role("buyer")),
    db: Session = Depends(get_db),
) -> list[Requirement]:
    return list(
        db.scalars(
            select(Requirement)
            .where(Requirement.buyer_id == user.id)
            .order_by(Requirement.created_at.desc(), Requirement.id.desc())
        ).all()
    )


@router.get("/{requirement_id}", response_model=RequirementOut)
def get_requirement(
    requirement_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> Requirement:
    requirement = db.get(Requirement, requirement_id)
    if requirement is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Requirement not found")
    return requirement


@router.post("", response_model=RequirementOut, status_code=status.HTTP_201_CREATED)
def create_requirement(
    payload: RequirementCreate,
    user: User = Depends(require_role("buyer")),
    db: Session = Depends(get_db),
) -> Requirement:
    requirement = Requirement(buyer_id=user.id, **payload.model_dump())
    db.add(requirement)
    db.commit()
    db.refresh(requirement)
    return requirement


@router.patch("/{requirement_id}", response_model=RequirementOut)
def update_requirement(
    requirement_id: int,
    payload: RequirementUpdate,
    user: User = Depends(require_role("buyer")),
    db: Session = Depends(get_db),
) -> Requirement:
    requirement = _owned_requirement(requirement_id, user, db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(requirement, field, value)
    if requirement.max_price < requirement.min_price:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            "max_price must be greater than or equal to min_price",
        )
    db.add(requirement)
    db.commit()
    db.refresh(requirement)
    return requirement


@router.delete("/{requirement_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_requirement(
    requirement_id: int,
    user: User = Depends(require_role("buyer")),
    db: Session = Depends(get_db),
) -> None:
    requirement = _owned_requirement(requirement_id, user, db)
    db.delete(requirement)
    db.commit()
