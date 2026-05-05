from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.models.product_collection import ProductCollection


class ProductCollectionRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_user_and_product(self, user_id: int, product_id: int) -> ProductCollection | None:
        stmt = select(ProductCollection).where(
            ProductCollection.user_id == user_id,
            ProductCollection.product_id == product_id,
        )
        return self.db.execute(stmt).scalar_one_or_none()

    def create(self, *, user_id: int, product_id: int) -> ProductCollection:
        collection = ProductCollection(user_id=user_id, product_id=product_id)
        self.db.add(collection)
        self.db.flush()
        return collection

    def delete(self, collection: ProductCollection) -> None:
        self.db.delete(collection)
        self.db.flush()

    def list_by_user(self, user_id: int) -> list[ProductCollection]:
        stmt = (
            select(ProductCollection)
            .where(ProductCollection.user_id == user_id)
            .order_by(desc(ProductCollection.created_at), desc(ProductCollection.id))
        )
        return list(self.db.execute(stmt).scalars().all())
