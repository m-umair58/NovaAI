import logging
from datetime import date
from typing import Any

from supabase import Client

from app.core.config import Settings
from app.core.exceptions import ApplicationError
from app.db.supabase_client import _preview, create_supabase_client
from app.models.responses import (
    ActionItem,
    ExtractionDetailResponse,
    ExtractionSummary,
    StoredActionItem,
)

logger = logging.getLogger(__name__)


class HistoryService:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._client: Client | None = create_supabase_client(settings)

    @property
    def enabled(self) -> bool:
        return self._client is not None

    def save_extraction(
        self,
        transcript: str,
        meeting_date: date | None,
        action_items: list[ActionItem],
    ) -> str | None:
        if not self._client:
            return None

        try:
            extraction_row: dict[str, Any] = {
                "transcript": transcript,
                "transcript_preview": _preview(transcript),
                "meeting_date": meeting_date.isoformat() if meeting_date else None,
                "task_count": len(action_items),
            }
            extraction_result = (
                self._client.table("extractions").insert(extraction_row).execute()
            )
            extraction_id = extraction_result.data[0]["id"]

            if action_items:
                item_rows = [
                    {
                        "extraction_id": extraction_id,
                        "task": item.task,
                        "owner": item.owner,
                        "due_date": item.due_date,
                        "due_date_text": item.due_date_text,
                        "priority": item.priority,
                        "warnings": item.warnings,
                    }
                    for item in action_items
                ]
                self._client.table("action_items").insert(item_rows).execute()

            return extraction_id
        except Exception as exc:
            logger.exception("Failed to save extraction to Supabase: %s", exc)
            return None

    def list_extractions(self, limit: int = 50) -> list[ExtractionSummary]:
        if not self._client:
            return []

        try:
            result = (
                self._client.table("extractions")
                .select("id, transcript_preview, meeting_date, task_count, created_at")
                .order("created_at", desc=True)
                .limit(limit)
                .execute()
            )
            return [_map_summary(row) for row in result.data]
        except Exception as exc:
            logger.exception("Failed to list extractions from Supabase: %s", exc)
            raise ApplicationError(
                "Failed to load extraction history",
                "DATABASE_ERROR",
                502,
            ) from exc

    def get_extraction(self, extraction_id: str) -> ExtractionDetailResponse:
        if not self._client:
            raise ApplicationError(
                "History storage is not configured",
                "DATABASE_NOT_CONFIGURED",
                503,
            )

        try:
            extraction_result = (
                self._client.table("extractions")
                .select("id, transcript, transcript_preview, meeting_date, task_count, created_at")
                .eq("id", extraction_id)
                .single()
                .execute()
            )
            items_result = (
                self._client.table("action_items")
                .select(
                    "id, task, owner, due_date, due_date_text, priority, warnings"
                )
                .eq("extraction_id", extraction_id)
                .execute()
            )
        except Exception as exc:
            logger.exception("Failed to fetch extraction %s: %s", extraction_id, exc)
            raise ApplicationError(
                "Failed to load extraction details",
                "DATABASE_ERROR",
                502,
            ) from exc

        if not extraction_result.data:
            raise ApplicationError(
                "Extraction not found",
                "NOT_FOUND",
                404,
            )

        row = extraction_result.data
        action_items = [_map_action_item(item) for item in items_result.data]

        return ExtractionDetailResponse(
            id=row["id"],
            transcript=row["transcript"],
            transcript_preview=row["transcript_preview"],
            meeting_date=row.get("meeting_date"),
            task_count=row["task_count"],
            created_at=row["created_at"],
            action_items=action_items,
        )

    def delete_extraction(self, extraction_id: str) -> None:
        if not self._client:
            raise ApplicationError(
                "History storage is not configured",
                "DATABASE_NOT_CONFIGURED",
                503,
            )

        try:
            self._client.table("extractions").delete().eq("id", extraction_id).execute()
        except Exception as exc:
            logger.exception("Failed to delete extraction %s: %s", extraction_id, exc)
            raise ApplicationError(
                "Failed to delete extraction",
                "DATABASE_ERROR",
                502,
            ) from exc


def _map_summary(row: dict[str, Any]) -> ExtractionSummary:
    return ExtractionSummary(
        id=row["id"],
        transcript_preview=row["transcript_preview"],
        meeting_date=row.get("meeting_date"),
        task_count=row["task_count"],
        created_at=row["created_at"],
    )


def _map_action_item(row: dict[str, Any]) -> StoredActionItem:
    warnings = row.get("warnings") or []
    if not isinstance(warnings, list):
        warnings = []

    return StoredActionItem(
        id=row["id"],
        task=row["task"],
        owner=row["owner"],
        due_date=row.get("due_date"),
        due_date_text=row.get("due_date_text") or "No date given",
        priority=row.get("priority") or "Not specified",
        warnings=warnings,
    )
