from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from app.models.product_comment import ProductComment


class ProductCommentRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, *, user_id: int, product_id: int, content: str) -> ProductComment:
        comment = ProductComment(
            user_id=user_id,
            product_id=product_id,
            content=content,
        )
        self.db.add(comment)
        self.db.flush()
        return comment

    def get_by_id(self, comment_id: int) -> ProductComment | None:
        return self.db.get(ProductComment, comment_id)

    def list_by_product(
        self,
        product_id: int,
        *,
        page: int,
        page_size: int,
    ) -> tuple[list[ProductComment], int]:
        total_stmt = select(func.count()).select_from(ProductComment).where(
            ProductComment.product_id == product_id,
            ProductComment.is_deleted.is_(False),
        )
        stmt = (
            select(ProductComment)
            .where(
                ProductComment.product_id == product_id,
                ProductComment.is_deleted.is_(False),
            )
            .order_by(desc(ProductComment.created_at), desc(ProductComment.id))
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        total = self.db.execute(total_stmt).scalar_one()
        items = list(self.db.execute(stmt).scalars().all())
        return items, total
