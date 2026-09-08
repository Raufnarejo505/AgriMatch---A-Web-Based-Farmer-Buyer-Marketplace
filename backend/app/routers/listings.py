from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user, require_role
from ..models import Listing, User
from ..pagination import paginate
from ..schemas import ListingCreate, ListingOut, ListingStatus, ListingUpdate, Page, Quality

router = APIRouter(prefix="/listings", tags=["listings"])


def _owned_listing(listing_id: int, user: User, db: Session) -> Listing:
    listing = db.get(Listing, listing_id)
    if listing is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Listing not found")
    if listing.farmer_id != user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "You do not own this listing")
    return listing


@router.get("", response_model=Page[ListingOut])
def search_listings(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
    crop: str | None = None,
    location: str | None = None,
    quality: Quality | None = None,
    min_quantity: float | None = Query(None, ge=0),
    max_quantity: float | None = Query(None, ge=0),
    min_price: float | None = Query(None, ge=0),
    max_price: float | None = Query(None, ge=0),
    listing_status: ListingStatus | None = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    size: int = Query(9, ge=1, le=100),
) -> Page[ListingOut]:
    stmt = select(Listing)
    if crop:
        stmt = stmt.where(Listing.crop.ilike(f"%{crop}%"))
    if location:
        stmt = stmt.where(Listing.location.ilike(f"%{location}%"))
    if quality:
        stmt = stmt.where(Listing.quality == quality)
    if min_quantity is not None:
        stmt = stmt.where(Listing.quantity >= min_quantity)
    if max_quantity is not None:
        stmt = stmt.where(Listing.quantity <= max_quantity)
    if min_price is not None:
        stmt = stmt.where(Listing.price_per_unit >= min_price)
    if max_price is not None:
        stmt = stmt.where(Listing.price_per_unit <= max_price)
    if listing_status:
        stmt = stmt.where(Listing.status == listing_status)

    rows, total = paginate(db, stmt.order_by(Listing.created_at.desc(), Listing.id.desc()), page, size)
    return Page[ListingOut](
        items=[ListingOut.model_validate(row) for row in rows],
        total=total,
        page=page,
        size=size,
    )


@router.get("/mine", response_model=list[ListingOut])
def my_listings(
    user: User = Depends(require_role("farmer")),
    db: Session = Depends(get_db),
) -> list[Listing]:
    return list(
        db.scalars(
            select(Listing)
            .where(Listing.farmer_id == user.id)
            .order_by(Listing.created_at.desc(), Listing.id.desc())
        ).all()
    )


@router.get("/{listing_id}", response_model=ListingOut)
def get_listing(
    listing_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> Listing:
    listing = db.get(Listing, listing_id)
    if listing is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Listing not found")
    return listing


@router.post("", response_model=ListingOut, status_code=status.HTTP_201_CREATED)
def create_listing(
    payload: ListingCreate,
    user: User = Depends(require_role("farmer")),
    db: Session = Depends(get_db),
) -> Listing:
    listing = Listing(farmer_id=user.id, **payload.model_dump())
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return listing


@router.patch("/{listing_id}", response_model=ListingOut)
def update_listing(
    listing_id: int,
    payload: ListingUpdate,
    user: User = Depends(require_role("farmer")),
    db: Session = Depends(get_db),
) -> Listing:
    listing = _owned_listing(listing_id, user, db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(listing, field, value)
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return listing


@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_listing(
    listing_id: int,
    user: User = Depends(require_role("farmer")),
    db: Session = Depends(get_db),
) -> None:
    listing = _owned_listing(listing_id, user, db)
    db.delete(listing)
    db.commit()
