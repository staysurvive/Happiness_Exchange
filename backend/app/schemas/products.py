from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.auth import UserResponse

ProductType = Literal[
    "happy_moment",
    "lucky_today",
    "healing_photo",
    "beautiful_view",
    "cute_pet",
    "funny_joke",
    "encouragement",
    "other",
]


class ProductImageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    image_url: str
    sort_order: int


class ProductBasePayload(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1, max_length=5000)
    product_type: ProductType
    mood_tags: list[str] = Field(default_factory=list, max_length=20)
    price: int = Field(ge=0, le=100000)
    image_urls: list[str] = Field(default_factory=list, max_length=9)


class CreateProductRequest(ProductBasePayload):
    pass


class UpdateProductRequest(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, min_length=1, max_length=5000)
    product_type: ProductType | None = None
    mood_tags: list[str] | None = Field(default=None, max_length=20)
    price: int | None = Field(default=None, ge=0, le=100000)
    image_urls: list[str] | None = Field(default=None, max_length=9)


class ProductSummaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    product_type: str
    mood_tags: list[str]
    price: int
    cover_image_url: str | None
    status: str
    happy_score: int
    purchase_count: int
    like_count: int
    collection_count: int
    comment_count: int
    created_at: datetime
    author: UserResponse


class ProductListResponse(BaseModel):
    items: list[ProductSummaryResponse]
    page: int
    page_size: int
    total: int


class ProductDetailStateResponse(BaseModel):
    is_purchased: bool
    is_gifted: bool
    is_accessible: bool
    is_liked: bool
    is_collected: bool
    is_author: bool
    can_purchase: bool
    can_comment: bool
    can_gift: bool


class ProductDetailResponse(ProductSummaryResponse):
    author: UserResponse
    images: list[ProductImageResponse]
    is_resellable: bool
    is_limited: bool
    stock_total: int | None
    stock_remaining: int | None
    updated_at: datetime
    state: ProductDetailStateResponse


class ProductCreatedResponse(BaseModel):
    id: int
    title: str
    price: int
    happy_score: int


class PurchaseRecordItemResponse(BaseModel):
    purchased_at: datetime
    purchase_price: int
    product: ProductSummaryResponse


class PurchaseRecordListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[PurchaseRecordItemResponse]


class CollectionRecordItemResponse(BaseModel):
    collected_at: datetime
    product: ProductSummaryResponse


class CollectionRecordListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[CollectionRecordItemResponse]


class MoodRecommendationResponse(BaseModel):
    need: str
    title: str
    description: str
    recommended_tags: list[str]
    items: list[ProductSummaryResponse]
