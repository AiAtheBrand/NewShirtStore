from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select

from app.auth import effective_role, get_current_user, get_current_user_optional, require_admin
from app.db import get_session
from app.models import Order, Product, User, utc_now
from app.schemas import OrderDraft

router = APIRouter(prefix="/orders", tags=["orders"])

ALLOWED_STATUSES = {"submitted", "confirmed", "cancelled", "fulfilled"}


class OrderStatusUpdate(BaseModel):
    status: str


@router.post("", status_code=201)
def create_order(
    draft: OrderDraft,
    idempotency_key: str | None = Header(default=None, alias="Idempotency-Key"),
    session: Session = Depends(get_session),
    current_user: User | None = Depends(get_current_user_optional),
):
    if draft.status != "draft":
        raise HTTPException(status_code=400, detail="A valid order draft is required.")
    if not draft.items:
        raise HTTPException(status_code=400, detail="Order draft must include at least one item.")

    key = idempotency_key.strip() if idempotency_key else None
    if key:
        existing = session.exec(
            select(Order).where(Order.idempotency_key == key)
        ).first()
        if existing:
            if current_user and existing.user_id not in (None, current_user.id):
                raise HTTPException(status_code=403, detail="Idempotency key conflict.")
            return existing.model_dump()

    # Validate items and stock, decrement stock.
    product_ids = [item.productId for item in draft.items]
    products = session.exec(select(Product).where(Product.id.in_(product_ids))).all()
    products_by_id = {p.id: p for p in products}

    for item in draft.items:
        product = products_by_id.get(item.productId)
        if not product:
            raise HTTPException(
                status_code=400, detail=f"Product {item.productId} not found."
            )
        qty = max(0, int(item.quantity))
        if qty < 1:
            raise HTTPException(status_code=400, detail="Item quantity must be at least 1.")
        if product.stock < qty:
            raise HTTPException(
                status_code=409,
                detail=f"Insufficient stock for {product.title}.",
            )

    for item in draft.items:
        product = products_by_id[item.productId]
        product.stock = max(0, int(product.stock) - int(item.quantity))
        session.add(product)

    order = Order(
        user_id=current_user.id if current_user else None,
        status="confirmed",
        draft=draft.model_dump(),
        message="Order confirmed.",
        idempotency_key=key,
        created_at=utc_now(),
        updated_at=utc_now(),
    )
    session.add(order)
    session.commit()
    session.refresh(order)
    return order.model_dump()


@router.get("")
def list_orders(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    query = select(Order)
    if effective_role(current_user) != "admin":
        query = query.where(Order.user_id == current_user.id)
    orders = session.exec(query.order_by(Order.id.desc())).all()
    return {"orders": [order.model_dump() for order in orders]}


@router.get("/{order_id}")
def get_order(
    order_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    order = session.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")
    if effective_role(current_user) != "admin" and order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed to access this order.")
    return order.model_dump()


@router.patch("/{order_id}/status")
def update_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    session: Session = Depends(get_session),
    _admin: User = Depends(require_admin),
):
    if payload.status not in ALLOWED_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid order status.")
    order = session.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")

    order.status = payload.status
    order.updated_at = utc_now()
    session.add(order)
    session.commit()
    session.refresh(order)
    return order.model_dump()
