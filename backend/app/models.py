from typing import Any, Optional
from sqlalchemy import Column, JSON
from sqlmodel import Field, SQLModel


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
    status: str = "submitted"
    draft: dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    message: str = "Order received."
