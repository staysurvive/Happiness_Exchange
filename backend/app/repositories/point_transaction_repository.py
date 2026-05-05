from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from app.models.point_transaction import PointTransaction


class PointTransactionRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        *,
        user_id: int,
        amount: int,
        balance_after: int,
        transaction_type: str,
        description: str | None = None,
        related_product_id: int | None = None,
        related_purchase_id: int | None = None,
    ) -> PointTransaction:
        transaction = PointTransaction(
            user_id=user_id,
            amount=amount,
            balance_after=balance_after,
            transaction_type=transaction_type,
            description=description,
            related_product_id=related_product_id,
            related_purchase_id=related_purchase_id,
        )
        self.db.add(transaction)
        self.db.flush()
        return transaction

    def list_by_user(
        self,
        user_id: int,
        *,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[PointTransaction], int]:
        total_stmt = select(func.count()).select_from(PointTransaction).where(
            PointTransaction.user_id == user_id
        )
        stmt = (
            select(PointTransaction)
            .where(PointTransaction.user_id == user_id)
            .order_by(desc(PointTransaction.created_at), desc(PointTransaction.id))
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        total = self.db.execute(total_stmt).scalar_one()
        items = list(self.db.execute(stmt).scalars().all())
        return items, total
