import os
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine

# Ensure backend package is importable and use isolated DB before app imports.
BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

os.environ.setdefault("DATABASE_URL", "sqlite:///./test-shirtstore.db")
os.environ.setdefault("SECRET_KEY", "test-secret")

from app import db  # noqa: E402
from app.db import get_session  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture()
def client(tmp_path, monkeypatch):
    db_path = tmp_path / "test.db"
    test_engine = create_engine(
        f"sqlite:///{db_path}", connect_args={"check_same_thread": False}
    )
    monkeypatch.setattr(db, "engine", test_engine)
    monkeypatch.setattr(db, "DATABASE_URL", f"sqlite:///{db_path}")

    SQLModel.metadata.create_all(test_engine)
    db.seed_products_if_empty()

    def override_get_session():
        with Session(test_engine) as session:
            yield session

    app.dependency_overrides[get_session] = override_get_session
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def auth_headers(client: TestClient, email: str, password: str, full_name: str = "User"):
    reg = client.post(
        "/auth/register",
        json={"email": email, "password": password, "fullName": full_name},
    )
    if reg.status_code == 201:
        token = reg.json()["access_token"]
    else:
        login = client.post("/auth/login", json={"email": email, "password": password})
        assert login.status_code == 200, login.text
        token = login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
