from fastapi import APIRouter

from app.dependencies import get_settings
from app.routes import action_items, health, history

settings = get_settings()

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(
    action_items.router,
    prefix=f"{settings.API_V1_PREFIX}/action-items",
)
api_router.include_router(
    history.router,
    prefix=f"{settings.API_V1_PREFIX}/history",
)
