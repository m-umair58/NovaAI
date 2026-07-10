from datetime import date

from app.core.config import Settings
from app.core.exceptions import InvalidTranscriptError
from app.models.requests import ExtractActionItemsRequest
from app.models.responses import ActionItem, ExtractionResponse
from app.services.ai.base import AIProvider
from app.services.date_normalizer import normalize_date
from app.utils.text import (
    unusable_transcript_message,
    validate_transcript,
    validate_transcript_readability,
)

_VALID_PRIORITIES = {"High", "Medium", "Low", "Not specified"}


class ActionItemService:
    def __init__(self, settings: Settings, provider: AIProvider) -> None:
        self._settings = settings
        self._provider = provider

    def extract_action_items(self, request: ExtractActionItemsRequest) -> ExtractionResponse:
        stripped = validate_transcript(
            request.transcript,
            self._settings.MIN_TRANSCRIPT_LENGTH,
            self._settings.MAX_TRANSCRIPT_LENGTH,
        )
        validate_transcript_readability(stripped)

        meeting_date_str = str(request.meeting_date) if request.meeting_date else None
        extraction = self._provider.extract_action_items(stripped, meeting_date_str)

        if not extraction.is_usable_transcript:
            raise InvalidTranscriptError(
                unusable_transcript_message(extraction.rejection_reason)
            )

        action_items = self._normalize(extraction.action_items, request.meeting_date)

        return ExtractionResponse(action_items=action_items, count=len(action_items))

    def _normalize(
        self, items: list[ActionItem], meeting_date: date | None = None
    ) -> list[ActionItem]:
        seen: set[tuple[str, str]] = set()
        result = []

        for item in items:
            task = item.task.strip()
            owner = (item.owner or "").strip()

            if not task:
                continue

            owner = owner or "Unassigned"

            # ── Due-date text ────────────────────────────────────────────────
            # Prefer the explicit due_date_text field.  When it is absent or
            # still at its default, fall back to the legacy due_date field so
            # that mock ActionItems created without due_date_text continue to
            # work correctly in tests.
            text_for_norm = item.due_date_text.strip()
            if text_for_norm in ("", "No date given"):
                fallback = (item.due_date or "").strip()
                text_for_norm = fallback or "No date given"

            # ── Normalize to ISO date ────────────────────────────────────────
            norm = normalize_date(text_for_norm, meeting_date)
            due_date = norm.normalized_date
            due_date_text = text_for_norm

            # ── Priority ─────────────────────────────────────────────────────
            priority = _normalize_priority(item.priority)

            # ── Warnings ─────────────────────────────────────────────────────
            warnings = _normalize_warnings(item.warnings)
            if norm.warning and norm.warning not in warnings:
                warnings = [*warnings, norm.warning]

            # ── Deduplication ─────────────────────────────────────────────────
            key = (task.lower(), owner.lower())
            if key in seen:
                continue
            seen.add(key)

            result.append(
                ActionItem(
                    task=task,
                    owner=owner,
                    due_date=due_date,
                    due_date_text=due_date_text,
                    priority=priority,
                    warnings=warnings,
                )
            )

        return result


# ---------------------------------------------------------------------------
# Module-level helpers
# ---------------------------------------------------------------------------


def _normalize_priority(raw: str | None) -> str:
    if not raw:
        return "Not specified"
    stripped = raw.strip()
    for valid in _VALID_PRIORITIES:
        if stripped.lower() == valid.lower():
            return valid
    return "Not specified"


def _normalize_warnings(raw: list[str] | None) -> list[str]:
    if not raw:
        return []
    seen: set[str] = set()
    result = []
    for w in raw:
        stripped = w.strip()
        if stripped and stripped not in seen:
            seen.add(stripped)
            result.append(stripped)
    return result
