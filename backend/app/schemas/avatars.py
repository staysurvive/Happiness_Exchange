from pydantic import BaseModel, Field


class AvatarOptionResponse(BaseModel):
    id: str
    label: str
    image_url: str


class AvatarOptionListResponse(BaseModel):
    items: list[AvatarOptionResponse]


class UpdateAvatarRequest(BaseModel):
    avatar_url: str = Field(min_length=1)
