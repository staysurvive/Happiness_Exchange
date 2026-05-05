from fastapi import APIRouter, Depends, File, UploadFile

from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.uploads import ImageUploadResponse
from app.services.upload_service import UploadService

router = APIRouter(prefix='/uploads', tags=['uploads'])


@router.post('/images', response_model=ImageUploadResponse, summary='上传商品图片')
def upload_image(
    current_user: User = Depends(get_current_user),
    file: UploadFile = File(...),
) -> ImageUploadResponse:
    _ = current_user
    image_url = UploadService().save_image(file)
    return ImageUploadResponse(image_url=image_url)
