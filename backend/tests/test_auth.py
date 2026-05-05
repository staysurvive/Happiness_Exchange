from fastapi.testclient import TestClient


def test_register_success(client: TestClient) -> None:
    response = client.post(
        "/api/v1/auth/register",
        json={
            "username": "happy_user",
            "email": "user@example.com",
            "password": "password123",
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "happy_user"
    assert data["email"] == "user@example.com"
    assert data["points_balance"] == 100


def test_register_duplicate_email(client: TestClient) -> None:
    payload = {
        "username": "happy_user",
        "email": "user@example.com",
        "password": "password123",
    }
    client.post("/api/v1/auth/register", json=payload)

    response = client.post(
        "/api/v1/auth/register",
        json={
            "username": "happy_user_2",
            "email": "user@example.com",
            "password": "password123",
        },
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "邮箱已被使用"


def test_register_short_username_returns_chinese_message(client: TestClient) -> None:
    response = client.post(
        "/api/v1/auth/register",
        json={
            "username": "ab",
            "email": "user@example.com",
            "password": "password123",
        },
    )

    assert response.status_code == 422
    assert response.json()["detail"] == "账号至少 3 个字符"


def test_register_invalid_email_returns_chinese_message(client: TestClient) -> None:
    response = client.post(
        "/api/v1/auth/register",
        json={
            "username": "happy_user",
            "email": "not-an-email",
            "password": "password123",
        },
    )

    assert response.status_code == 422
    assert response.json()["detail"] == "请输入有效的邮箱地址"


def test_register_short_password_returns_chinese_message(client: TestClient) -> None:
    response = client.post(
        "/api/v1/auth/register",
        json={
            "username": "happy_user",
            "email": "user@example.com",
            "password": "short",
        },
    )

    assert response.status_code == 422
    assert response.json()["detail"] == "密码至少 8 个字符"


def test_login_and_get_current_user(client: TestClient) -> None:
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
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]

    me_response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    user_me_response = client.get(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert me_response.status_code == 200
    data = me_response.json()
    assert data["username"] == "happy_user"
    assert data["email"] == "user@example.com"
    assert data["points_balance"] == 100
    assert data["created_at"] is not None
    assert "password_hash" not in data

    assert user_me_response.status_code == 200
    assert user_me_response.json()["id"] == data["id"]


def test_login_invalid_password(client: TestClient) -> None:
    client.post(
        "/api/v1/auth/register",
        json={
            "username": "happy_user",
            "email": "user@example.com",
            "password": "password123",
        },
    )

    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "user@example.com",
            "password": "wrongpass123",
        },
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "邮箱或密码错误"
