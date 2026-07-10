import logging

from fastapi import APIRouter, Depends

from app.dependencies import get_action_item_service, get_history_service
from app.models.requests import ExtractActionItemsRequest, SendToTrackerRequest
from app.models.responses import ExtractionResponse, TrackerResponse
from app.services.action_item_service import ActionItemService
from app.services.history_service import HistoryService

logger = logging.getLogger(__name__)

router = APIRouter(tags=["action-items"])


@router.post("/extract", response_model=ExtractionResponse)
def extract_action_items(
    request: ExtractActionItemsRequest,
    service: ActionItemService = Depends(get_action_item_service),
    history_service: HistoryService = Depends(get_history_service),
) -> ExtractionResponse:
    result = service.extract_action_items(request)

    extraction_id = None
    if history_service.enabled:
        extraction_id = history_service.save_extraction(
            transcript=request.transcript,
            meeting_date=request.meeting_date,
            action_items=result.action_items,
        )

    return ExtractionResponse(
        action_items=result.action_items,
        count=result.count,
        extraction_id=extraction_id,
    )


@router.post("/send-to-tracker", response_model=TrackerResponse)
def send_to_tracker(request: SendToTrackerRequest) -> TrackerResponse:
    logger.info(
        "Received %d action item(s) for tracker",
        len(request.action_items),
    )
    for i, item in enumerate(request.action_items, start=1):
        logger.info(
            "  [%d] task=%r owner=%r due_date=%r",
            i,
            item.task,
            item.owner,
            item.due_date,
        )
    return TrackerResponse(
        success=True,
        message="Action items sent to mock tracker",
    )
