from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.checkins import CheckinResponse, CheckinStatusResponse
from app.services.checkin_service import CheckinService

router = APIRouter(prefix="/checkins", tags=["checkins"])


@router.post("", response_model=CheckinResponse, summary="执行每日签到")
def daily_checkin(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CheckinResponse:
    return CheckinService(db).check_in(current_user)


@router.get("/me", response_model=CheckinStatusResponse, summary="获取我的签到状态")
def get_checkin_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CheckinStatusResponse:
    return CheckinService(db).get_status(current_user)
