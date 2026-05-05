from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[2]
PROJECT_DIR = BASE_DIR.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BASE_DIR / '.env',
        env_file_encoding='utf-8',
        case_sensitive=True,
        extra='ignore',
    )

    database_url: str = Field(alias='DATABASE_URL')
    jwt_secret_key: str = Field(alias='JWT_SECRET_KEY')
    jwt_algorithm: str = Field(default='HS256', alias='JWT_ALGORITHM')
    access_token_expire_minutes: int = Field(
        default=10080, alias='ACCESS_TOKEN_EXPIRE_MINUTES'
    )
    upload_dir: Path = Field(default=BASE_DIR / 'uploads', alias='UPLOAD_DIR')
    preset_assets_dir: Path = Field(default=PROJECT_DIR / 'assets', alias='PRESET_ASSETS_DIR')
    max_upload_size_mb: int = Field(default=5, alias='MAX_UPLOAD_SIZE_MB')
    cors_allow_origins: list[str] = Field(
        default=[
            'http://127.0.0.1:5173',
            'http://localhost:5173',
        ],
        alias='CORS_ALLOW_ORIGINS',
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
