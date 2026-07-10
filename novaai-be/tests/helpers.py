from app.models.responses import ActionItem
from app.services.ai.base import AIExtractionResult, AIProvider

DEFAULT_MOCK_ITEMS = [
    ActionItem(task="Send the report", owner="Alice", due_date="Monday"),
]


class MockAIProvider(AIProvider):
    def __init__(
        self,
        items: list[ActionItem] | None = None,
        error: Exception | None = None,
        is_usable_transcript: bool = True,
        rejection_reason: str | None = None,
    ) -> None:
        self._items = items if items is not None else list(DEFAULT_MOCK_ITEMS)
        self._error = error
        self._is_usable_transcript = is_usable_transcript
        self._rejection_reason = rejection_reason

    def extract_action_items(
        self, transcript: str, meeting_date: str | None
    ) -> AIExtractionResult:
        if self._error:
            raise self._error
        return AIExtractionResult(
            action_items=self._items,
            is_usable_transcript=self._is_usable_transcript,
            rejection_reason=self._rejection_reason,
        )
