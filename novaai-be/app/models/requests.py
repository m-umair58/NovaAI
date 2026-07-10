from datetime import date

from pydantic import BaseModel

from app.models.responses import ActionItem


class ExtractActionItemsRequest(BaseModel):
    transcript: str
    meeting_date: date | None = None


class SendToTrackerRequest(BaseModel):
    action_items: list[ActionItem]
