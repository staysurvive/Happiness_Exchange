from sqlalchemy import String, cast, desc, func, or_, select
from sqlalchemy.orm import Session

from app.models.emotion_product import EmotionProduct
from app.models.product_collection import ProductCollection
from app.models.product_image import ProductImage
from app.models.product_like import ProductLike
from app.models.purchase import Purchase


class ProductRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_product(
        self,
        *,
        author_id: int,
        title: str,
        description: str,
        product_type: str,
        mood_tags: list[str],
        price: int,
        image_urls: list[str],
    ) -> EmotionProduct:
        product = EmotionProduct(
            author_id=author_id,
            title=title,
            description=description,
            product_type=product_type,
            mood_tags=mood_tags,
            price=price,
            cover_image_url=image_urls[0] if image_urls else None,
        )
        self.db.add(product)
        self.db.flush()

        for index, image_url in enumerate(image_urls):
            self.db.add(
                ProductImage(
                    product_id=product.id,
                    image_url=image_url,
                    sort_order=index,
                )
            )
        self.db.flush()
        return product

    def get_product_by_id(self, product_id: int) -> EmotionProduct | None:
        return self.db.get(EmotionProduct, product_id)

    def list_images(self, product_id: int) -> list[ProductImage]:
        stmt = (
            select(ProductImage)
            .where(ProductImage.product_id == product_id)
            .order_by(ProductImage.sort_order.asc(), ProductImage.id.asc())
        )
        return list(self.db.execute(stmt).scalars().all())

    def replace_images(self, product_id: int, image_urls: list[str]) -> list[ProductImage]:
        self.db.query(ProductImage).filter(ProductImage.product_id == product_id).delete()
        for index, image_url in enumerate(image_urls):
            self.db.add(
                ProductImage(
                    product_id=product_id,
                    image_url=image_url,
                    sort_order=index,
                )
            )
        self.db.flush()
        return self.list_images(product_id)

    def list_products(
        self,
        *,
        product_type: str | None = None,
        mood_tag: str | None = None,
        min_price: int | None = None,
        max_price: int | None = None,
        sort: str = "latest",
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[EmotionProduct], int]:
        stmt = select(EmotionProduct).where(EmotionProduct.status == "published")
        count_stmt = select(func.count()).select_from(EmotionProduct).where(
            EmotionProduct.status == "published"
        )

        if product_type is not None:
            stmt = stmt.where(EmotionProduct.product_type == product_type)
            count_stmt = count_stmt.where(EmotionProduct.product_type == product_type)

        if mood_tag is not None:
            condition = cast(EmotionProduct.mood_tags, String).like(f'%"{mood_tag}"%')
            stmt = stmt.where(condition)
            count_stmt = count_stmt.where(condition)

        if min_price is not None:
            stmt = stmt.where(EmotionProduct.price >= min_price)
            count_stmt = count_stmt.where(EmotionProduct.price >= min_price)

        if max_price is not None:
            stmt = stmt.where(EmotionProduct.price <= max_price)
            count_stmt = count_stmt.where(EmotionProduct.price <= max_price)

        order_map = {
            "latest": EmotionProduct.created_at.desc(),
            "popular": desc(EmotionProduct.purchase_count),
            "price_asc": EmotionProduct.price.asc(),
            "price_desc": EmotionProduct.price.desc(),
            "happy_score": desc(EmotionProduct.happy_score),
        }
        stmt = stmt.order_by(
            order_map.get(sort, EmotionProduct.created_at.desc()),
            EmotionProduct.id.desc(),
        )
        stmt = stmt.offset((page - 1) * page_size).limit(page_size)

        items = list(self.db.execute(stmt).scalars().all())
        total = self.db.execute(count_stmt).scalar_one()
        return items, total

    def list_by_author(
        self,
        author_id: int,
        *,
        page: int,
        page_size: int,
    ) -> tuple[list[EmotionProduct], int]:
        total_stmt = select(func.count()).select_from(EmotionProduct).where(
            EmotionProduct.author_id == author_id
        )
        stmt = (
            select(EmotionProduct)
            .where(EmotionProduct.author_id == author_id)
            .order_by(EmotionProduct.created_at.desc(), EmotionProduct.id.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        total = self.db.execute(total_stmt).scalar_one()
        items = list(self.db.execute(stmt).scalars().all())
        return items, total

    def list_purchases_by_buyer(
        self,
        buyer_id: int,
        *,
        page: int,
        page_size: int,
    ) -> tuple[list[tuple[Purchase, EmotionProduct]], int]:
        total_stmt = select(func.count()).select_from(Purchase).where(Purchase.buyer_id == buyer_id)
        stmt = (
            select(Purchase, EmotionProduct)
            .join(EmotionProduct, EmotionProduct.id == Purchase.product_id)
            .where(Purchase.buyer_id == buyer_id)
            .order_by(Purchase.created_at.desc(), Purchase.id.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        total = self.db.execute(total_stmt).scalar_one()
        rows = list(self.db.execute(stmt).all())
        return rows, total

    def list_collections_by_user(
        self,
        user_id: int,
        *,
        page: int,
        page_size: int,
    ) -> tuple[list[tuple[ProductCollection, EmotionProduct]], int]:
        total_stmt = select(func.count()).select_from(ProductCollection).where(
            ProductCollection.user_id == user_id
        )
        stmt = (
            select(ProductCollection, EmotionProduct)
            .join(EmotionProduct, EmotionProduct.id == ProductCollection.product_id)
            .where(ProductCollection.user_id == user_id)
            .order_by(ProductCollection.created_at.desc(), ProductCollection.id.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        total = self.db.execute(total_stmt).scalar_one()
        rows = list(self.db.execute(stmt).all())
        return rows, total

    def has_purchase(self, user_id: int, product_id: int) -> bool:
        stmt = select(Purchase.id).where(Purchase.buyer_id == user_id, Purchase.product_id == product_id)
        return self.db.execute(stmt).scalar_one_or_none() is not None

    def has_like(self, user_id: int, product_id: int) -> bool:
        stmt = select(ProductLike.id).where(ProductLike.user_id == user_id, ProductLike.product_id == product_id)
        return self.db.execute(stmt).scalar_one_or_none() is not None

    def has_collection(self, user_id: int, product_id: int) -> bool:
        stmt = select(ProductCollection.id).where(
            ProductCollection.user_id == user_id,
            ProductCollection.product_id == product_id,
        )
        return self.db.execute(stmt).scalar_one_or_none() is not None

    def recalculate_happy_score(self, product: EmotionProduct) -> None:
        product.happy_score = (
            product.purchase_count * 3
            + product.like_count * 1
            + product.collection_count * 2
            + product.comment_count * 2
        )
        self.db.flush()

    def list_recommended_products(
        self,
        *,
        mood_tags: list[str],
        product_types: list[str],
        limit: int = 6,
    ) -> list[EmotionProduct]:
        stmt = select(EmotionProduct).where(EmotionProduct.status == "published")
        conditions = []
        for tag in mood_tags:
            conditions.append(cast(EmotionProduct.mood_tags, String).like(f'%"{tag}"%'))
        if product_types:
            conditions.append(EmotionProduct.product_type.in_(product_types))
        if conditions:
            stmt = stmt.where(or_(*conditions))
        stmt = stmt.order_by(
            desc(EmotionProduct.happy_score),
            desc(EmotionProduct.purchase_count),
            EmotionProduct.created_at.desc(),
            EmotionProduct.id.desc(),
        ).limit(limit)
        return list(self.db.execute(stmt).scalars().all())
