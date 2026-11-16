from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel, Field
from sqlmodel import Session, select

from app.auth import get_current_user_optional
from app.db import get_session
from app.models import Cart, User, utc_now

router = APIRouter(prefix="/cart", tags=["cart"])


class CartPayload(BaseModel):
    items: list[dict] = Field(default_factory=list)


def resolve_cart(
    session: Session, user: User | None, session_key: str | None
) -> Cart:
    if user:
        cart = session.exec(select(Cart).where(Cart.user_id == user.id)).first()
        if cart:
            return cart
        cart = Cart(user_id=user.id, session_key=None, items=[])
        session.add(cart)
        session.commit()
        session.refresh(cart)
        return cart

    if not session_key or not session_key.strip():
        raise HTTPException(
            status_code=400, detail="X-Cart-Session header or authentication is required."
        )
    key = session_key.strip()
    cart = session.exec(select(Cart).where(Cart.session_key == key)).first()
    if cart:
        return cart
    cart = Cart(session_key=key, user_id=None, items=[])
    session.add(cart)
    session.commit()
    session.refresh(cart)
    return cart


@router.get("")
def get_cart(
    x_cart_session: str | None = Header(default=None),
    session: Session = Depends(get_session),
    current_user: User | None = Depends(get_current_user_optional),
):
    cart = resolve_cart(session, current_user, x_cart_session)
    return {"items": cart.items, "updatedAt": cart.updated_at}


@router.put("")
def put_cart(
    payload: CartPayload,
    x_cart_session: str | None = Header(default=None),
    session: Session = Depends(get_session),
    current_user: User | None = Depends(get_current_user_optional),
):
    cart = resolve_cart(session, current_user, x_cart_session)
    cart.items = payload.items
    cart.updated_at = utc_now()
    session.add(cart)
    session.commit()
    session.refresh(cart)
    return {"items": cart.items, "updatedAt": cart.updated_at}


@router.delete("")
def clear_cart(
    x_cart_session: str | None = Header(default=None),
    session: Session = Depends(get_session),
    current_user: User | None = Depends(get_current_user_optional),
):
    cart = resolve_cart(session, current_user, x_cart_session)
    cart.items = []
    cart.updated_at = utc_now()
    session.add(cart)
    session.commit()
    return {"items": [], "updatedAt": cart.updated_at}


@router.post("/merge")
def merge_cart(
    payload: CartPayload,
    x_cart_session: str | None = Header(default=None),
    session: Session = Depends(get_session),
    current_user: User | None = Depends(get_current_user_optional),
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required to merge carts.")

    user_cart = resolve_cart(session, current_user, None)
    by_id = {int(item.get("id")): dict(item) for item in user_cart.items if item.get("id") is not None}

    incoming = payload.items or []
    # Also merge guest session cart if present.
    if x_cart_session and x_cart_session.strip():
        guest = session.exec(select(Cart).where(Cart.session_key == x_cart_session.strip())).first()
        if guest and guest.items:
            incoming = [*guest.items, *incoming]

    for item in incoming:
        pid = item.get("id")
        if pid is None:
            continue
        pid = int(pid)
        qty = int(item.get("quantity") or 0)
        if qty < 1:
            continue
        stock = item.get("stock")
        try:
            stock_limit = max(0, int(stock)) if stock is not None else qty
        except Exception:
            stock_limit = qty
        if stock_limit <= 0:
            continue
        qty = min(qty, stock_limit)

        if pid in by_id:
            existing = by_id[pid]
            existing_stock = existing.get("stock", stock_limit)
            try:
                existing_limit = max(0, int(existing_stock)) if existing_stock is not None else qty
            except Exception:
                existing_limit = qty
            existing["quantity"] = min(int(existing.get("quantity") or 0) + qty, existing_limit or qty)
        else:
            merged = dict(item)
            merged["id"] = pid
            merged["quantity"] = qty
            by_id[pid] = merged

    user_cart.items = list(by_id.values())
    user_cart.updated_at = utc_now()
    session.add(user_cart)

    # Clear guest cart after merge.
    if x_cart_session and x_cart_session.strip():
        guest = session.exec(select(Cart).where(Cart.session_key == x_cart_session.strip())).first()
        if guest:
            guest.items = []
            guest.updated_at = utc_now()
            session.add(guest)

    session.commit()
    session.refresh(user_cart)
    return {"items": user_cart.items, "updatedAt": user_cart.updated_at}
