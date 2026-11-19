import os
from collections.abc import Generator

from sqlalchemy import text
from sqlmodel import Session, SQLModel, create_engine, select

from app.data import PRODUCTS
from app.models import Cart, Order, Product

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./shirtstore.db")
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, echo=False, connect_args=connect_args)


def _ensure_sqlite_schema() -> None:
    if not DATABASE_URL.startswith("sqlite"):
        return
    with engine.begin() as conn:
        # Best-effort additive migrations for local SQLite dev DBs.
        try:
            cols = [row[1] for row in conn.exec_driver_sql("PRAGMA table_info(user)").fetchall()]
            if cols and "role" not in cols:
                conn.exec_driver_sql(
                    "ALTER TABLE user ADD COLUMN role VARCHAR NOT NULL DEFAULT 'customer'"
                )
        except Exception:
            pass


def init_db() -> None:
    SQLModel.metadata.create_all(engine)
    _ensure_sqlite_schema()
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
