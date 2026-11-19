def test_guest_cart_crud_with_session_header(client):
    headers = {"X-Cart-Session": "guest-session-1"}
    got = client.get("/cart", headers=headers)
    assert got.status_code == 200
    assert got.json()["items"] == []

    items = [{"id": 1, "title": "Shirt", "quantity": 2, "stock": 5, "price": 10}]
    put = client.put("/cart", json={"items": items}, headers=headers)
    assert put.status_code == 200
    assert put.json()["items"][0]["quantity"] == 2

    got2 = client.get("/cart", headers=headers)
    assert got2.status_code == 200
    assert len(got2.json()["items"]) == 1

    cleared = client.delete("/cart", headers=headers)
    assert cleared.status_code == 200
    assert cleared.json()["items"] == []


def test_cart_merge_requires_auth_and_merges_guest_cart(client):
    # seed guest cart
    guest_headers = {"X-Cart-Session": "guest-session-2"}
    client.put(
        "/cart",
        json={"items": [{"id": 10, "quantity": 1, "stock": 5}]},
        headers=guest_headers,
    )

    # unauthenticated merge rejected
    denied = client.post("/cart/merge", json={"items": []}, headers=guest_headers)
    assert denied.status_code == 401

    # authenticated merge
    reg = client.post(
        "/auth/register",
        json={"email": "merge@example.com", "password": "password123", "fullName": "M"},
    )
    token = reg.json()["access_token"]
    auth = {"Authorization": f"Bearer {token}", "X-Cart-Session": "guest-session-2"}
    merged = client.post(
        "/cart/merge",
        json={"items": [{"id": 10, "quantity": 2, "stock": 5}, {"id": 11, "quantity": 1, "stock": 3}]},
        headers=auth,
    )
    assert merged.status_code == 200
    items = {i["id"]: i for i in merged.json()["items"]}
    assert items[10]["quantity"] == 3  # 1 guest + 2 incoming, capped by stock
    assert items[11]["quantity"] == 1
