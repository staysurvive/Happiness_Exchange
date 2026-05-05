from datetime import datetime

from email_validator import EmailNotValidError, validate_email
from pydantic import BaseModel, ConfigDict, EmailStr, field_validator


class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str

    @field_validator("username")
    @classmethod
    def validate_username(cls, value: str) -> str:
        value = value.strip()
        if len(value) < 3:
            raise ValueError("账号至少 3 个字符")
        if len(value) > 50:
            raise ValueError("账号不能超过 50 个字符")
        return value

    @field_validator("email")
    @classmethod
    def validate_register_email(cls, value: str) -> str:
        try:
            return validate_email(value.strip(), check_deliverability=False).normalized
        except EmailNotValidError as exc:
            raise ValueError("请输入有效的邮箱地址") from exc

    @field_validator("password")
    @classmethod
    def validate_register_password(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError("密码至少 8 个字符")
        if len(value) > 128:
            raise ValueError("密码不能超过 128 个字符")
        return value


class LoginRequest(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def validate_login_email(cls, value: str) -> str:
        try:
            return validate_email(value.strip(), check_deliverability=False).normalized
        except EmailNotValidError as exc:
            raise ValueError("请输入有效的邮箱地址") from exc

    @field_validator("password")
    @classmethod
    def validate_login_password(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError("密码至少 8 个字符")
        if len(value) > 128:
            raise ValueError("密码不能超过 128 个字符")
        return value


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: EmailStr
    avatar_url: str | None
    bio: str | None
    points_balance: int
    created_at: datetime


class RegisterResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: EmailStr
    points_balance: int
