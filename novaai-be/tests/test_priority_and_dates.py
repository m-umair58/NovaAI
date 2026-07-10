"""
Tests for priority extraction and deadline normalisation.

All AI calls are mocked — no real OpenAI requests are made.
Meeting date used throughout: 2026-07-10 (Friday).
"""

from fastapi.testclient import TestClient

from app.core.config import Settings
from app.dependencies import get_ai_provider, get_settings
from app.main import create_app
from app.models.responses import ActionItem
from tests.helpers import MockAIProvider

EXTRACT_URL = "/api/v1/action-items/extract"
VALID_TRANSCRIPT = "This is a valid meeting transcript with enough content."
MEETING_DATE = "2026-07-10"  # Friday


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _make_client(items: list[ActionItem]) -> TestClient:
    settings = Settings(MIN_TRANSCRIPT_LENGTH=10, MAX_TRANSCRIPT_LENGTH=500)
    app = create_app()
    app.dependency_overrides[get_settings] = lambda: settings
    app.dependency_overrides[get_ai_provider] = lambda: MockAIProvider(items=items)
    return TestClient(app, raise_server_exceptions=False)


def _post(client: TestClient, *, with_date: bool = True) -> dict:
    body: dict = {"transcript": VALID_TRANSCRIPT}
    if with_date:
        body["meeting_date"] = MEETING_DATE
    return client.post(EXTRACT_URL, json=body).json()


def _item(data: dict, idx: int = 0) -> dict:
    return data["action_items"][idx]


def _single(items: list[ActionItem], *, with_date: bool = True) -> dict:
    """Post a single-item mock and return the first action item in the response."""
    return _item(_post(_make_client(items), with_date=with_date))


# ---------------------------------------------------------------------------
# PRIORITY TESTS
# ---------------------------------------------------------------------------


# 1. Explicit urgent language → High
def test_explicit_urgent_returns_high():
    items = [ActionItem(task="Fix the bug", owner="Alice", priority="High")]
    result = _single(items)
    assert result["priority"] == "High"


# 2. Explicit P0 → the AI maps P0 to High in the prompt; mock returns High
def test_p0_returns_high():
    items = [ActionItem(task="Deploy hotfix", owner="Bob", priority="High")]
    result = _single(items)
    assert result["priority"] == "High"


# 3. Explicit P1 → Medium
def test_p1_returns_medium():
    items = [ActionItem(task="Update docs", owner="Carol", priority="Medium")]
    result = _single(items)
    assert result["priority"] == "Medium"


# 4. Nice-to-have language → Low
def test_nice_to_have_returns_low():
    items = [ActionItem(task="Refactor logger", owner="Dave", priority="Low")]
    result = _single(items)
    assert result["priority"] == "Low"


# 5. No priority language → Not specified
def test_no_priority_language_returns_not_specified():
    items = [ActionItem(task="Send report", owner="Eve")]
    result = _single(items)
    assert result["priority"] == "Not specified"


# 6. Short deadline without priority language → Not specified
def test_short_deadline_alone_does_not_set_priority():
    items = [
        ActionItem(
            task="Submit form", owner="Frank", due_date_text="tomorrow", priority="Not specified"
        )
    ]
    result = _single(items)
    assert result["priority"] == "Not specified"


# 7. Clear priority revision → latest value (High overwrites Low)
def test_clear_priority_revision_uses_latest():
    # AI returns the final corrected value; no warning expected.
    items = [
        ActionItem(
            task="Fix login bug",
            owner="Grace",
            priority="High",
            warnings=[],
        )
    ]
    result = _single(items)
    assert result["priority"] == "High"
    assert result["warnings"] == []


# 8. Unresolved priority conflict → Not specified + warning
def test_unresolved_priority_conflict_returns_not_specified_with_warning():
    items = [
        ActionItem(
            task="Migrate database",
            owner="Heidi",
            priority="Not specified",
            warnings=[
                "Conflicting priorities mentioned: High and Low. "
                "Final priority was not clearly confirmed."
            ],
        )
    ]
    result = _single(items)
    assert result["priority"] == "Not specified"
    assert len(result["warnings"]) == 1
    assert "High" in result["warnings"][0]
    assert "Low" in result["warnings"][0]


# 9. Provider returns an invalid priority string → service normalises to Not specified
def test_invalid_provider_priority_normalised_to_not_specified():
    items = [ActionItem(task="Review PR", owner="Ivan", priority="URGENT_LEVEL_5")]
    result = _single(items)
    assert result["priority"] == "Not specified"


# 10. Existing warnings are preserved alongside a valid priority
def test_existing_warnings_preserved_with_priority():
    items = [
        ActionItem(
            task="Write tests",
            owner="Judy",
            priority="High",
            warnings=["Conflicting owners mentioned: Judy and Karl."],
        )
    ]
    result = _single(items)
    assert result["priority"] == "High"
    assert len(result["warnings"]) == 1
    assert "Judy" in result["warnings"][0]


# ---------------------------------------------------------------------------
# DEADLINE TESTS
# ---------------------------------------------------------------------------


# 11. Exact ISO date is returned unchanged
def test_exact_iso_date_unchanged():
    items = [ActionItem(task="Deploy", owner="Alice", due_date_text="2026-07-20")]
    result = _single(items)
    assert result["due_date"] == "2026-07-20"
    assert result["due_date_text"] == "2026-07-20"


# 12. Month and day normalise using the meeting year
def test_month_day_normalised_with_meeting_year():
    items = [ActionItem(task="Send invoice", owner="Bob", due_date_text="July 20")]
    result = _single(items)
    assert result["due_date"] == "2026-07-20"
    assert result["due_date_text"] == "July 20"


