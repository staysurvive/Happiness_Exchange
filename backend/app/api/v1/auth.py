from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    RegisterResponse,
    TokenResponse,
    UserResponse,
)
from app.services.auth_service import AuthService
from app.services.user_service import UserService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="注册用户",
)
def register(
    payload: RegisterRequest,
    db: Session = Depends(get_db),
) -> RegisterResponse:
    user = AuthService(db).register_user(payload)
    return RegisterResponse.model_validate(user)


@router.post("/login", response_model=TokenResponse, summary="用户登录")
def login(
    payload: LoginRequest,
    db: Session = Depends(get_db),
) -> TokenResponse:
    access_token = AuthService(db).authenticate_user(payload)
    return TokenResponse(access_token=access_token)


@router.get("/me", response_model=UserResponse, summary="获取当前登录用户")
def get_me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserResponse:
    return UserService(db).get_me(current_user)
