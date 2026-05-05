from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.joy_gift_repository import JoyGiftRepository
from app.repositories.product_repository import ProductRepository
from app.repositories.user_repository import UserRepository
from app.schemas.auth import UserResponse
from app.schemas.products import (
    CreateProductRequest,
    ProductCreatedResponse,
    ProductDetailResponse,
    ProductDetailStateResponse,
    ProductImageResponse,
    ProductListResponse,
    MoodRecommendationResponse,
    ProductSummaryResponse,
    UpdateProductRequest,
)
from app.services.point_service import PointService


class ProductService:
    MAX_IMAGES = 9

    def __init__(self, db: Session):
        self.db = db
        self.products = ProductRepository(db)
        self.users = UserRepository(db)
        self.gifts = JoyGiftRepository(db)
        self.points = PointService(db)

    MOOD_RECOMMENDATIONS: dict[str, dict[str, object]] = {
        "tired": {
            "title": "今天适合先松一口气",
            "description": "我们挑了几份更柔软、更低压的快乐，让你先慢慢恢复一点状态。",
            "tags": ["治愈", "放松", "安心"],
            "product_types": ["healing_photo", "beautiful_view", "encouragement"],
        },
        "healing": {
            "title": "给今天一份治愈补给",
            "description": "如果你想被轻轻安慰一下，这些内容会更适合此刻的你。",
            "tags": ["治愈", "温暖", "美好"],
            "product_types": ["healing_photo", "beautiful_view", "happy_moment"],
        },
        "laugh": {
            "title": "来点能让人笑出来的快乐",
            "description": "偶尔先别想太多，笑一下，情绪就会先松开一点。",
            "tags": ["搞笑", "开心", "可爱"],
            "product_types": ["funny_joke", "cute_pet", "happy_moment"],
        },
        "encouraged": {
            "title": "今天想收一句刚刚好的鼓励",
            "description": "这些内容更适合低电量时刻，像一口小补给，让你继续往前走。",
            "tags": ["鼓励", "安心", "温暖"],
            "product_types": ["encouragement", "happy_moment", "lucky_today"],
        },
        "scenery": {
            "title": "想看点能让心情变轻的风景",
            "description": "如果你今天只想安静看点美好的东西，这组内容会更对味。",
            "tags": ["风景", "美好", "放松"],
            "product_types": ["beautiful_view", "healing_photo", "lucky_today"],
        },
    }

    def validate_image_count(self, image_urls: list[str]) -> None:
        if len(image_urls) > self.MAX_IMAGES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="每个商品最多上传 9 张图片",
            )

    def get_active_product_or_404(self, product_id: int):
        product = self.products.get_product_by_id(product_id)
        if product is None or product.status == "deleted":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="商品不存在",
            )
        return product

    def ensure_author(self, product, current_user: User) -> None:
        if product.author_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="只有作者可以操作该商品",
            )

    def to_summary(self, product) -> ProductSummaryResponse:
        author = self.users.get_by_id(product.author_id)
        return ProductSummaryResponse(
            id=product.id,
            title=product.title,
            description=product.description,
            product_type=product.product_type,
            mood_tags=product.mood_tags,
            price=product.price,
            cover_image_url=product.cover_image_url,
            status=product.status,
            happy_score=product.happy_score,
            purchase_count=product.purchase_count,
            like_count=product.like_count,
            collection_count=product.collection_count,
            comment_count=product.comment_count,
            created_at=product.created_at,
            author=UserResponse.model_validate(author),
        )

    def build_detail_response(self, product, current_user: User | None = None) -> ProductDetailResponse:
        author = self.users.get_by_id(product.author_id)
        images = self.products.list_images(product.id)

        is_author = current_user is not None and current_user.id == product.author_id
        is_purchased = (
            self.products.has_purchase(current_user.id, product.id) if current_user is not None else False
        )
        is_gifted = (
            self.gifts.get_by_recipient_and_product(current_user.id, product.id) is not None
            if current_user is not None
            else False
        )
        is_liked = self.products.has_like(current_user.id, product.id) if current_user is not None else False
        is_collected = (
            self.products.has_collection(current_user.id, product.id) if current_user is not None else False
        )
        is_accessible = is_author or is_purchased or is_gifted
        can_purchase = (
            current_user is not None
            and not is_accessible
            and current_user.points_balance >= product.price
            and product.status == "published"
        )
        can_comment = current_user is not None and product.status == "published"
        can_gift = current_user is not None and not is_author and is_accessible

        return ProductDetailResponse(
            id=product.id,
            title=product.title,
            description=product.description,
            product_type=product.product_type,
            mood_tags=product.mood_tags,
            price=product.price,
            cover_image_url=product.cover_image_url,
            status=product.status,
            happy_score=product.happy_score,
            purchase_count=product.purchase_count,
            like_count=product.like_count,
            collection_count=product.collection_count,
            comment_count=product.comment_count,
            created_at=product.created_at,
            updated_at=product.updated_at,
            is_resellable=product.is_resellable,
            is_limited=product.is_limited,
            stock_total=product.stock_total,
            stock_remaining=product.stock_remaining,
            author=UserResponse.model_validate(author),
            images=[ProductImageResponse.model_validate(image) for image in images],
            state=ProductDetailStateResponse(
                is_purchased=is_purchased,
                is_gifted=is_gifted,
                is_accessible=is_accessible,
                is_liked=is_liked,
                is_collected=is_collected,
                is_author=is_author,
                can_purchase=can_purchase,
                can_comment=can_comment,
                can_gift=can_gift,
            ),
        )

    def create_product(self, payload: CreateProductRequest, current_user: User) -> ProductCreatedResponse:
        self.validate_image_count(payload.image_urls)
        product = self.products.create_product(
            author_id=current_user.id,
            title=payload.title,
            description=payload.description,
            product_type=payload.product_type,
            mood_tags=payload.mood_tags,
            price=payload.price,
            image_urls=payload.image_urls,
        )
        self.points.grant_publish_reward(current_user, related_product_id=product.id)
        self.db.commit()
        self.db.refresh(product)
        self.db.refresh(current_user)
        return ProductCreatedResponse(
            id=product.id,
            title=product.title,
            price=product.price,
            happy_score=product.happy_score,
        )

    def list_products(
        self,
        *,
        product_type: str | None,
        mood_tag: str | None,
        min_price: int | None,
        max_price: int | None,
        sort: str,
        page: int,
        page_size: int,
    ) -> ProductListResponse:
        items, total = self.products.list_products(
            product_type=product_type,
            mood_tag=mood_tag,
            min_price=min_price,
            max_price=max_price,
            sort=sort,
            page=page,
            page_size=page_size,
        )
        return ProductListResponse(
            items=[self.to_summary(item) for item in items],
            page=page,
            page_size=page_size,
            total=total,
        )

    def get_product_detail(self, product_id: int, current_user: User | None = None) -> ProductDetailResponse:
        product = self.get_active_product_or_404(product_id)
        return self.build_detail_response(product, current_user=current_user)

    def recommend_by_need(self, need: str) -> MoodRecommendationResponse:
        recommendation = self.MOOD_RECOMMENDATIONS.get(need, self.MOOD_RECOMMENDATIONS["healing"])
        items = self.products.list_recommended_products(
            mood_tags=recommendation["tags"],  # type: ignore[arg-type]
            product_types=recommendation["product_types"],  # type: ignore[arg-type]
            limit=6,
        )
        if not items:
            items, _ = self.products.list_products(sort="happy_score", page=1, page_size=6)

        return MoodRecommendationResponse(
            need=need,
            title=recommendation["title"],  # type: ignore[arg-type]
            description=recommendation["description"],  # type: ignore[arg-type]
            recommended_tags=recommendation["tags"],  # type: ignore[arg-type]
            items=[self.to_summary(item) for item in items],
        )

    def update_product(
        self,
        product_id: int,
        payload: UpdateProductRequest,
        current_user: User,
    ) -> ProductDetailResponse:
        product = self.get_active_product_or_404(product_id)
        self.ensure_author(product, current_user)

        update_data = payload.model_dump(exclude_unset=True)
        image_urls = update_data.pop("image_urls", None)
        if image_urls is not None:
            self.validate_image_count(image_urls)
            self.products.replace_images(product.id, image_urls)
            product.cover_image_url = image_urls[0] if image_urls else None

        for field, value in update_data.items():
            setattr(product, field, value)

        self.db.commit()
        self.db.refresh(product)
        return self.build_detail_response(product, current_user=current_user)

    def delete_product(self, product_id: int, current_user: User) -> None:
        product = self.get_active_product_or_404(product_id)
        self.ensure_author(product, current_user)
        product.status = "deleted"
        self.db.commit()
