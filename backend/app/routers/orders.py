from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.db import get_session
from app.models import Order
from app.schemas import OrderDraft

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("", status_code=201)
def create_order(draft: OrderDraft, session: Session = Depends(get_session)):
    if draft.status != "draft":
        raise HTTPException(status_code=400, detail="A valid order draft is required.")
    if not draft.items:
        raise HTTPException(status_code=400, detail="Order draft must include at least one item.")

    order = Order(status="submitted", draft=draft.model_dump(), message="Order received.")
    session.add(order)
    session.commit()
    session.refresh(order)
    return order.model_dump()


@router.get("")
def list_orders(session: Session = Depends(get_session)):
    orders = session.exec(select(Order)).all()
    return {"orders": [order.model_dump() for order in orders]}
