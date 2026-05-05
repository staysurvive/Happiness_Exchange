from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.point_transaction_repository import PointTransactionRepository


class PointService:
    REGISTER_REWARD = 100
    CHECKIN_REWARD = 10
    PUBLISH_REWARD = 5

    def __init__(self, db: Session):
        self.db = db
        self.transactions = PointTransactionRepository(db)

    def add_points(
        self,
        *,
        user: User,
        amount: int,
        transaction_type: str,
        description: str,
        related_product_id: int | None = None,
        related_purchase_id: int | None = None,
    ) -> None:
        user.points_balance += amount
        self.db.flush()
        self.transactions.create(
            user_id=user.id,
            amount=amount,
            balance_after=user.points_balance,
            transaction_type=transaction_type,
            description=description,
            related_product_id=related_product_id,
            related_purchase_id=related_purchase_id,
        )

    def spend_points(
        self,
        *,
        user: User,
        amount: int,
        transaction_type: str,
        description: str,
        related_product_id: int | None = None,
        related_purchase_id: int | None = None,
    ) -> None:
        if amount < 0:
            raise ValueError("amount must be non-negative")
        if user.points_balance < amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="快乐币余额不足",
            )
        self.add_points(
            user=user,
            amount=-amount,
            transaction_type=transaction_type,
            description=description,
            related_product_id=related_product_id,
            related_purchase_id=related_purchase_id,
        )

    def grant_register_bonus(self, user: User) -> None:
        self.add_points(
            user=user,
            amount=self.REGISTER_REWARD,
            transaction_type="register_bonus",
            description="新用户注册奖励",
        )

    def grant_checkin_reward(self, user: User) -> None:
        self.add_points(
            user=user,
            amount=self.CHECKIN_REWARD,
            transaction_type="checkin_reward",
            description="每日签到奖励",
        )

    def grant_publish_reward(self, user: User, *, related_product_id: int) -> None:
        self.add_points(
            user=user,
            amount=self.PUBLISH_REWARD,
            transaction_type="product_publish_reward",
            description="发布情绪商品奖励",
            related_product_id=related_product_id,
        )
