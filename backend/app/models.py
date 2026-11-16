from datetime import datetime, timezone
from typing import Any, Optional

from sqlalchemy import Column, JSON
from sqlmodel import Field, SQLModel


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


class Product(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: str = ""
    price: float = 0
    discountPercentage: float = 0
    rating: float = 0
    stock: int = 0
    brand: Optional[str] = None
    category: str
    tags: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    thumbnail: str = ""
    images: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    sku: Optional[str] = None
    warrantyInformation: Optional[str] = None
    shippingInformation: Optional[str] = None
    returnPolicy: Optional[str] = None
    meta: dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))


class Order(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="user.id", index=True)
    status: str = "submitted"  # submitted | confirmed | cancelled | fulfilled
    draft: dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    message: str = "Order received."
    idempotency_key: Optional[str] = Field(default=None, index=True)
    created_at: str = Field(default_factory=utc_now)
    updated_at: str = Field(default_factory=utc_now)


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    full_name: str = ""
    hashed_password: str
    created_at: str = Field(default_factory=utc_now)


class Cart(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    session_key: Optional[str] = Field(default=None, index=True, unique=True)
    user_id: Optional[int] = Field(default=None, foreign_key="user.id", index=True)
    items: list[dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    updated_at: str = Field(default_factory=utc_now)
