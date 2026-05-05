from io import BytesIO

from fastapi.testclient import TestClient


def register_and_login(client: TestClient, username: str, email: str) -> str:
    client.post(
        "/api/v1/auth/register",
        json={
            "username": username,
            "email": email,
            "password": "password123",
        },
    )
    login_response = client.post(
        "/api/v1/auth/login",
        json={
            "email": email,
            "password": "password123",
        },
    )
    return login_response.json()["access_token"]


def upload_image(client: TestClient, token: str, filename: str = "demo.png") -> str:
    response = client.post(
        "/api/v1/uploads/images",
        headers={"Authorization": f"Bearer {token}"},
        files={"file": (filename, BytesIO(b"image"), "image/png")},
    )
    return response.json()["image_url"]


def create_product(client: TestClient, token: str, *, title: str = "今日小确幸", price: int = 15) -> int:
    image_url = upload_image(client, token)
    response = client.post(
        "/api/v1/products",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "title": title,
            "description": "很开心的一天。",
            "product_type": "happy_moment",
            "mood_tags": ["开心"],
            "price": price,
            "image_urls": [image_url],
        },
    )
    return response.json()["id"]


def test_purchase_product_success_and_records(client: TestClient) -> None:
    seller_token = register_and_login(client, "seller", "seller@example.com")
    buyer_token = register_and_login(client, "buyer", "buyer@example.com")
    product_id = create_product(client, seller_token, price=15)

    response = client.post(
        f"/api/v1/products/{product_id}/purchase",
        headers={"Authorization": f"Bearer {buyer_token}"},
    )
    assert response.status_code == 200
    assert response.json()["purchased"] is True
    assert response.json()["points_balance"] == 85

    seller_balance = client.get(
        "/api/v1/users/me/balance",
        headers={"Authorization": f"Bearer {seller_token}"},
    )
    assert seller_balance.json()["points_balance"] == 120

    buyer_purchases = client.get(
        "/api/v1/users/me/purchases",
        headers={"Authorization": f"Bearer {buyer_token}"},
    )
    assert buyer_purchases.status_code == 200
    assert buyer_purchases.json()["total"] == 1
    assert len(buyer_purchases.json()["items"]) == 1


def test_purchase_rules_self_duplicate_insufficient_deleted(client: TestClient) -> None:
    seller_token = register_and_login(client, "seller2", "seller2@example.com")
    buyer_token = register_and_login(client, "buyer2", "buyer2@example.com")
    expensive_product_id = create_product(client, seller_token, title="昂贵快乐", price=200)
    normal_product_id = create_product(client, seller_token, title="普通快乐", price=10)

    self_purchase = client.post(
        f"/api/v1/products/{normal_product_id}/purchase",
        headers={"Authorization": f"Bearer {seller_token}"},
    )
    assert self_purchase.status_code == 400

    insufficient = client.post(
        f"/api/v1/products/{expensive_product_id}/purchase",
        headers={"Authorization": f"Bearer {buyer_token}"},
    )
    assert insufficient.status_code == 400

    first_purchase = client.post(
        f"/api/v1/products/{normal_product_id}/purchase",
        headers={"Authorization": f"Bearer {buyer_token}"},
    )
    assert first_purchase.status_code == 200

    duplicate_purchase = client.post(
        f"/api/v1/products/{normal_product_id}/purchase",
        headers={"Authorization": f"Bearer {buyer_token}"},
    )
    assert duplicate_purchase.status_code == 409

    seller_headers = {"Authorization": f"Bearer {seller_token}"}
    delete_response = client.delete(f"/api/v1/products/{expensive_product_id}", headers=seller_headers)
    assert delete_response.status_code == 204

    deleted_purchase = client.post(
        f"/api/v1/products/{expensive_product_id}/purchase",
        headers={"Authorization": f"Bearer {buyer_token}"},
    )
    assert deleted_purchase.status_code == 404


def test_like_collection_comment_and_happy_score(client: TestClient) -> None:
    seller_token = register_and_login(client, "seller3", "seller3@example.com")
    user_token = register_and_login(client, "user3", "user3@example.com")
    product_id = create_product(client, seller_token, title="治愈瞬间", price=10)
    headers = {"Authorization": f"Bearer {user_token}"}

    like = client.post(f"/api/v1/products/{product_id}/like", headers=headers)
    assert like.status_code == 200

    collect = client.post(f"/api/v1/products/{product_id}/collection", headers=headers)
    assert collect.status_code == 200

    comment = client.post(
        f"/api/v1/products/{product_id}/comments",
        headers=headers,
        json={"content": "看到这个心情好多了"},
    )
    assert comment.status_code == 200
    comment_id = comment.json()["id"]

    detail = client.get(
        f"/api/v1/products/{product_id}",
        headers=headers,
    )
    detail_data = detail.json()
    assert detail_data["like_count"] == 1
    assert detail_data["collection_count"] == 1
    assert detail_data["comment_count"] == 1
    assert detail_data["happy_score"] == 5
    assert detail_data["state"]["is_liked"] is True
    assert detail_data["state"]["is_collected"] is True

    comments = client.get(
        f"/api/v1/products/{product_id}/comments",
        headers=headers,
    )
    assert comments.status_code == 200
    assert comments.json()["total"] == 1
    assert comments.json()["items"][0]["is_mine"] is True

    delete_comment = client.delete(
        f"/api/v1/comments/{comment_id}",
        headers=headers,
    )
    assert delete_comment.status_code == 204

    unlike = client.delete(f"/api/v1/products/{product_id}/like", headers=headers)
    uncollect = client.delete(f"/api/v1/products/{product_id}/collection", headers=headers)
    assert unlike.status_code == 204
    assert uncollect.status_code == 204

    detail_after = client.get(
        f"/api/v1/products/{product_id}",
        headers=headers,
    )
    data_after = detail_after.json()
    assert data_after["comment_count"] == 0
    assert data_after["like_count"] == 0
    assert data_after["collection_count"] == 0
    assert data_after["happy_score"] == 0


def test_my_products_and_my_collections(client: TestClient) -> None:
    seller_token = register_and_login(client, "seller4", "seller4@example.com")
    user_token = register_and_login(client, "user4", "user4@example.com")
    product_id = create_product(client, seller_token, title="收藏一下", price=6)

    collect = client.post(
        f"/api/v1/products/{product_id}/collection",
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert collect.status_code == 200

    my_products = client.get(
        "/api/v1/users/me/products",
        headers={"Authorization": f"Bearer {seller_token}"},
    )
    assert my_products.status_code == 200
    assert my_products.json()["total"] >= 1

    my_collections = client.get(
        "/api/v1/users/me/collections",
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert my_collections.status_code == 200
    assert my_collections.json()["total"] == 1
