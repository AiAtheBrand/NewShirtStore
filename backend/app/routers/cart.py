from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel, Field
from sqlmodel import Session, select

from app.db import get_session
from app.models import Cart, utc_now

router = APIRouter(prefix="/cart", tags=["cart"])


class CartPayload(BaseModel):
    items: list[dict] = Field(default_factory=list)


def get_or_create_cart(session: Session, session_key: str) -> Cart:
    cart = session.exec(select(Cart).where(Cart.session_key == session_key)).first()
    if cart:
        return cart
    cart = Cart(session_key=session_key, items=[])
    session.add(cart)
    session.commit()
    session.refresh(cart)
    return cart


def require_session_key(x_cart_session: str | None) -> str:
    if not x_cart_session or not x_cart_session.strip():
        raise HTTPException(status_code=400, detail="X-Cart-Session header is required.")
    return x_cart_session.strip()


@router.get("")
def get_cart(
    x_cart_session: str | None = Header(default=None),
    session: Session = Depends(get_session),
):
    key = require_session_key(x_cart_session)
    cart = get_or_create_cart(session, key)
    return {"items": cart.items, "updatedAt": cart.updated_at}


@router.put("")
def put_cart(
    payload: CartPayload,
    x_cart_session: str | None = Header(default=None),
    session: Session = Depends(get_session),
):
    key = require_session_key(x_cart_session)
    cart = get_or_create_cart(session, key)
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
):
    key = require_session_key(x_cart_session)
    cart = get_or_create_cart(session, key)
    cart.items = []
    cart.updated_at = utc_now()
    session.add(cart)
    session.commit()
    return {"items": [], "updatedAt": cart.updated_at}
