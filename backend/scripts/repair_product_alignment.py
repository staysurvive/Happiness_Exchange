from __future__ import annotations

from sqlalchemy import select

from app.core.database import SessionLocal
from app.models.emotion_product import EmotionProduct
from app.models.product_comment import ProductComment
from app.models.user import User
from app.repositories.product_repository import ProductRepository
from seed_demo_content import DEMO_IMAGES, LEGACY_PRODUCT_TITLES, PRODUCTS, USERS


TEST_PRODUCT_REPAIRS = [
    {
        "current_title": "愿你在平凡日子里，也能找到小小的光。",
        "title": "两只小家伙在秋千上认真发呆",
        "description": "它们并排坐着，一本正经得像在替今天守住一点软乎乎的天真。看到这种小小的陪伴感，会让人觉得平凡日子也能发光。",
        "product_type": "cute_pet",
        "mood_tags": ["可爱", "温暖", "美好"],
    },
]

COMMENT_REPAIRS = [
    (
        "leaf_dog",
        "已经自动脑补它叼着树叶冲过来的样子了。",
        "这个抬头看人的瞬间，真的会让人一下子心软下来。",
    ),
    (
        "traffic_light_cloud",
        "这种抬头就被取悦的时刻我也很喜欢。",
        "这种被晚霞和云轻轻安慰一下的时刻我也很喜欢。",
    ),
]


def get_user_by_email(db, email: str) -> User | None:
    stmt = select(User).where(User.email == email)
    return db.execute(stmt).scalar_one_or_none()


def get_product_by_titles(db, author_id: int, titles: list[str]) -> EmotionProduct | None:
    stmt = select(EmotionProduct).where(
        EmotionProduct.author_id == author_id,
        EmotionProduct.title.in_(titles),
    )
    return db.execute(stmt).scalar_one_or_none()


def repair_demo_products(db) -> int:
    repo = ProductRepository(db)
    repaired = 0
    users_by_name: dict[str, User] = {}

    for seed_user in USERS:
        user = get_user_by_email(db, seed_user.email)
        if user is not None:
            users_by_name[seed_user.username] = user

    for seed in PRODUCTS:
        author = users_by_name.get(seed.author)
        if author is None:
            continue
        titles = [seed.title, *LEGACY_PRODUCT_TITLES.get(seed.key, [])]
        product = get_product_by_titles(db, author.id, titles)
        if product is None:
            continue

        image_urls = [DEMO_IMAGES[key] for key in seed.image_keys]
        changed = False

        if product.title != seed.title:
            product.title = seed.title
            changed = True
        if product.description != seed.description:
            product.description = seed.description
            changed = True
        if product.product_type != seed.product_type:
            product.product_type = seed.product_type
            changed = True
        if product.mood_tags != seed.mood_tags:
            product.mood_tags = seed.mood_tags
            changed = True
        if product.cover_image_url != image_urls[0]:
            product.cover_image_url = image_urls[0]
            changed = True

        current_images = [image.image_url for image in repo.list_images(product.id)]
        if current_images != image_urls:
            repo.replace_images(product.id, image_urls)
            changed = True

        if changed:
            repaired += 1

    return repaired


def repair_test_products(db) -> int:
    repaired = 0
    for item in TEST_PRODUCT_REPAIRS:
        stmt = select(EmotionProduct).where(EmotionProduct.title == item["current_title"])
        product = db.execute(stmt).scalar_one_or_none()
        if product is None:
            continue

        changed = False
        if product.title != item["title"]:
            product.title = item["title"]
            changed = True
        if product.description != item["description"]:
            product.description = item["description"]
            changed = True
        if product.product_type != item["product_type"]:
            product.product_type = item["product_type"]
            changed = True
        if product.mood_tags != item["mood_tags"]:
            product.mood_tags = item["mood_tags"]
            changed = True

        if changed:
            repaired += 1

    return repaired


def repair_comments(db) -> int:
    repaired = 0
    users_by_name = {seed_user.username: get_user_by_email(db, seed_user.email) for seed_user in USERS}

    for product_key, old_content, new_content in COMMENT_REPAIRS:
        seed = next(item for item in PRODUCTS if item.key == product_key)
        author = users_by_name.get(seed.author)
        if author is None:
            continue
        titles = [seed.title, *LEGACY_PRODUCT_TITLES.get(seed.key, [])]
        product = get_product_by_titles(db, author.id, titles)
        if product is None:
            continue

        stmt = select(ProductComment).where(
            ProductComment.product_id == product.id,
            ProductComment.content == old_content,
            ProductComment.is_deleted.is_(False),
        )
        comment = db.execute(stmt).scalar_one_or_none()
        if comment is None:
            continue
        comment.content = new_content
        repaired += 1

    return repaired


def main() -> None:
    db = SessionLocal()
    try:
        demo_products = repair_demo_products(db)
        test_products = repair_test_products(db)
        comments = repair_comments(db)
        db.commit()

        print("Product alignment repaired.")
        print(f"Demo products updated: {demo_products}")
        print(f"Test products updated: {test_products}")
        print(f"Comments updated: {comments}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
