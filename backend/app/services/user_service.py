from collections import Counter
from pathlib import Path

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.user import User
from app.repositories.joy_gift_repository import JoyGiftRepository
from app.repositories.point_transaction_repository import PointTransactionRepository
from app.repositories.product_repository import ProductRepository
from app.repositories.user_repository import UserRepository
from app.schemas.auth import UserResponse
from app.schemas.avatars import AvatarOptionListResponse, AvatarOptionResponse
from app.schemas.interactions import (
    GiftRecordListResponse,
    GiftRecordResponse,
    ProductSummaryGiftResponse,
)
from app.schemas.persona import PersonaCardResponse
from app.schemas.points import (
    PointsBalanceResponse,
    PointsSummaryResponse,
    PointTransactionsResponse,
)
from app.schemas.products import (
    CollectionRecordItemResponse,
    CollectionRecordListResponse,
    ProductListResponse,
    ProductSummaryResponse,
    PurchaseRecordItemResponse,
    PurchaseRecordListResponse,
)


class UserService:
    PRODUCT_TYPE_LABELS = {
        "happy_moment": "快乐时刻",
        "lucky_today": "今日小确幸",
        "healing_photo": "治愈照片",
        "beautiful_view": "风景收藏",
        "cute_pet": "可爱小动物",
        "funny_joke": "快乐段子",
        "encouragement": "鼓励补给",
        "other": "自由灵感",
    }
    def __init__(self, db: Session):
        self.db = db
        self.users = UserRepository(db)
        self.transactions = PointTransactionRepository(db)
        self.products = ProductRepository(db)
        self.gifts = JoyGiftRepository(db)
        self.settings = get_settings()

    def _to_product_summary(self, product) -> ProductSummaryResponse:
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

    @staticmethod
    def _is_valid_tag(tag: str) -> bool:
        normalized = tag.strip()
        return bool(normalized) and not all(char in {"?", "？"} for char in normalized)

    def get_me(self, user: User) -> UserResponse:
        return UserResponse.model_validate(user)

    def list_avatar_options(self) -> AvatarOptionListResponse:
        avatar_dir = self.settings.preset_assets_dir / "avatars"
        avatar_dir.mkdir(parents=True, exist_ok=True)
        items: list[AvatarOptionResponse] = []
        for path in sorted(avatar_dir.iterdir(), key=lambda item: item.name.lower()):
            if not path.is_file() or path.suffix.lower() not in {".png", ".jpg", ".jpeg", ".webp"}:
                continue
            items.append(
                AvatarOptionResponse(
                    id=path.stem,
                    label=f"头像 {len(items) + 1}",
                    image_url=f"/preset-assets/avatars/{path.name}",
                )
            )
        return AvatarOptionListResponse(items=items)

    def update_avatar(self, user: User, avatar_url: str) -> UserResponse:
        normalized = avatar_url.strip()
        if not normalized.startswith("/preset-assets/avatars/"):
            raise ValueError("头像地址不合法")

        filename = Path(normalized).name
        target = self.settings.preset_assets_dir / "avatars" / filename
        if not target.exists():
            raise FileNotFoundError("所选头像不存在")

        user.avatar_url = normalized
        self.users.save(user)
        self.db.commit()
        self.db.refresh(user)
        return UserResponse.model_validate(user)

    def get_points_balance(self, user: User) -> PointsBalanceResponse:
        return PointsBalanceResponse(points_balance=user.points_balance)

    def get_points_summary(
        self,
        user: User,
        *,
        page: int = 1,
        page_size: int = 20,
    ) -> PointsSummaryResponse:
        transactions, total = self.transactions.list_by_user(
            user.id,
            page=page,
            page_size=page_size,
        )
        return PointsSummaryResponse(
            points_balance=user.points_balance,
            total=total,
            page=page,
            page_size=page_size,
            point_transactions=transactions,
        )

    def get_point_transactions(
        self,
        user: User,
        *,
        page: int = 1,
        page_size: int = 50,
    ) -> PointTransactionsResponse:
        transactions, total = self.transactions.list_by_user(
            user.id,
            page=page,
            page_size=page_size,
        )
        return PointTransactionsResponse(
            total=total,
            page=page,
            page_size=page_size,
            items=transactions,
        )

    def get_my_products(
        self,
        user: User,
        *,
        page: int,
        page_size: int,
    ) -> ProductListResponse:
        items, total = self.products.list_by_author(user.id, page=page, page_size=page_size)
        return ProductListResponse(
            total=total,
            page=page,
            page_size=page_size,
            items=[self._to_product_summary(item) for item in items],
        )

    def get_my_purchases(
        self,
        user: User,
        *,
        page: int,
        page_size: int,
    ) -> PurchaseRecordListResponse:
        rows, total = self.products.list_purchases_by_buyer(user.id, page=page, page_size=page_size)
        return PurchaseRecordListResponse(
            total=total,
            page=page,
            page_size=page_size,
            items=[
                PurchaseRecordItemResponse(
                    purchased_at=purchase.created_at,
                    purchase_price=purchase.price,
                    product=self._to_product_summary(product),
                )
                for purchase, product in rows
            ],
        )

    def get_my_collections(
        self,
        user: User,
        *,
        page: int,
        page_size: int,
    ) -> CollectionRecordListResponse:
        rows, total = self.products.list_collections_by_user(user.id, page=page, page_size=page_size)
        return CollectionRecordListResponse(
            total=total,
            page=page,
            page_size=page_size,
            items=[
                CollectionRecordItemResponse(
                    collected_at=collection.created_at,
                    product=self._to_product_summary(product),
                )
                for collection, product in rows
            ],
        )

    def get_my_gifts(
        self,
        user: User,
        *,
        page: int,
        page_size: int,
    ) -> GiftRecordListResponse:
        rows, total = self.gifts.list_by_recipient(user.id, page=page, page_size=page_size)
        items: list[GiftRecordResponse] = []
        for gift, product in rows:
            sender = self.users.get_by_id(gift.sender_id)
            author = self.users.get_by_id(product.author_id)
            items.append(
                GiftRecordResponse(
                    id=gift.id,
                    delivery_type=gift.delivery_type,
                    message=gift.message,
                    created_at=gift.created_at,
                    sender=UserResponse.model_validate(sender),
                    product=ProductSummaryGiftResponse(
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
                    ),
                )
            )
        return GiftRecordListResponse(total=total, page=page, page_size=page_size, items=items)

    def get_persona(self, user: User) -> PersonaCardResponse:
        products, total_published = self.products.list_by_author(user.id, page=1, page_size=100)
        purchases, total_purchases = self.products.list_purchases_by_buyer(user.id, page=1, page_size=100)
        collections, total_collections = self.products.list_collections_by_user(user.id, page=1, page_size=100)
        gifts_sent_count = self.gifts.count_sent_by_user(user.id)
        gifts_received_count = self.gifts.count_received_by_user(user.id)

        tag_counter: Counter[str] = Counter()
        type_counter: Counter[str] = Counter()

        for product in products:
            tag_counter.update([tag for tag in product.mood_tags if self._is_valid_tag(tag)])
            type_counter.update([product.product_type])
        for _, product in purchases:
            tag_counter.update([tag for tag in product.mood_tags if self._is_valid_tag(tag)])
            type_counter.update([product.product_type])
        for _, product in collections:
            tag_counter.update([tag for tag in product.mood_tags if self._is_valid_tag(tag)])
            type_counter.update([product.product_type])

        dominant_tag = tag_counter.most_common(1)[0][0] if tag_counter else "温暖"
        dominant_type_key = type_counter.most_common(1)[0][0] if type_counter else "happy_moment"
        dominant_type = self.PRODUCT_TYPE_LABELS.get(dominant_type_key, dominant_type_key)

        happy_actions = total_published + total_purchases + total_collections + gifts_sent_count + gifts_received_count

        if gifts_sent_count >= 2 or total_published >= 3:
            archetype_key = "joy_dispatcher"
            archetype_name = "快乐派送员"
            headline = "你不只是保存快乐，更会主动把快乐送出去。"
            summary = "你的行为更像一个情绪补给站，总会把好内容继续传给下一个需要的人。"
        elif total_collections >= total_purchases and dominant_tag in {"治愈", "温暖", "安心"}:
            archetype_key = "healing_curator"
            archetype_name = "治愈收藏家"
            headline = "你更擅长收集那些能让人慢慢放松下来的快乐。"
            summary = "你偏爱安静、柔和、能稳定情绪的内容，很适合做快乐仓库的策展人。"
        elif total_purchases >= 2:
            archetype_key = "mood_explorer"
            archetype_name = "情绪漫游者"
            headline = "你愿意主动寻找适合当下心情的快乐补给。"
            summary = "无论是风景、鼓励还是一点幽默，你总能在流通中找到属于今天的那一份。"
        else:
            archetype_key = "gentle_observer"
            archetype_name = "温柔观察员"
            headline = "你会认真停下来，看见生活里细微但真实的美好。"
            summary = "你也许还在慢慢探索，但已经拥有把平凡时刻变成快乐记录的能力。"

        vibe_tags = list(dict.fromkeys([dominant_tag, dominant_type, "快乐流通中"]))[:3]

        return PersonaCardResponse(
            archetype_key=archetype_key,
            archetype_name=archetype_name,
            headline=headline,
            summary=summary,
            dominant_mood_tag=dominant_tag,
            dominant_product_type=dominant_type,
            vibe_tags=vibe_tags,
            purchases_count=total_purchases,
            collections_count=total_collections,
            published_count=total_published,
            gifts_sent_count=gifts_sent_count,
            gifts_received_count=gifts_received_count,
            happy_actions=happy_actions,
        )
