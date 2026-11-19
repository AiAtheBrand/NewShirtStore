from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.auth import (
    authenticate_user,
    create_access_token,
    effective_role,
    get_current_user,
    get_user_by_email,
    hash_password,
)
from app.db import get_session
from app.models import User
from app.schemas import Token, UserCreate, UserLogin, UserPublic

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=Token, status_code=201)
def register(payload: UserCreate, session: Session = Depends(get_session)):
    email = payload.email.strip().lower()
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="A valid email is required.")
    if len(payload.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")
    if get_user_by_email(session, email):
        raise HTTPException(status_code=400, detail="Email is already registered.")

    user = User(
        email=email,
        full_name=payload.fullName.strip(),
        hashed_password=hash_password(payload.password),
    )
    if effective_role(user) == "admin":
        user.role = "admin"
    session.add(user)
    session.commit()
    session.refresh(user)

    token = create_access_token(user.id)
    return Token(
        access_token=token,
        user=UserPublic(
            id=user.id, email=user.email, fullName=user.full_name, role=effective_role(user)
        ),
    )


@router.post("/login", response_model=Token)
def login(payload: UserLogin, session: Session = Depends(get_session)):
    user = authenticate_user(session, payload.email.strip().lower(), payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )
    token = create_access_token(user.id)
    return Token(
        access_token=token,
        user=UserPublic(
            id=user.id, email=user.email, fullName=user.full_name, role=effective_role(user)
        ),
    )


@router.get("/me", response_model=UserPublic)
def me(current_user: User = Depends(get_current_user)):
    return UserPublic(
        id=current_user.id,
        email=current_user.email,
        fullName=current_user.full_name,
        role=effective_role(current_user),
    )
