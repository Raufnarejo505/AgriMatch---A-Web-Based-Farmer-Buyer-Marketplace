from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user
from ..models import User
from ..schemas import ProfileUpdate, UserOut
from ..security import hash_password

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserOut)
def get_profile(user: User = Depends(get_current_user)) -> User:
    return user


@router.patch("/me", response_model=UserOut)
def update_profile(
    payload: ProfileUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> User:
    data = payload.model_dump(exclude_unset=True)
    password = data.pop("password", None)

    if "name" in data:
        name = (data.pop("name") or "").strip()
        if not name:
            raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Name cannot be empty")
        user.name = name

    for field in ("phone", "location"):
        if field in data:
            value = data[field]
            setattr(user, field, value.strip() or None if value else None)

    if password:
        user.password_hash = hash_password(password)

    db.add(user)
    db.commit()
    db.refresh(user)
    return user
