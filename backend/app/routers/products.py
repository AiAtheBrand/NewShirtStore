from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from app.data import FASHION_CATEGORIES
from app.db import get_session
from app.models import Product

router = APIRouter(prefix="/products", tags=["products"])


@router.get("")
def list_products(
    limit: int = Query(default=0, ge=0),
    select: str | None = Query(default=None),
    session: Session = Depends(get_session),
):
    # `select` accepted for frontend compatibility; this scaffold returns full records.
    query = select(Product).where(Product.category.in_(FASHION_CATEGORIES))
    items = session.exec(query).all()
    if limit and limit > 0:
        items = items[:limit]
    return {
        "products": [item.model_dump() for item in items],
        "total": len(items),
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
