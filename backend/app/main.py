from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.schemas.health import HealthResponse

settings = get_settings()

app = FastAPI(
    title='Happy Exchange API',
    description='Backend API for Happy Exchange MVP.',
    version='0.1.0',
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allow_origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

settings.upload_dir.mkdir(parents=True, exist_ok=True)
settings.preset_assets_dir.mkdir(parents=True, exist_ok=True)

app.include_router(api_router, prefix='/api/v1')
app.mount('/uploads', StaticFiles(directory=settings.upload_dir), name='uploads')
app.mount('/preset-assets', StaticFiles(directory=settings.preset_assets_dir), name='preset-assets')


FIELD_LABELS = {
    "username": "账号",
    "email": "邮箱",
    "password": "密码",
}


def build_validation_message(exc: RequestValidationError) -> str:
    messages: list[str] = []

    for error in exc.errors():
        loc = error.get("loc", ())
        field = str(loc[-1]) if loc else ""
        field_label = FIELD_LABELS.get(field, field or "输入内容")
        error_type = error.get("type", "")
        message = str(error.get("msg", ""))
        context = error.get("ctx", {}) or {}

        if message.startswith("Value error, "):
            message = message[len("Value error, ") :]
        elif error_type == "missing":
            message = f"请输入{field_label}"
        elif field == "email":
            message = "请输入有效的邮箱地址"
        elif error_type == "string_too_short":
            message = f"{field_label}至少 {context.get('min_length', 1)} 个字符"
        elif error_type == "string_too_long":
            message = f"{field_label}不能超过 {context.get('max_length')} 个字符"
        elif not message:
            message = f"{field_label}格式不正确"

        if message not in messages:
            messages.append(message)

    return "；".join(messages) if messages else "请求参数不正确"


@app.exception_handler(RequestValidationError)
async def request_validation_exception_handler(_, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content={
            "detail": build_validation_message(exc),
        },
    )


@app.get('/', include_in_schema=False)
def root() -> RedirectResponse:
    return RedirectResponse(url='/docs')


@app.get('/health', response_model=HealthResponse, tags=['health'])
def health_check() -> HealthResponse:
    return HealthResponse(status='ok', service='happy-exchange-backend')
