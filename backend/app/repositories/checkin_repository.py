from datetime import date

from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.models.checkin import Checkin


class CheckinRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, *, user_id: int, checkin_date: date, reward_points: int) -> Checkin:
        checkin = Checkin(
            user_id=user_id,
            checkin_date=checkin_date,
            reward_points=reward_points,
        )
        self.db.add(checkin)
        self.db.flush()
        return checkin

    def get_by_user_and_date(self, user_id: int, checkin_date: date) -> Checkin | None:
        stmt = select(Checkin).where(
            Checkin.user_id == user_id,
            Checkin.checkin_date == checkin_date,
        )
        return self.db.execute(stmt).scalar_one_or_none()

    def get_latest_by_user(self, user_id: int) -> Checkin | None:
        stmt = (
            select(Checkin)
            .where(Checkin.user_id == user_id)
            .order_by(desc(Checkin.checkin_date), desc(Checkin.id))
            .limit(1)
        )
        return self.db.execute(stmt).scalar_one_or_none()
