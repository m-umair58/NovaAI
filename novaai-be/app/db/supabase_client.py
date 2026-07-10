import logging
from typing import Any

from supabase import Client, create_client

from app.core.config import Settings

logger = logging.getLogger(__name__)


def create_supabase_client(settings: Settings) -> Client | None:
    if not settings.supabase_enabled:
        return None

    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)


def _preview(transcript: str, max_length: int = 200) -> str:
    stripped = transcript.strip()
    if len(stripped) <= max_length:
        return stripped
    return f"{stripped[:max_length].rstrip()}..."
