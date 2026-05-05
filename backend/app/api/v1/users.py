from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.auth import UserResponse
from app.schemas.avatars import (
    AvatarOptionListResponse,
    UpdateAvatarRequest,
)
from app.schemas.interactions import GiftRecordListResponse
from app.schemas.persona import PersonaCardResponse
from app.schemas.points import (
    PointsBalanceResponse,
    PointsSummaryResponse,
    PointTransactionsResponse,
)
from app.schemas.products import (
    CollectionRecordListResponse,
    ProductListResponse,
    PurchaseRecordListResponse,
)
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse, summary="获取我的信息")
def get_me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserResponse:
    return UserService(db).get_me(current_user)


@router.get("/avatar-options", response_model=AvatarOptionListResponse, summary="获取预设头像列表")
def get_avatar_options(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AvatarOptionListResponse:
    _ = current_user
    return UserService(db).list_avatar_options()


@router.patch("/me/avatar", response_model=UserResponse, summary="更新我的头像")
def update_my_avatar(
    payload: UpdateAvatarRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserResponse:
    service = UserService(db)
    try:
        return service.update_avatar(current_user, payload.avatar_url)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.get("/me/points", response_model=PointsSummaryResponse, summary="获取我的余额与积分流水")
def get_my_points(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> PointsSummaryResponse:
    return UserService(db).get_points_summary(current_user, page=page, page_size=page_size)


@router.get("/me/balance", response_model=PointsBalanceResponse, summary="获取我的当前余额")
def get_my_balance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PointsBalanceResponse:
    return UserService(db).get_points_balance(current_user)


@router.get("/me/transactions", response_model=PointTransactionsResponse, summary="分页获取我的积分流水")
def get_my_point_transactions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=100),
) -> PointTransactionsResponse:
    return UserService(db).get_point_transactions(current_user, page=page, page_size=page_size)


@router.get("/me/products", response_model=ProductListResponse, summary="分页获取我的发布")
def get_my_products(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> ProductListResponse:
    return UserService(db).get_my_products(current_user, page=page, page_size=page_size)


@router.get("/me/purchases", response_model=PurchaseRecordListResponse, summary="分页获取我的购买记录")
def get_my_purchases(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> PurchaseRecordListResponse:
    return UserService(db).get_my_purchases(current_user, page=page, page_size=page_size)


@router.get("/me/collections", response_model=CollectionRecordListResponse, summary="分页获取我的收藏记录")
def get_my_collections(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> CollectionRecordListResponse:
    return UserService(db).get_my_collections(current_user, page=page, page_size=page_size)


@router.get("/me/gifts", response_model=GiftRecordListResponse, summary="分页获取我收到的快乐礼物")
def get_my_gifts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> GiftRecordListResponse:
    return UserService(db).get_my_gifts(current_user, page=page, page_size=page_size)


@router.get("/me/persona", response_model=PersonaCardResponse, summary="获取我的快乐人格卡")
def get_my_persona(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PersonaCardResponse:
    return UserService(db).get_persona(current_user)
