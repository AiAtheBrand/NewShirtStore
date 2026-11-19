from app import auth


def _get_any_product(client):
    res = client.get("/products")
    assert res.status_code == 200
    products = res.json()["products"]
    assert products
    return products[0]


def _draft_for(product, qty=1):
    price = float(product["price"])
    return {
        "customer": {
            "fullName": "Buyer",
            "email": "buyer@example.com",
            "address": "1 Main St",
            "city": "Lagos",
            "phone": "123",
        },
        "items": [
            {
                "productId": product["id"],
                "title": product["title"],
                "price": price,
                "quantity": qty,
                "lineTotal": price * qty,
                "thumbnail": product.get("thumbnail", ""),
                "brand": product.get("brand"),
                "category": product.get("category", ""),
            }
        ],
        "totals": {"subtotal": price * qty, "currency": "USD"},
        "status": "draft",
    }


def test_create_order_validates_stock_and_is_idempotent(client):
    product = _get_any_product(client)
    draft = _draft_for(product, qty=1)
    headers = {"Idempotency-Key": "order-key-1"}
    first = client.post("/orders", json=draft, headers=headers)
    assert first.status_code == 201
    order1 = first.json()
    assert order1["status"] == "confirmed"

    second = client.post("/orders", json=draft, headers=headers)
    assert second.status_code == 201
    assert second.json()["id"] == order1["id"]


def test_list_orders_requires_auth_and_scopes_to_user(client):
    unauth = client.get("/orders")
    assert unauth.status_code == 401

    product = _get_any_product(client)
    # guest order (no auth)
    guest = client.post("/orders", json=_draft_for(product, qty=1))
    assert guest.status_code == 201

    reg = client.post(
        "/auth/register",
        json={"email": "orders@example.com", "password": "password123", "fullName": "O"},
    )
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    mine = client.get("/orders", headers=headers)
    assert mine.status_code == 200
    assert mine.json()["orders"] == []

    # create order for this user
    created = client.post("/orders", json=_draft_for(product, qty=1), headers=headers)
    assert created.status_code == 201
    mine2 = client.get("/orders", headers=headers)
    assert mine2.status_code == 200
    assert len(mine2.json()["orders"]) == 1


def test_order_status_requires_admin(client, monkeypatch):
    product = _get_any_product(client)
    created = client.post("/orders", json=_draft_for(product, qty=1))
    assert created.status_code == 201
    oid = created.json()["id"]

    # user cannot update status (and cannot access guest order)
    reg = client.post(
        "/auth/register",
        json={"email": "status@example.com", "password": "password123", "fullName": "S"},
    )
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    forbidden = client.patch(f"/orders/{oid}/status", json={"status": "fulfilled"}, headers=headers)
    assert forbidden.status_code == 403

    monkeypatch.setattr(auth, "ADMIN_EMAILS", {"admin2@example.com"})
    reg_admin = client.post(
        "/auth/register",
        json={"email": "admin2@example.com", "password": "password123", "fullName": "A"},
    )
    admin_token = reg_admin.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    ok = client.patch(f"/orders/{oid}/status", json={"status": "fulfilled"}, headers=admin_headers)
    assert ok.status_code == 200
    assert ok.json()["status"] == "fulfilled"
