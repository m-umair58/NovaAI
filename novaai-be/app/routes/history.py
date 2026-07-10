import logging

from fastapi import APIRouter, Depends, Query

from app.dependencies import get_history_service
from app.models.responses import ExtractionDetailResponse, ExtractionListResponse
from app.services.history_service import HistoryService

logger = logging.getLogger(__name__)

router = APIRouter(tags=["history"])


@router.get("", response_model=ExtractionListResponse)
def list_extractions(
    limit: int = Query(default=50, ge=1, le=100),
    service: HistoryService = Depends(get_history_service),
) -> ExtractionListResponse:
    extractions = service.list_extractions(limit=limit)
    return ExtractionListResponse(extractions=extractions, count=len(extractions))


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
