from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from app.models.emotion_product import EmotionProduct
from app.models.joy_gift import JoyGift


class JoyGiftRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        *,
        sender_id: int,
        recipient_id: int,
        product_id: int,
        message: str | None,
        delivery_type: str = "anonymous_stranger",
    ) -> JoyGift:
        gift = JoyGift(
            sender_id=sender_id,
            recipient_id=recipient_id,
            product_id=product_id,
            message=message,
            delivery_type=delivery_type,
        )
        self.db.add(gift)
        self.db.flush()
        return gift

    def get_by_recipient_and_product(self, recipient_id: int, product_id: int) -> JoyGift | None:
        stmt = select(JoyGift).where(
            JoyGift.recipient_id == recipient_id,
            JoyGift.product_id == product_id,
        )
        return self.db.execute(stmt).scalar_one_or_none()

    def count_sent_by_user(self, user_id: int) -> int:
        stmt = select(func.count()).select_from(JoyGift).where(JoyGift.sender_id == user_id)
        return self.db.execute(stmt).scalar_one()

    def count_received_by_user(self, user_id: int) -> int:
        stmt = select(func.count()).select_from(JoyGift).where(JoyGift.recipient_id == user_id)
        return self.db.execute(stmt).scalar_one()

    def list_by_recipient(
        self,
        user_id: int,
        *,
        page: int,
        page_size: int,
    ) -> tuple[list[tuple[JoyGift, EmotionProduct]], int]:
        total_stmt = select(func.count()).select_from(JoyGift).where(JoyGift.recipient_id == user_id)
        stmt = (
            select(JoyGift, EmotionProduct)
            .join(EmotionProduct, EmotionProduct.id == JoyGift.product_id)
            .where(JoyGift.recipient_id == user_id)
            .order_by(desc(JoyGift.created_at), desc(JoyGift.id))
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        total = self.db.execute(total_stmt).scalar_one()
        rows = list(self.db.execute(stmt).all())
        return rows, total
