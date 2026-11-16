from typing import Any, Literal
from pydantic import BaseModel, Field


class Customer(BaseModel):
    fullName: str = ""
    email: str = ""
    address: str = ""
    city: str = ""
    phone: str = ""


class OrderItem(BaseModel):
    productId: int
    title: str = ""
    price: float = 0
    quantity: int = 0
    lineTotal: float = 0
    thumbnail: str = ""
    brand: str | None = None
    category: str = ""


class OrderTotals(BaseModel):
    subtotal: float = 0
    currency: str = "USD"


class OrderDraft(BaseModel):
    customer: Customer = Field(default_factory=Customer)
    items: list[OrderItem] = Field(default_factory=list)
    totals: OrderTotals = Field(default_factory=OrderTotals)
    status: Literal["draft"] = "draft"


class OrderCreated(BaseModel):
    id: int
    status: str = "submitted"
    draft: dict[str, Any]
    message: str = "Order received."


class UserCreate(BaseModel):
    email: str
    password: str = Field(min_length=6)
    fullName: str = ""


class UserLogin(BaseModel):
    email: str
    password: str


class UserPublic(BaseModel):
    id: int
    email: str
    fullName: str = ""


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic
