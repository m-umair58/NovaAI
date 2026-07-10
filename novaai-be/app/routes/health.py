from fastapi import APIRouter, Depends

from app.core.config import Settings
from app.dependencies import get_settings
from app.models.responses import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
def health_check(settings: Settings = Depends(get_settings)) -> HealthResponse:
    return HealthResponse(
        status="healthy",
        service=settings.APP_NAME,
        version=settings.VERSION,
    )
