from functools import lru_cache

from fastapi import Depends

from app.core.config import Settings
from app.services.action_item_service import ActionItemService
from app.services.ai.base import AIProvider
from app.services.ai.openai_provider import OpenAIProvider
from app.services.history_service import HistoryService


@lru_cache
def get_settings() -> Settings:
    return Settings()


def get_ai_provider(settings: Settings = Depends(get_settings)) -> AIProvider:
    return OpenAIProvider(settings)


def get_action_item_service(
    settings: Settings = Depends(get_settings),
    provider: AIProvider = Depends(get_ai_provider),
) -> ActionItemService:
    return ActionItemService(settings, provider)


def get_history_service(
    settings: Settings = Depends(get_settings),
) -> HistoryService:
    return HistoryService(settings)
