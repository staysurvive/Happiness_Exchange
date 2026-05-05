from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, RegisterRequest
from app.services.point_service import PointService


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.users = UserRepository(db)
        self.points = PointService(db)

    def register_user(self, payload: RegisterRequest) -> User:
        if self.users.get_by_email(payload.email) is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="邮箱已被使用",
            )

        if self.users.get_by_username(payload.username) is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="用户名已被使用",
            )

        user = self.users.create(
            username=payload.username,
            email=payload.email,
            password_hash=hash_password(payload.password),
            points_balance=0,
        )
        self.points.grant_register_bonus(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def authenticate_user(self, payload: LoginRequest) -> str:
        user = self.users.get_by_email(payload.email)
        if user is None or not verify_password(payload.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="邮箱或密码错误",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="当前用户已被禁用",
            )

        return create_access_token(subject=str(user.id))
