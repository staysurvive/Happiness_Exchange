from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: int) -> User | None:
        return self.db.get(User, user_id)

    def get_by_email(self, email: str) -> User | None:
        stmt = select(User).where(User.email == email)
        return self.db.execute(stmt).scalar_one_or_none()

    def get_by_username(self, username: str) -> User | None:
        stmt = select(User).where(User.username == username)
        return self.db.execute(stmt).scalar_one_or_none()

    def create(
        self,
        *,
        username: str,
        email: str,
        password_hash: str,
        points_balance: int = 0,
    ) -> User:
        user = User(
            username=username,
            email=email,
            password_hash=password_hash,
            points_balance=points_balance,
        )
        self.db.add(user)
        self.db.flush()
        return user

    def save(self, user: User) -> User:
        self.db.add(user)
        self.db.flush()
        return user

    def list_active_users_excluding(self, excluded_user_ids: list[int]) -> list[User]:
        stmt = select(User).where(User.is_active.is_(True))
        if excluded_user_ids:
            stmt = stmt.where(User.id.notin_(excluded_user_ids))
        return list(self.db.execute(stmt.order_by(User.created_at.desc(), User.id.desc())).scalars().all())
