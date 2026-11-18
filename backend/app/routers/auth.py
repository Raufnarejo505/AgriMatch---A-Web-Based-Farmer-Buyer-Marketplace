from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user
from ..models import User
from ..schemas import Token, UserCreate, UserLogin, UserOut
from ..security import cnic_fingerprint, create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


def _issue_token(user: User) -> Token:
    return Token(access_token=create_access_token(user.id), user=UserOut.model_validate(user))


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)) -> Token:
    email = payload.email.strip().lower() if payload.email else None
    fingerprint = cnic_fingerprint(payload.cnic)

    if db.scalar(select(User.id).where(User.cnic_hash == fingerprint)) is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "CNIC already registered")
    if email and db.scalar(select(User.id).where(User.email == email)) is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already registered")

    user = User(
        name=payload.name.strip(),
        email=email,
        cnic_hash=fingerprint,
        cnic_last4=payload.cnic[-4:],
        password_hash=hash_password(payload.password),
        role=payload.role,
        phone=payload.phone.strip() if payload.phone else None,
        location=payload.location.strip() if payload.location else None,
        status="active",
    )
    try:
        db.add(user)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, "CNIC or email already registered") from None
    db.refresh(user)
    return _issue_token(user)


@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)) -> Token:
    user = db.scalar(select(User).where(User.cnic_hash == cnic_fingerprint(payload.cnic)))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid CNIC or password")
    if user.status != "active":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Account suspended")
    return _issue_token(user)


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)) -> User:
    return user
