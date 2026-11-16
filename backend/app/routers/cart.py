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
