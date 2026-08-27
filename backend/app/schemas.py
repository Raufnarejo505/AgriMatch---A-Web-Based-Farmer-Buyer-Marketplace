from datetime import datetime
from typing import Generic, Literal, TypeVar

from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator

Role = Literal["farmer", "buyer", "admin"]
SignupRole = Literal["farmer", "buyer"]
UserStatus = Literal["active", "suspended"]


class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)
    role: SignupRole
    phone: str | None = Field(default=None, max_length=30)
    location: str | None = Field(default=None, max_length=120)


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=72)


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    role: Role
    phone: str | None = None
    location: str | None = None
    status: UserStatus
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

Quality = Literal["A", "B", "C"]
ListingStatus = Literal["open", "closed"]
RequirementStatus = Literal["open", "closed"]

T = TypeVar("T")


class Page(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    size: int


class ProfileUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=120)
    phone: str | None = Field(default=None, max_length=30)
    location: str | None = Field(default=None, max_length=120)
    password: str | None = Field(default=None, min_length=8, max_length=72)


class ListingBase(BaseModel):
    crop: str = Field(min_length=2, max_length=120)
    quantity: float = Field(gt=0)
    unit: str = Field(min_length=1, max_length=20)
    quality: Quality
    price_per_unit: float = Field(gt=0)
    location: str = Field(min_length=2, max_length=120)
    description: str | None = Field(default=None, max_length=2000)


class ListingCreate(ListingBase):
    pass


class ListingUpdate(BaseModel):
    crop: str | None = Field(default=None, min_length=2, max_length=120)
    quantity: float | None = Field(default=None, gt=0)
    unit: str | None = Field(default=None, min_length=1, max_length=20)
    quality: Quality | None = None
    price_per_unit: float | None = Field(default=None, gt=0)
    location: str | None = Field(default=None, min_length=2, max_length=120)
    description: str | None = Field(default=None, max_length=2000)
    status: ListingStatus | None = None


class ListingOut(ListingBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    farmer_id: int
    status: ListingStatus
    created_at: datetime


class RequirementBase(BaseModel):
    crop: str = Field(min_length=2, max_length=120)
    quantity: float = Field(gt=0)
    unit: str = Field(min_length=1, max_length=20)
    min_price: float = Field(ge=0)
    max_price: float = Field(gt=0)
    delivery_area: str = Field(min_length=2, max_length=120)

    @model_validator(mode="after")
    def _validate_price_range(self) -> "RequirementBase":
        if self.max_price < self.min_price:
            raise ValueError("max_price must be greater than or equal to min_price")
        return self


class RequirementCreate(RequirementBase):
    pass


class RequirementUpdate(BaseModel):
    crop: str | None = Field(default=None, min_length=2, max_length=120)
    quantity: float | None = Field(default=None, gt=0)
    unit: str | None = Field(default=None, min_length=1, max_length=20)
    min_price: float | None = Field(default=None, ge=0)
    max_price: float | None = Field(default=None, gt=0)
    delivery_area: str | None = Field(default=None, min_length=2, max_length=120)
    status: RequirementStatus | None = None


class RequirementOut(RequirementBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    buyer_id: int
    status: RequirementStatus
    created_at: datetime

OfferStatus = Literal["pending", "accepted", "rejected", "countered"]
OrderStatus = Literal["pending", "confirmed", "ready", "completed", "cancelled"]
OrderAction = Literal["confirmed", "ready", "completed", "cancelled"]


class ConversationCreate(BaseModel):
    listing_id: int | None = None
    requirement_id: int | None = None

    @model_validator(mode="after")
    def _one_reference(self) -> "ConversationCreate":
        if (self.listing_id is None) == (self.requirement_id is None):
            raise ValueError("Provide exactly one of listing_id or requirement_id")
        return self


class ConversationOut(BaseModel):
    id: int
    farmer_id: int
    buyer_id: int
    listing_id: int | None = None
    requirement_id: int | None = None
    counterpart_name: str
    crop: str
    unit: str
    reference_price: float | None = None
    created_at: datetime


class MessageOut(BaseModel):
    id: int
    conversation_id: int
    sender_id: int
    sender_name: str
    body: str
    created_at: datetime


class OfferCreate(BaseModel):
    conversation_id: int
    price_per_unit: float = Field(gt=0)
    quantity: float = Field(gt=0)


class OfferCounter(BaseModel):
    price_per_unit: float = Field(gt=0)
    quantity: float = Field(gt=0)


class OfferOut(BaseModel):
    id: int
    conversation_id: int
    from_user_id: int
    from_user_name: str
    price_per_unit: float
    quantity: float
    status: OfferStatus
    parent_offer_id: int | None = None
    crop: str
    unit: str
    counterpart_name: str
    created_at: datetime


class OrderStatusHistoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: OrderStatus
    changed_at: datetime


class OrderOut(BaseModel):
    id: int
    offer_id: int
    farmer_id: int
    buyer_id: int
    crop: str
    quantity: float
    price_per_unit: float
    status: OrderStatus
    created_at: datetime
    farmer_name: str
    buyer_name: str
    history: list[OrderStatusHistoryOut]


class OrderStatusUpdate(BaseModel):
    status: OrderAction


class AdminStats(BaseModel):
    users: int
    farmers: int
    buyers: int
    suspended: int
    listings: int
    requirements: int
    orders: int
    pending_orders: int


class UserStatusUpdate(BaseModel):
    status: UserStatus
