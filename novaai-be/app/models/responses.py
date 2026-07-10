from pydantic import BaseModel, Field


class ActionItem(BaseModel):
    task: str
    owner: str
    due_date: str | None = None
    due_date_text: str = "No date given"
    priority: str = "Not specified"
    warnings: list[str] = Field(default_factory=list)


class StoredActionItem(ActionItem):
    id: str


class ExtractionResponse(BaseModel):
    action_items: list[ActionItem]
    count: int


class SaveExtractionResponse(BaseModel):
    extraction_id: str


class ExtractionSummary(BaseModel):
    id: str
    transcript_preview: str
    meeting_date: str | None = None
    task_count: int
    created_at: str


class ExtractionListResponse(BaseModel):
    extractions: list[ExtractionSummary]
    count: int


class ExtractionDetailResponse(BaseModel):
    id: str
    transcript: str
    transcript_preview: str
    meeting_date: str | None = None
    task_count: int
    created_at: str
    action_items: list[StoredActionItem]


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str


class ErrorDetail(BaseModel):
    code: str
    message: str
    details: dict | None = None


class ErrorResponse(BaseModel):
    error: ErrorDetail


class TrackerResponse(BaseModel):
    success: bool
    message: str
