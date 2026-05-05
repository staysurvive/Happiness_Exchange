from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.checkins import router as checkins_router
from app.api.v1.comments import router as comments_router
from app.api.v1.products import router as products_router
from app.api.v1.uploads import router as uploads_router
from app.api.v1.users import router as users_router
from app.schemas.health import HealthResponse

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(checkins_router)
api_router.include_router(comments_router)
api_router.include_router(products_router)
api_router.include_router(uploads_router)
api_router.include_router(users_router)


@api_router.get("/health", response_model=HealthResponse, tags=["health"])
def api_health_check() -> HealthResponse:
    return HealthResponse(status="ok", service="happy-exchange-api-v1")
