from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token, is_jwt_error
from app.models.user import User
from app.repositories.user_repository import UserRepository

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")
optional_oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


def _resolve_user_from_token(token: str | None, db: Session) -> User | None:
    if not token:
        return None
    try:
        payload = decode_access_token(token)
        subject = payload.get("sub")
        if subject is None:
            return None
        user_id = int(subject)
    except ValueError:
        return None
    except Exception as error:
        if is_jwt_error(error):
            return None
        raise
    return UserRepository(db).get_by_id(user_id)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无效的认证凭证",
        headers={"WWW-Authenticate": "Bearer"},
    )

    user = _resolve_user_from_token(token, db)
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="当前用户已被禁用",
        )
    return user


def get_current_user_optional(
    token: str | None = Depends(optional_oauth2_scheme),
    db: Session = Depends(get_db),
) -> User | None:
    user = _resolve_user_from_token(token, db)
    if user is None or not user.is_active:
        return None
    return user
