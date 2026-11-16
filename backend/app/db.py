import os
from collections.abc import Generator

from sqlmodel import Session, SQLModel, create_engine, select

from app.data import PRODUCTS
from app.models import Cart, Order, Product

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./shirtstore.db")
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, echo=False, connect_args=connect_args)


def init_db() -> None:
    SQLModel.metadata.create_all(engine)
    seed_products_if_empty()


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session


def seed_products_if_empty() -> None:
    with Session(engine) as session:
        existing = session.exec(select(Product.id).limit(1)).first()
        if existing is not None:
            return

        for item in PRODUCTS:
            session.add(Product(**item))
        session.commit()
