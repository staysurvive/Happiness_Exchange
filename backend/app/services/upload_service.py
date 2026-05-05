from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status

from app.core.config import get_settings


class UploadService:
    ALLOWED_CONTENT_TYPES = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
    }

    def __init__(self) -> None:
        self.settings = get_settings()
        self.upload_dir = Path(self.settings.upload_dir)
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    def save_image(self, file: UploadFile) -> str:
        if file.content_type not in self.ALLOWED_CONTENT_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="仅支持 JPG、PNG、WEBP 图片",
            )

        content = file.file.read()
        max_size = self.settings.max_upload_size_mb * 1024 * 1024
        if len(content) > max_size:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"图片大小不能超过 {self.settings.max_upload_size_mb}MB",
            )

        suffix = self.ALLOWED_CONTENT_TYPES[file.content_type]
        filename = f"{uuid4().hex}{suffix}"
        target = self.upload_dir / filename
        target.write_bytes(content)
        return f"/uploads/{filename}"
