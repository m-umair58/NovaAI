from abc import ABC, abstractmethod

from app.models.responses import ActionItem


class AIProvider(ABC):
    @abstractmethod
    def extract_action_items(
        self, transcript: str, meeting_date: str | None
    ) -> list[ActionItem]: ...
