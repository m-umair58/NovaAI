import logging

import openai
from pydantic import BaseModel, Field

from app.core.config import Settings
from app.core.exceptions import AIProviderError, InvalidAIResponseError
from app.models.responses import ActionItem
from app.services.ai.base import AIProvider
from app.services.ai.openai_errors import build_openai_error
from app.services.ai.prompts import SYSTEM_PROMPT, build_user_message

logger = logging.getLogger(__name__)


class _AIActionItem(BaseModel):
    task: str
    owner: str
    due_date_text: str
    priority: str
    warnings: list[str] = Field(default_factory=list)


class _AIExtractionResult(BaseModel):
    action_items: list[_AIActionItem]


class OpenAIProvider(AIProvider):
    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._client: openai.OpenAI | None = None

        if settings.OPENAI_API_KEY:
            self._client = openai.OpenAI(
                api_key=settings.OPENAI_API_KEY,
                timeout=float(settings.OPENAI_TIMEOUT_SECONDS),
                max_retries=settings.OPENAI_MAX_RETRIES,
            )

    def extract_action_items(
        self, transcript: str, meeting_date: str | None
    ) -> list[ActionItem]:
        if self._client is None:
            raise AIProviderError(
                "AI service is not configured — set OPENAI_API_KEY in your environment",
                details={"provider": "openai", "error_type": "configuration_error"},
            )

        model = self._settings.OPENAI_MODEL
        user_message = build_user_message(transcript, meeting_date)

        try:
            completion = self._client.beta.chat.completions.parse(
                model=model,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_message},
                ],
                response_format=_AIExtractionResult,
            )
        except (
            openai.APITimeoutError,
            openai.APIConnectionError,
            openai.AuthenticationError,
            openai.RateLimitError,
            openai.APIError,
        ) as exc:
            message, details = build_openai_error(exc, model)
            logger.error(
                "OpenAI request failed: model=%s error_type=%s message=%s",
                model,
                details.get("error_type"),
                details.get("provider_message"),
            )
            raise AIProviderError(message, details=details) from exc
        except Exception as exc:
            message, details = build_openai_error(exc, model)
            logger.exception("Unexpected error during OpenAI request: model=%s", model)
            raise AIProviderError(message, details=details) from exc

        result = completion.choices[0].message.parsed
        if result is None:
            refusal = completion.choices[0].message.refusal
            raise InvalidAIResponseError(
                "AI provider returned an unparseable response",
                details={
                    "provider": "openai",
                    "model": model,
                    "error_type": "unparseable_response",
                    "refusal": refusal,
                },
            )

        return [
            ActionItem(
                task=item.task,
                owner=item.owner,
                due_date=None,  # Filled by the service's date normalizer
                due_date_text=item.due_date_text,
                priority=item.priority,
                warnings=item.warnings,
            )
            for item in result.action_items
        ]
