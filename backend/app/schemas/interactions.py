from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.auth import UserResponse


class PurchaseResponse(BaseModel):
    purchased: bool
    product_id: int
    price: int
    points_balance: int


class CommentCreateRequest(BaseModel):
    content: str = Field(min_length=1, max_length=2000)


class CommentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    content: str
    created_at: datetime
    updated_at: datetime
    user: UserResponse
    is_mine: bool


class CommentListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[CommentResponse]


class GiftSendResponse(BaseModel):
    gifted: bool
    gift_id: int
    product_id: int
    recipient_label: str
    message: str


class ProductSummaryGiftResponse(BaseModel):
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


class GiftRecordResponse(BaseModel):
    id: int
    delivery_type: str
    message: str | None
    created_at: datetime
    sender: UserResponse
    product: ProductSummaryGiftResponse


class GiftRecordListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[GiftRecordResponse]
