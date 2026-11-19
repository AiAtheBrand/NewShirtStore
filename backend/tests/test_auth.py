def test_register_login_and_me(client):
    res = client.post(
        "/auth/register",
        json={"email": "user@example.com", "password": "password123", "fullName": "Test User"},
    )
    assert res.status_code == 201
    data = res.json()
    assert data["user"]["email"] == "user@example.com"
    assert data["user"]["role"] == "customer"
    token = data["access_token"]

    me = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["email"] == "user@example.com"

    login = client.post(
        "/auth/login", json={"email": "user@example.com", "password": "password123"}
    )
    assert login.status_code == 200
    assert login.json()["access_token"]


def test_register_rejects_short_password(client):
    res = client.post(
        "/auth/register",
        json={"email": "short@example.com", "password": "short", "fullName": "X"},
    )
    assert res.status_code in (400, 422)
