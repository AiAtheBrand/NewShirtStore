from fastapi import APIRouter, HTTPException, Query

from app.data import PRODUCTS, PRODUCTS_BY_ID, FASHION_CATEGORIES

router = APIRouter(prefix="/products", tags=["products"])


@router.get("")
def list_products(
    limit: int = Query(default=0, ge=0),
    select: str | None = Query(default=None),
):
    # `select` accepted for frontend compatibility; this scaffold returns full records.
    items = [p for p in PRODUCTS if p["category"] in FASHION_CATEGORIES]
    if limit and limit > 0:
        items = items[:limit]
    return {"products": items, "total": len(items), "skip": 0, "limit": limit or len(items)}


@router.get("/{product_id}")
def get_product(product_id: int, select: str | None = Query(default=None)):
    product = PRODUCTS_BY_ID.get(product_id)
    if not product or product["category"] not in FASHION_CATEGORIES:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
