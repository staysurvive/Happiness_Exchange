from fastapi.testclient import TestClient


def register_and_login(client: TestClient) -> str:
    client.post(
        "/api/v1/auth/register",
        json={
            "username": "happy_user",
            "email": "user@example.com",
            "password": "password123",
        },
    )
    login_response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "user@example.com",
            "password": "password123",
        },
    )
    return login_response.json()["access_token"]


def test_register_creates_register_bonus_transaction(client: TestClient) -> None:
    token = register_and_login(client)

    points_response = client.get(
        "/api/v1/users/me/points",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert points_response.status_code == 200
    data = points_response.json()
    assert data["points_balance"] == 100
    assert data["total"] == 1
    assert len(data["point_transactions"]) == 1
    assert data["point_transactions"][0]["amount"] == 100
    assert data["point_transactions"][0]["transaction_type"] == "register_bonus"


def test_checkin_success_and_duplicate_same_day(client: TestClient) -> None:
    token = register_and_login(client)
    headers = {"Authorization": f"Bearer {token}"}

    response = client.post("/api/v1/checkins", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["checked_in"] is True
    assert data["reward_points"] == 10
    assert data["points_balance"] == 110

    duplicate_response = client.post("/api/v1/checkins", headers=headers)
    assert duplicate_response.status_code == 409
    assert duplicate_response.json()["detail"] == "今天已经签到过了"


def test_checkin_status_and_transactions(client: TestClient) -> None:
    token = register_and_login(client)
    headers = {"Authorization": f"Bearer {token}"}

    client.post("/api/v1/checkins", headers=headers)

    status_response = client.get("/api/v1/checkins/me", headers=headers)
    assert status_response.status_code == 200
    status_data = status_response.json()
    assert status_data["checked_in_today"] is True
    assert status_data["latest_checkin_date"] is not None
    assert status_data["latest_checkin"] is not None
    assert status_data["points_balance"] == 110
    assert status_data["reward_points"] == 10

    transactions_response = client.get("/api/v1/users/me/transactions", headers=headers)
    assert transactions_response.status_code == 200
    items = transactions_response.json()["items"]
    assert len(items) == 2
    assert {item["transaction_type"] for item in items} == {
        "register_bonus",
        "checkin_reward",
    }


def test_get_balance_endpoint(client: TestClient) -> None:
    token = register_and_login(client)
    headers = {"Authorization": f"Bearer {token}"}

    client.post("/api/v1/checkins", headers=headers)
    response = client.get("/api/v1/users/me/balance", headers=headers)

    assert response.status_code == 200
    assert response.json()["points_balance"] == 110
