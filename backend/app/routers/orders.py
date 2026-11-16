from fastapi import APIRouter, HTTPException

from app.data import ORDERS, next_order_id
from app.schemas import OrderDraft

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("", status_code=201)
def create_order(draft: OrderDraft):
    if draft.status != "draft":
        raise HTTPException(status_code=400, detail="A valid order draft is required.")
    if not draft.items:
        raise HTTPException(status_code=400, detail="Order draft must include at least one item.")

    order = {
        "id": next_order_id(),
        "status": "submitted",
        "draft": draft.model_dump(),
        "message": "Order received.",
    }
    ORDERS.append(order)
    return order


@router.get("")
def list_orders():
    return {"orders": ORDERS}
