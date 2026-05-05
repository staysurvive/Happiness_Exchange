from random import choice

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.joy_gift_repository import JoyGiftRepository
from app.repositories.product_collection_repository import ProductCollectionRepository
from app.repositories.product_comment_repository import ProductCommentRepository
from app.repositories.product_like_repository import ProductLikeRepository
from app.repositories.product_repository import ProductRepository
from app.repositories.purchase_repository import PurchaseRepository
from app.repositories.user_repository import UserRepository
from app.schemas.auth import UserResponse
from app.schemas.interactions import (
    CommentListResponse,
    CommentResponse,
    GiftSendResponse,
    PurchaseResponse,
)
from app.services.point_service import PointService


class InteractionService:
    def __init__(self, db: Session):
        self.db = db
        self.products = ProductRepository(db)
        self.likes = ProductLikeRepository(db)
        self.collections = ProductCollectionRepository(db)
        self.comments = ProductCommentRepository(db)
        self.purchases = PurchaseRepository(db)
        self.gifts = JoyGiftRepository(db)
        self.users = UserRepository(db)
        self.points = PointService(db)

    def _get_active_product_or_404(self, product_id: int):
        product = self.products.get_product_by_id(product_id)
        if product is None or product.status == "deleted":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="商品不存在",
            )
        return product

    def _refresh_happy_score(self, product) -> None:
        self.products.recalculate_happy_score(product)

    def purchase_product(self, product_id: int, current_user: User) -> PurchaseResponse:
        product = self._get_active_product_or_404(product_id)
        if product.author_id == current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="不能购买自己发布的商品",
            )
        if self.purchases.get_by_buyer_and_product(current_user.id, product.id) is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="不能重复购买同一个商品",
            )
        if self.gifts.get_by_recipient_and_product(current_user.id, product.id) is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="你已经通过快乐礼物拥有这份商品",
            )

        seller = self.users.get_by_id(product.author_id)
        if seller is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="商品作者不存在",
            )

        purchase = self.purchases.create(
            buyer_id=current_user.id,
            product_id=product.id,
            seller_id=seller.id,
            price=product.price,
        )
        self.points.spend_points(
            user=current_user,
            amount=product.price,
            transaction_type="product_purchase_spend",
            description="购买情绪商品",
            related_product_id=product.id,
            related_purchase_id=purchase.id,
        )
        self.points.add_points(
            user=seller,
            amount=product.price,
            transaction_type="product_purchase_income",
            description="商品被购买获得快乐币",
            related_product_id=product.id,
            related_purchase_id=purchase.id,
        )
        product.purchase_count += 1
        self._refresh_happy_score(product)
        self.db.commit()
        self.db.refresh(current_user)
        return PurchaseResponse(
            purchased=True,
            product_id=product.id,
            price=product.price,
            points_balance=current_user.points_balance,
        )

    def gift_product(self, product_id: int, current_user: User) -> GiftSendResponse:
        product = self._get_active_product_or_404(product_id)
        if product.author_id == current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="不能送出自己发布的商品",
            )

        has_purchased = self.purchases.get_by_buyer_and_product(current_user.id, product.id) is not None
        has_received_gift = self.gifts.get_by_recipient_and_product(current_user.id, product.id) is not None
        if not has_purchased and not has_received_gift:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="先收下这份快乐，再把它送给别人吧",
            )

        candidate_users = self.users.list_active_users_excluding(
            [current_user.id, product.author_id]
        )
        eligible_users = []
        for user in candidate_users:
            if self.purchases.get_by_buyer_and_product(user.id, product.id) is not None:
                continue
            if self.gifts.get_by_recipient_and_product(user.id, product.id) is not None:
                continue
            eligible_users.append(user)

        if not eligible_users:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="暂时还没有适合接收这份快乐的陌生人",
            )

        recipient = choice(eligible_users)
        gift = self.gifts.create(
            sender_id=current_user.id,
            recipient_id=recipient.id,
            product_id=product.id,
            message="来自一位匿名快乐传递者，希望这份补给刚好适合你。",
        )
        self.db.commit()
        return GiftSendResponse(
            gifted=True,
            gift_id=gift.id,
            product_id=product.id,
            recipient_label="一位刚好需要补给的人",
            message="这份快乐已经匿名送出，对方下次打开平台时就能收到。",
        )

    def like_product(self, product_id: int, current_user: User) -> None:
        product = self._get_active_product_or_404(product_id)
        if self.likes.get_by_user_and_product(current_user.id, product.id) is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="已经点赞过该商品",
            )
        self.likes.create(user_id=current_user.id, product_id=product.id)
        product.like_count += 1
        self._refresh_happy_score(product)
        self.db.commit()

    def unlike_product(self, product_id: int, current_user: User) -> None:
        product = self._get_active_product_or_404(product_id)
        like = self.likes.get_by_user_and_product(current_user.id, product.id)
        if like is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="点赞记录不存在",
            )
        self.likes.delete(like)
        product.like_count = max(product.like_count - 1, 0)
        self._refresh_happy_score(product)
        self.db.commit()

    def collect_product(self, product_id: int, current_user: User) -> None:
        product = self._get_active_product_or_404(product_id)
        if self.collections.get_by_user_and_product(current_user.id, product.id) is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="已经收藏过该商品",
            )
        self.collections.create(user_id=current_user.id, product_id=product.id)
        product.collection_count += 1
        self._refresh_happy_score(product)
        self.db.commit()

    def uncollect_product(self, product_id: int, current_user: User) -> None:
        product = self._get_active_product_or_404(product_id)
        collection = self.collections.get_by_user_and_product(current_user.id, product.id)
        if collection is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="收藏记录不存在",
            )
        self.collections.delete(collection)
        product.collection_count = max(product.collection_count - 1, 0)
        self._refresh_happy_score(product)
        self.db.commit()

    def create_comment(self, product_id: int, content: str, current_user: User) -> CommentResponse:
        product = self._get_active_product_or_404(product_id)
        normalized = content.strip()
        if not normalized:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="评论内容不能为空",
            )
        comment = self.comments.create(
            user_id=current_user.id,
            product_id=product.id,
            content=normalized,
        )
        product.comment_count += 1
        self._refresh_happy_score(product)
        self.db.commit()
        self.db.refresh(comment)
        return CommentResponse(
            id=comment.id,
            content=comment.content,
            created_at=comment.created_at,
            updated_at=comment.updated_at,
            user=UserResponse.model_validate(current_user),
            is_mine=True,
        )

    def list_comments(
        self,
        product_id: int,
        *,
        page: int,
        page_size: int,
        current_user: User | None = None,
    ) -> CommentListResponse:
        self._get_active_product_or_404(product_id)
        comments, total = self.comments.list_by_product(
            product_id,
            page=page,
            page_size=page_size,
        )
        items: list[CommentResponse] = []
        for comment in comments:
            user = self.users.get_by_id(comment.user_id)
            items.append(
                CommentResponse(
                    id=comment.id,
                    content=comment.content,
                    created_at=comment.created_at,
                    updated_at=comment.updated_at,
                    user=UserResponse.model_validate(user),
                    is_mine=current_user is not None and current_user.id == comment.user_id,
                )
            )
        return CommentListResponse(
            total=total,
            page=page,
            page_size=page_size,
            items=items,
        )

    def delete_comment(self, comment_id: int, current_user: User) -> None:
        comment = self.comments.get_by_id(comment_id)
        if comment is None or comment.is_deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="评论不存在",
            )
        if comment.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="只能删除自己的评论",
            )
        product = self.products.get_product_by_id(comment.product_id)
        comment.is_deleted = True
        if product is not None and product.status != "deleted":
            product.comment_count = max(product.comment_count - 1, 0)
            self._refresh_happy_score(product)
        self.db.commit()
