from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.checkin_repository import CheckinRepository
from app.schemas.checkins import CheckinResponse, CheckinStatusResponse, LatestCheckinResponse
from app.services.point_service import PointService


class CheckinService:
    def __init__(self, db: Session):
        self.db = db
        self.checkins = CheckinRepository(db)
        self.points = PointService(db)

    def check_in(self, user: User) -> CheckinResponse:
        today = datetime.now(timezone.utc).date()
        existing = self.checkins.get_by_user_and_date(user.id, today)
        if existing is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="今天已经签到过了",
            )

        self.checkins.create(
            user_id=user.id,
            checkin_date=today,
            reward_points=self.points.CHECKIN_REWARD,
        )
        self.points.grant_checkin_reward(user)
        self.db.commit()
        self.db.refresh(user)

        return CheckinResponse(
            checked_in=True,
            reward_points=self.points.CHECKIN_REWARD,
            points_balance=user.points_balance,
        )

    def get_status(self, user: User) -> CheckinStatusResponse:
        today = datetime.now(timezone.utc).date()
        latest = self.checkins.get_latest_by_user(user.id)
        return CheckinStatusResponse(
            checked_in_today=latest.checkin_date == today if latest is not None else False,
            latest_checkin_date=latest.checkin_date if latest is not None else None,
            latest_checkin=LatestCheckinResponse(
                checkin_date=latest.checkin_date,
                reward_points=latest.reward_points,
                created_at=latest.created_at,
            )
            if latest is not None
            else None,
            reward_points=self.points.CHECKIN_REWARD,
            points_balance=user.points_balance,
        )
