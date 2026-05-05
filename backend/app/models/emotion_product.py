from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, JSON, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class EmotionProduct(Base):
    __tablename__ = "emotion_products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    author_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    product_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    mood_tags: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    price: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    cover_image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_resellable: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    is_limited: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    stock_total: Mapped[int | None] = mapped_column(Integer, nullable=True)
    stock_remaining: Mapped[int | None] = mapped_column(Integer, nullable=True)
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="published", server_default="published", index=True)
    happy_score: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    purchase_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    like_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    collection_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    comment_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        index=True,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )
