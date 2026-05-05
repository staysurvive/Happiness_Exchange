from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_current_user_optional
from app.core.database import get_db
from app.models.user import User
from app.schemas.interactions import (
    CommentCreateRequest,
    CommentListResponse,
    CommentResponse,
    GiftSendResponse,
    PurchaseResponse,
)
from app.schemas.products import (
    CreateProductRequest,
    MoodRecommendationResponse,
    ProductCreatedResponse,
    ProductDetailResponse,
    ProductListResponse,
    UpdateProductRequest,
)
from app.services.interaction_service import InteractionService
from app.services.product_service import ProductService

router = APIRouter(prefix='/products', tags=['products'])


@router.post(
    '',
    response_model=ProductCreatedResponse,
    status_code=status.HTTP_201_CREATED,
    summary='创建情绪商品',
)
def create_product(
    payload: CreateProductRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProductCreatedResponse:
    return ProductService(db).create_product(payload, current_user)


@router.get('', response_model=ProductListResponse, summary='获取商品列表')
def list_products(
    db: Session = Depends(get_db),
    product_type: str | None = Query(default=None, alias='type'),
    mood_tag: str | None = Query(default=None),
    min_price: int | None = Query(default=None, ge=0),
    max_price: int | None = Query(default=None, ge=0),
    sort: str = Query(default='latest'),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> ProductListResponse:
    return ProductService(db).list_products(
        product_type=product_type,
        mood_tag=mood_tag,
        min_price=min_price,
        max_price=max_price,
        sort=sort,
        page=page,
        page_size=page_size,
    )


@router.get('/recommendations/mood', response_model=MoodRecommendationResponse, summary='按心情推荐商品')
def get_mood_recommendations(
    need: str = Query(default='healing'),
    db: Session = Depends(get_db),
) -> MoodRecommendationResponse:
    return ProductService(db).recommend_by_need(need)


@router.get('/{product_id}', response_model=ProductDetailResponse, summary='获取商品详情')
def get_product_detail(
    product_id: int,
    current_user: User | None = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
) -> ProductDetailResponse:
    return ProductService(db).get_product_detail(product_id, current_user=current_user)


@router.patch('/{product_id}', response_model=ProductDetailResponse, summary='更新商品信息')
def update_product(
    product_id: int,
    payload: UpdateProductRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProductDetailResponse:
    return ProductService(db).update_product(product_id, payload, current_user)


@router.delete('/{product_id}', status_code=status.HTTP_204_NO_CONTENT, summary='删除情绪商品')
def delete_product(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Response:
    ProductService(db).delete_product(product_id, current_user)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post('/{product_id}/purchase', response_model=PurchaseResponse, summary='购买商品')
def purchase_product(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PurchaseResponse:
    return InteractionService(db).purchase_product(product_id, current_user)


@router.post('/{product_id}/gift', response_model=GiftSendResponse, summary='匿名送出快乐')
def gift_product(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> GiftSendResponse:
    return InteractionService(db).gift_product(product_id, current_user)


@router.post('/{product_id}/like', status_code=status.HTTP_200_OK, summary='点赞商品')
def like_product(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, bool]:
    InteractionService(db).like_product(product_id, current_user)
    return {'liked': True}


@router.delete('/{product_id}/like', status_code=status.HTTP_204_NO_CONTENT, summary='取消点赞')
def unlike_product(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Response:
    InteractionService(db).unlike_product(product_id, current_user)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post('/{product_id}/collection', status_code=status.HTTP_200_OK, summary='收藏商品')
def collect_product(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, bool]:
    InteractionService(db).collect_product(product_id, current_user)
    return {'collected': True}


@router.delete('/{product_id}/collection', status_code=status.HTTP_204_NO_CONTENT, summary='取消收藏')
def uncollect_product(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Response:
    InteractionService(db).uncollect_product(product_id, current_user)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post('/{product_id}/comments', response_model=CommentResponse, summary='发表评论')
def create_comment(
    product_id: int,
    payload: CommentCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CommentResponse:
    return InteractionService(db).create_comment(product_id, payload.content, current_user)


@router.get('/{product_id}/comments', response_model=CommentListResponse, summary='获取评论列表')
def list_comments(
    product_id: int,
    current_user: User | None = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> CommentListResponse:
    return InteractionService(db).list_comments(
        product_id,
        page=page,
        page_size=page_size,
        current_user=current_user,
    )
