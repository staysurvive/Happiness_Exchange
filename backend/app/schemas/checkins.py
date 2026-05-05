from datetime import date, datetime

from pydantic import BaseModel


class CheckinResponse(BaseModel):
    checked_in: bool
    reward_points: int
    points_balance: int


class LatestCheckinResponse(BaseModel):
    checkin_date: date
    reward_points: int
    created_at: datetime


class CheckinStatusResponse(BaseModel):
    checked_in_today: bool
    latest_checkin_date: date | None
    latest_checkin: LatestCheckinResponse | None
    reward_points: int
    points_balance: int
