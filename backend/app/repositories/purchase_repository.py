from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.models.purchase import Purchase


class PurchaseRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        *,
        buyer_id: int,
        product_id: int,
        seller_id: int,
        price: int,
    ) -> Purchase:
        purchase = Purchase(
            buyer_id=buyer_id,
            product_id=product_id,
            seller_id=seller_id,
            price=price,
        )
        self.db.add(purchase)
        self.db.flush()
        return purchase

    def get_by_buyer_and_product(self, buyer_id: int, product_id: int) -> Purchase | None:
        stmt = select(Purchase).where(
            Purchase.buyer_id == buyer_id,
            Purchase.product_id == product_id,
        )
        return self.db.execute(stmt).scalar_one_or_none()

    def list_by_buyer(self, buyer_id: int) -> list[Purchase]:
        stmt = (
            select(Purchase)
            .where(Purchase.buyer_id == buyer_id)
            .order_by(desc(Purchase.created_at), desc(Purchase.id))
        )
        return list(self.db.execute(stmt).scalars().all())
