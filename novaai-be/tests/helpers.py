from app.models.responses import ActionItem
from app.services.ai.base import AIProvider

DEFAULT_MOCK_ITEMS = [
    ActionItem(task="Send the report", owner="Alice", due_date="Monday"),
]


class MockAIProvider(AIProvider):
    def __init__(
        self,
        items: list[ActionItem] | None = None,
        error: Exception | None = None,
    ) -> None:
        self._items = items if items is not None else list(DEFAULT_MOCK_ITEMS)
        self._error = error

    def extract_action_items(
        self, transcript: str, meeting_date: str | None
    ) -> list[ActionItem]:
        if self._error:
            raise self._error
        return self._items