# 13. Month, day, and explicit year normalise correctly
def test_month_day_year_normalised_correctly():
    items = [ActionItem(task="Audit", owner="Carol", due_date_text="July 20, 2026")]
    result = _single(items)
    assert result["due_date"] == "2026-07-20"
    assert result["due_date_text"] == "July 20, 2026"


# 14. "tomorrow" normalises to meeting_date + 1 day
def test_tomorrow_normalised():
    items = [ActionItem(task="Call client", owner="Dave", due_date_text="tomorrow")]
    result = _single(items)
    assert result["due_date"] == "2026-07-11"
    assert result["due_date_text"] == "tomorrow"


# 15. "next Friday" normalises to the following Friday (meeting_date is Friday)
def test_next_friday_normalised():
    items = [ActionItem(task="Review PR", owner="Eve", due_date_text="next Friday")]
    result = _single(items)
    assert result["due_date"] == "2026-07-17"
    assert result["due_date_text"] == "next Friday"


# 16. "in three days" normalises correctly
def test_in_three_days_normalised():
    items = [ActionItem(task="Update readme", owner="Frank", due_date_text="in three days")]
    result = _single(items)
    assert result["due_date"] == "2026-07-13"
    assert result["due_date_text"] == "in three days"


# 17. "end of this week" → Sunday of current week (Mon–Sun)
#     Meeting date 2026-07-10 (Friday) → Sunday 2026-07-12
def test_end_of_this_week_normalised():
    items = [ActionItem(task="Write summary", owner="Grace", due_date_text="end of this week")]
    result = _single(items)
    assert result["due_date"] == "2026-07-12"
    assert result["due_date_text"] == "end of this week"


# 18. "end of next week" → Sunday of next week
#     Meeting date 2026-07-10 → Sunday 2026-07-19
def test_end_of_next_week_normalised():
    items = [ActionItem(task="Prepare slides", owner="Heidi", due_date_text="end of next week")]
    result = _single(items)
    assert result["due_date"] == "2026-07-19"
    assert result["due_date_text"] == "end of next week"


# 19. "end of July" normalises to last day of July
def test_end_of_month_normalised():
    items = [ActionItem(task="File report", owner="Ivan", due_date_text="end of July")]
    result = _single(items)
    assert result["due_date"] == "2026-07-31"
    assert result["due_date_text"] == "end of July"


# 20. Relative date without meeting_date remains as original text
def test_relative_date_without_meeting_date_unchanged():
    items = [ActionItem(task="Draft proposal", owner="Judy", due_date_text="next Friday")]
    result = _single(items, with_date=False)
    assert result["due_date"] == "next Friday"
    assert result["due_date_text"] == "next Friday"


# 21. "No date given" returns "No date given" for both fields
def test_no_deadline_returns_no_date_given():
    items = [ActionItem(task="Organise files", owner="Karl", due_date_text="No date given")]
    result = _single(items)
    assert result["due_date"] == "No date given"
    assert result["due_date_text"] == "No date given"


# 22. Ambiguous ordinal reference → original text + normalisation warning
def test_ambiguous_ordinal_returns_original_with_warning():
    items = [ActionItem(task="Submit form", owner="Lara", due_date_text="by the 5th")]
    result = _single(items)
    assert result["due_date"] == "by the 5th"
    assert result["due_date_text"] == "by the 5th"
    assert any("month" in w.lower() for w in result["warnings"])


# 23. Later corrected deadline is normalised from the final value
#     (AI already returns the corrected phrase; service normalises it)
def test_corrected_deadline_normalised():
    items = [
        ActionItem(
            task="Send update",
            owner="Mike",
            due_date_text="Monday",
            warnings=[],
        )
    ]
    result = _single(items)
    # meeting_date 2026-07-10 (Friday); next Monday = 2026-07-13
    assert result["due_date"] == "2026-07-13"
    assert result["due_date_text"] == "Monday"
    assert result["warnings"] == []


# 24. Unresolved deadline conflict keeps due_date as "No date given"
def test_unresolved_deadline_conflict_keeps_no_date_given():
    items = [
        ActionItem(
            task="Finalise contract",
            owner="Nina",
            due_date_text="No date given",
            warnings=[
                "Conflicting due dates mentioned: Friday and Monday. "
                "No final deadline was clearly confirmed."
            ],
        )
    ]
    result = _single(items)
    assert result["due_date"] == "No date given"
    assert len(result["warnings"]) >= 1
    assert any("Friday" in w and "Monday" in w for w in result["warnings"])


# 25. count still matches the final action-item count after normalisation
def test_count_matches_after_normalisation():
    items = [
        ActionItem(task="Task A", owner="Oscar", due_date_text="July 20"),
        ActionItem(task="Task B", owner="Paula", due_date_text="tomorrow"),
    ]
    data = _post(_make_client(items))
    assert data["count"] == 2
    assert len(data["action_items"]) == 2


# 26. All existing tests in test_action_items.py still pass — verified by running
#     the full suite.  Here we add a sanity check on the combined field set.
def test_all_required_fields_present_in_response():
    items = [ActionItem(task="Final check", owner="Quinn", due_date_text="July 20")]
    result = _single(items)
    for field in ("task", "owner", "due_date", "due_date_text", "priority", "warnings"):
        assert field in result, f"Missing field: {field}"
    assert isinstance(result["warnings"], list)
    assert isinstance(result["priority"], str)
    assert isinstance(result["due_date_text"], str)
