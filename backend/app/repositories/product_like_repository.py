from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.product_like import ProductLike


class ProductLikeRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_user_and_product(self, user_id: int, product_id: int) -> ProductLike | None:
        stmt = select(ProductLike).where(
            ProductLike.user_id == user_id,
            ProductLike.product_id == product_id,
        )
        return self.db.execute(stmt).scalar_one_or_none()

    def create(self, *, user_id: int, product_id: int) -> ProductLike:
        like = ProductLike(user_id=user_id, product_id=product_id)
        self.db.add(like)
        self.db.flush()
        return like

    def delete(self, like: ProductLike) -> None:
        self.db.delete(like)
        self.db.flush()
