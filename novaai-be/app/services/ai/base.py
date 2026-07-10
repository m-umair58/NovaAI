from abc import ABC, abstractmethod
from dataclasses import dataclass

from app.models.responses import ActionItem


@dataclass
class AIExtractionResult:
    action_items: list[ActionItem]
    is_usable_transcript: bool = True
    rejection_reason: str | None = None


class AIProvider(ABC):
    @abstractmethod
    def extract_action_items(
        self, transcript: str, meeting_date: str | None
    ) -> AIExtractionResult: ...
