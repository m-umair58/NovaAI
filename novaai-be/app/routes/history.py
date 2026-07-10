import logging

from fastapi import APIRouter, Depends, Query

from app.core.config import Settings
from app.dependencies import get_history_service, get_settings
from app.models.requests import SaveExtractionRequest
from app.models.responses import (
    ExtractionDetailResponse,
    ExtractionListResponse,
    SaveExtractionResponse,
)
from app.services.history_service import HistoryService
from app.utils.text import validate_transcript

logger = logging.getLogger(__name__)

router = APIRouter(tags=["history"])


def _validate_save_request(
    request: SaveExtractionRequest, settings: Settings
) -> str:
    return validate_transcript(
        request.transcript,
        settings.MIN_TRANSCRIPT_LENGTH,
        settings.MAX_TRANSCRIPT_LENGTH,
    )


@router.get("", response_model=ExtractionListResponse)
def list_extractions(
    limit: int = Query(default=50, ge=1, le=100),
    service: HistoryService = Depends(get_history_service),
) -> ExtractionListResponse:
    extractions = service.list_extractions(limit=limit)
    return ExtractionListResponse(extractions=extractions, count=len(extractions))


@router.post("", response_model=SaveExtractionResponse)
def save_extraction(
    request: SaveExtractionRequest,
    service: HistoryService = Depends(get_history_service),
    settings: Settings = Depends(get_settings),
) -> SaveExtractionResponse:
    transcript = _validate_save_request(request, settings)
    extraction_id = service.save_extraction(
        transcript=transcript,
        meeting_date=request.meeting_date,
        action_items=request.action_items,
    )
    return SaveExtractionResponse(extraction_id=extraction_id)


@router.put("/{extraction_id}", response_model=SaveExtractionResponse)
def update_extraction(
    extraction_id: str,
    request: SaveExtractionRequest,
    service: HistoryService = Depends(get_history_service),
    settings: Settings = Depends(get_settings),
) -> SaveExtractionResponse:
    transcript = _validate_save_request(request, settings)
    updated_id = service.update_extraction(
        extraction_id=extraction_id,
        transcript=transcript,
        meeting_date=request.meeting_date,
        action_items=request.action_items,
    )
    return SaveExtractionResponse(extraction_id=updated_id)


@router.get("/{extraction_id}", response_model=ExtractionDetailResponse)
def get_extraction(
    extraction_id: str,
    service: HistoryService = Depends(get_history_service),
) -> ExtractionDetailResponse:
    return service.get_extraction(extraction_id)


@router.delete("/{extraction_id}", status_code=204)
def delete_extraction(
    extraction_id: str,
    service: HistoryService = Depends(get_history_service),
) -> None:
    service.delete_extraction(extraction_id)
