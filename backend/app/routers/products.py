from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlmodel import Session, select

from app.auth import require_admin
from app.data import FASHION_CATEGORIES
from app.db import get_session
from app.models import Product, User

router = APIRouter(prefix="/products", tags=["products"])


class ProductUpsert(BaseModel):
    id: int | None = None
    title: str
    description: str = ""
    price: float = 0
    discountPercentage: float = 0
    rating: float = 0
    stock: int = 0
    brand: str | None = None
    category: str
    tags: list[str] = []
    thumbnail: str = ""
    images: list[str] = []
    sku: str | None = None
    warrantyInformation: str | None = None
    shippingInformation: str | None = None
    returnPolicy: str | None = None
    meta: dict[str, Any] = {}


@router.get("")
def list_products(
    limit: int = Query(default=0, ge=0),
    select: str | None = Query(default=None),
    category: str | None = Query(default=None),
    session: Session = Depends(get_session),
):
    # `select` accepted for frontend compatibility; this scaffold returns full records.
    query = select(Product).where(Product.category.in_(FASHION_CATEGORIES))
    if category:
        query = query.where(Product.category == category)
    items = session.exec(query).all()
    total = len(items)
    if limit and limit > 0:
        items = items[:limit]
    return {
        "products": [item.model_dump() for item in items],
        "total": total,
        "skip": 0,
        "limit": limit or len(items),
    }


@router.get("/{product_id}")
def get_product(
    product_id: int,
    select: str | None = Query(default=None),
    session: Session = Depends(get_session),
):
    product = session.get(Product, product_id)
    if not product or product.category not in FASHION_CATEGORIES:
        raise HTTPException(status_code=404, detail="Product not found")
    return product.model_dump()


@router.post("", status_code=201)
def create_product(
    payload: ProductUpsert,
    session: Session = Depends(get_session),
    _admin: User = Depends(require_admin),
):
    if payload.category not in FASHION_CATEGORIES:
        raise HTTPException(status_code=400, detail="Category is not in curated catalogue.")
    data = payload.model_dump(exclude_unset=True)
    if data.get("id") is not None and session.get(Product, data["id"]):
        raise HTTPException(status_code=409, detail="Product with this id already exists.")
    if not data.get("images") and data.get("thumbnail"):
        data["images"] = [data["thumbnail"]]
    product = Product(**data)
    session.add(product)
    session.commit()
    session.refresh(product)
    return product.model_dump()


@router.put("/{product_id}")
def update_product(
    product_id: int,
    payload: ProductUpsert,
    session: Session = Depends(get_session),
    _admin: User = Depends(require_admin),
):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if payload.category not in FASHION_CATEGORIES:
        raise HTTPException(status_code=400, detail="Category is not in curated catalogue.")

    data = payload.model_dump(exclude_unset=True)
    data.pop("id", None)
    if not data.get("images") and data.get("thumbnail"):
        data["images"] = [data["thumbnail"]]
    for key, value in data.items():
        setattr(product, key, value)
    session.add(product)
    session.commit()
    session.refresh(product)
    return product.model_dump()


@router.delete("/{product_id}", status_code=204)
def delete_product(
    product_id: int,
    session: Session = Depends(get_session),
    _admin: User = Depends(require_admin),
):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    session.delete(product)
    session.commit()
    return None
