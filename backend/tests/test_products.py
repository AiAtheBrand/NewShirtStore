from app import auth


def test_list_products_public(client):
    res = client.get("/products")
    assert res.status_code == 200
    body = res.json()
    assert "products" in body
    assert isinstance(body["products"], list)


def test_product_mutations_require_admin(client):
    payload = {
        "title": "Test Shirt",
        "description": "x",
        "price": 10,
        "category": "mens-shirts",
        "thumbnail": "https://example.com/t.jpg",
        "images": ["https://example.com/t.jpg"],
        "stock": 5,
    }
    created = client.post("/products", json=payload)
    assert created.status_code in (401, 403)

    # As regular user
    reg = client.post(
        "/auth/register",
        json={"email": "u@example.com", "password": "password123", "fullName": "U"},
    )
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    created_user = client.post("/products", json=payload, headers=headers)
    assert created_user.status_code == 403


def test_admin_can_create_update_delete_product(client, monkeypatch):
    monkeypatch.setattr(auth, "ADMIN_EMAILS", {"admin@example.com"})
    reg = client.post(
        "/auth/register",
        json={"email": "admin@example.com", "password": "password123", "fullName": "Admin"},
    )
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "title": "Admin Product",
        "description": "managed",
        "price": 20,
        "category": "mens-shirts",
        "thumbnail": "https://example.com/t.jpg",
        "images": ["https://example.com/t.jpg"],
        "stock": 3,
    }
    created = client.post("/products", json=payload, headers=headers)
    assert created.status_code == 201
    pid = created.json()["id"]

    updated = client.put(
        f"/products/{pid}",
        json={**payload, "title": "Updated Admin Product", "price": 25},
        headers=headers,
    )
    assert updated.status_code == 200
    assert updated.json()["title"] == "Updated Admin Product"

    deleted = client.delete(f"/products/{pid}", headers=headers)
    assert deleted.status_code == 204
