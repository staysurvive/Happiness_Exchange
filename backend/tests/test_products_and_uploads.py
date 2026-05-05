from io import BytesIO

from fastapi.testclient import TestClient


def register_and_login(client: TestClient) -> str:
    client.post(
        "/api/v1/auth/register",
        json={
            "username": "product_user",
            "email": "product_user@example.com",
            "password": "password123",
        },
    )
    login_response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "product_user@example.com",
            "password": "password123",
        },
    )
    return login_response.json()["access_token"]


def upload_test_image(client: TestClient, token: str, filename: str = "test.png") -> str:
    response = client.post(
        "/api/v1/uploads/images",
        headers={"Authorization": f"Bearer {token}"},
        files={"file": (filename, BytesIO(b"fake-image-content"), "image/png")},
    )
    assert response.status_code == 200
    return response.json()["image_url"]


def test_upload_image_success(client: TestClient) -> None:
    token = register_and_login(client)
    image_url = upload_test_image(client, token)
    assert image_url.startswith("/uploads/")


def test_create_product_and_reward_points(client: TestClient) -> None:
    token = register_and_login(client)
    image_url = upload_test_image(client, token)
    headers = {"Authorization": f"Bearer {token}"}

    create_response = client.post(
        "/api/v1/products",
        headers=headers,
        json={
            "title": "下班路上的橘子味天空",
            "description": "今天下班看到一片很温柔的晚霞。",
            "product_type": "beautiful_view",
            "mood_tags": ["治愈", "美好"],
            "price": 15,
            "image_urls": [image_url],
        },
    )

    assert create_response.status_code == 201
    product_id = create_response.json()["id"]

    balance_response = client.get("/api/v1/users/me/balance", headers=headers)
    assert balance_response.status_code == 200
    assert balance_response.json()["points_balance"] == 105

    transactions_response = client.get("/api/v1/users/me/transactions", headers=headers)
    assert transactions_response.status_code == 200
    transaction_types = {item["transaction_type"] for item in transactions_response.json()["items"]}
    assert "product_publish_reward" in transaction_types

    detail_response = client.get(
        f"/api/v1/products/{product_id}",
        headers=headers,
    )
    assert detail_response.status_code == 200
    detail_data = detail_response.json()
    assert detail_data["title"] == "下班路上的橘子味天空"
    assert len(detail_data["images"]) == 1
    assert detail_data["state"]["is_author"] is True
    assert detail_data["state"]["can_purchase"] is False


def test_list_update_and_soft_delete_product(client: TestClient) -> None:
    token = register_and_login(client)
    image_url = upload_test_image(client, token)
    headers = {"Authorization": f"Bearer {token}"}

    create_response = client.post(
        "/api/v1/products",
        headers=headers,
        json={
            "title": "今天被陌生人夸了",
            "description": "心情一下子变好了。",
            "product_type": "happy_moment",
            "mood_tags": ["开心"],
            "price": 5,
            "image_urls": [image_url],
        },
    )
    product_id = create_response.json()["id"]

    list_response = client.get("/api/v1/products")
    assert list_response.status_code == 200
    assert list_response.json()["total"] >= 1

    update_response = client.patch(
        f"/api/v1/products/{product_id}",
        headers=headers,
        json={
            "title": "今天被陌生人夸奖了",
            "price": 8,
            "mood_tags": ["开心", "温暖"],
        },
    )
    assert update_response.status_code == 200
    assert update_response.json()["title"] == "今天被陌生人夸奖了"
    assert update_response.json()["price"] == 8

    delete_response = client.delete(f"/api/v1/products/{product_id}", headers=headers)
    assert delete_response.status_code == 204

    detail_after_delete = client.get(f"/api/v1/products/{product_id}")
    assert detail_after_delete.status_code == 404
