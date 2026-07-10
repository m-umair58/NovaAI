"""Tests for duplicate merging, conflict detection, and warning normalization."""

import pytest
from fastapi.testclient import TestClient

from app.core.config import Settings
from app.dependencies import get_ai_provider, get_settings
from app.main import create_app
from app.models.responses import ActionItem
from tests.helpers import MockAIProvider

EXTRACT_URL = "/api/v1/action-items/extract"
VALID_TRANSCRIPT = "This is a valid meeting transcript with enough content."


def _make_client(test_settings: Settings, provider: MockAIProvider) -> TestClient:
    app = create_app()
    app.dependency_overrides[get_settings] = lambda: test_settings
    app.dependency_overrides[get_ai_provider] = lambda: provider
    return TestClient(app, raise_server_exceptions=False)


@pytest.fixture
def test_settings() -> Settings:
    return Settings(MIN_TRANSCRIPT_LENGTH=10, MAX_TRANSCRIPT_LENGTH=500)


# ──────────────────────────────────────────────────────────────
# 1. Exact duplicate items returned once
# ──────────────────────────────────────────────────────────────


def test_exact_duplicates_returned_once(test_settings):
    items = [
        ActionItem(task="Prepare the report", owner="Sarah", due_date="Friday"),
        ActionItem(task="Prepare the report", owner="Sarah", due_date="Friday"),
    ]
    client = _make_client(test_settings, MockAIProvider(items=items))

    response = client.post(EXTRACT_URL, json={"transcript": VALID_TRANSCRIPT})

    data = response.json()
    assert data["count"] == 1
    assert len(data["action_items"]) == 1


# ──────────────────────────────────────────────────────────────
# 2. Merged references produce a single item
#    (AI returns the already-merged result; service accepts it)
# ──────────────────────────────────────────────────────────────


def test_merged_references_produce_single_item(test_settings):
    items = [
        ActionItem(
            task="Prepare the release notes including migration details",
            owner="Sarah",
            due_date="No date given",
            warnings=[],
        )
    ]
    client = _make_client(test_settings, MockAIProvider(items=items))

    response = client.post(EXTRACT_URL, json={"transcript": VALID_TRANSCRIPT})

    data = response.json()
    assert data["count"] == 1
    assert "migration details" in data["action_items"][0]["task"]
    assert data["action_items"][0]["warnings"] == []


# ──────────────────────────────────────────────────────────────
# 3. Later deadline correction replaces earlier deadline
# ──────────────────────────────────────────────────────────────


def test_later_deadline_correction_uses_new_date(test_settings):
    items = [
        ActionItem(
            task="Send the report",
            owner="Sarah",
            due_date="Monday",
            warnings=[],
        )
    ]
    client = _make_client(test_settings, MockAIProvider(items=items))

    response = client.post(EXTRACT_URL, json={"transcript": VALID_TRANSCRIPT})

    data = response.json()
    assert data["action_items"][0]["due_date"] == "Monday"
    assert data["action_items"][0]["warnings"] == []


# ──────────────────────────────────────────────────────────────
# 4. Later owner reassignment replaces earlier owner
# ──────────────────────────────────────────────────────────────


def test_later_owner_reassignment_uses_new_owner(test_settings):
    items = [
        ActionItem(
            task="Prepare the report",
            owner="Emily",
            due_date="No date given",
            warnings=[],
        )
    ]
    client = _make_client(test_settings, MockAIProvider(items=items))

    response = client.post(EXTRACT_URL, json={"transcript": VALID_TRANSCRIPT})

    data = response.json()
    assert data["action_items"][0]["owner"] == "Emily"
    assert data["action_items"][0]["warnings"] == []


# ──────────────────────────────────────────────────────────────
# 5. Unresolved due-date conflict includes a warning
# ──────────────────────────────────────────────────────────────


def test_unresolved_due_date_conflict_adds_warning(test_settings):
    items = [
        ActionItem(
            task="Send the release notes",
            owner="Sarah",
            due_date="No date given",
            warnings=[
                "Conflicting due dates mentioned: Friday and Monday. "
                "No final deadline was clearly confirmed."
            ],
        )
    ]
    client = _make_client(test_settings, MockAIProvider(items=items))

    response = client.post(EXTRACT_URL, json={"transcript": VALID_TRANSCRIPT})

    data = response.json()
    item = data["action_items"][0]
    assert len(item["warnings"]) == 1
    assert "Friday" in item["warnings"][0]
    assert "Monday" in item["warnings"][0]


# ──────────────────────────────────────────────────────────────
# 6. Unresolved owner conflict includes a warning
# ──────────────────────────────────────────────────────────────


def test_unresolved_owner_conflict_adds_warning(test_settings):
    items = [
        ActionItem(
            task="Prepare the deployment checklist",
            owner="Unassigned",
            due_date="No date given",
            warnings=[
                "Conflicting owners mentioned: John and Emily. "
                "Final ownership was not clearly confirmed."
            ],
        )
    ]
    client = _make_client(test_settings, MockAIProvider(items=items))

    response = client.post(EXTRACT_URL, json={"transcript": VALID_TRANSCRIPT})

    data = response.json()
    item = data["action_items"][0]
    assert item["owner"] == "Unassigned"
    assert any("John" in w and "Emily" in w for w in item["warnings"])


# ──────────────────────────────────────────────────────────────
# 7. Multiple distinct warnings are preserved
# ──────────────────────────────────────────────────────────────


def test_multiple_distinct_warnings_preserved(test_settings):
    items = [
        ActionItem(
            task="Prepare the report",
            owner="Unassigned",
            due_date="No date given",
            warnings=[
                "Conflicting owners mentioned: John and Emily.",
                "Conflicting due dates mentioned: Friday and Monday.",
            ],
        )
    ]
    client = _make_client(test_settings, MockAIProvider(items=items))

    response = client.post(EXTRACT_URL, json={"transcript": VALID_TRANSCRIPT})

    data = response.json()
    assert len(data["action_items"][0]["warnings"]) == 2


# ──────────────────────────────────────────────────────────────
# 8. Duplicate warnings are removed
# ──────────────────────────────────────────────────────────────


def test_duplicate_warnings_are_removed(test_settings):
    repeated_warning = "Conflicting due dates mentioned: Friday and Monday."
    items = [
        ActionItem(
            task="Prepare the report",
            owner="Sarah",
            due_date="No date given",
            warnings=[repeated_warning, repeated_warning],
        )
    ]
    client = _make_client(test_settings, MockAIProvider(items=items))

    response = client.post(EXTRACT_URL, json={"transcript": VALID_TRANSCRIPT})

    data = response.json()
    assert data["action_items"][0]["warnings"] == [repeated_warning]


# ──────────────────────────────────────────────────────────────
# 9. Empty warning strings are removed
# ──────────────────────────────────────────────────────────────


def test_empty_warning_strings_are_removed(test_settings):
    items = [
        ActionItem(
            task="Prepare the report",
            owner="Sarah",
            due_date="Friday",
            warnings=["", "  ", "Real warning about a conflict."],
        )
    ]
    client = _make_client(test_settings, MockAIProvider(items=items))

    response = client.post(EXTRACT_URL, json={"transcript": VALID_TRANSCRIPT})

    data = response.json()
    assert data["action_items"][0]["warnings"] == ["Real warning about a conflict."]


# ──────────────────────────────────────────────────────────────
# 10. No-conflict items return warnings as empty list
# ──────────────────────────────────────────────────────────────


def test_no_conflict_item_has_empty_warnings(test_settings):
    items = [
        ActionItem(task="Write the summary", owner="Alice", due_date="Friday", warnings=[])
    ]
    client = _make_client(test_settings, MockAIProvider(items=items))

    response = client.post(EXTRACT_URL, json={"transcript": VALID_TRANSCRIPT})

    data = response.json()
    assert data["action_items"][0]["warnings"] == []


# ──────────────────────────────────────────────────────────────
# 11 & 12. Existing response fields remain unchanged; API compat
#     Covered by test_action_items.py — duplicated here for clarity.
# ──────────────────────────────────────────────────────────────


def test_response_has_all_required_fields(test_settings):
    client = _make_client(test_settings, MockAIProvider())

    response = client.post(EXTRACT_URL, json={"transcript": VALID_TRANSCRIPT})

    data = response.json()
    item = data["action_items"][0]
    assert "task" in item
    assert "owner" in item
    assert "due_date" in item
    assert "due_date_text" in item
    assert "priority" in item
    assert "warnings" in item
    assert isinstance(item["warnings"], list)
    assert isinstance(item["priority"], str)


# ──────────────────────────────────────────────────────────────
# 13. count matches the final merged action-item list length
# ──────────────────────────────────────────────────────────────


def test_count_matches_final_item_list(test_settings):
    items = [
        ActionItem(task="Task A", owner="Alice", due_date="Friday", warnings=[]),
        ActionItem(task="Task B", owner="Bob", due_date="Monday", warnings=["Some conflict."]),
        ActionItem(task="Task A", owner="Alice", due_date="Friday", warnings=[]),  # exact dup
    ]
    client = _make_client(test_settings, MockAIProvider(items=items))

    response = client.post(EXTRACT_URL, json={"transcript": VALID_TRANSCRIPT})

    data = response.json()
    assert data["count"] == 2
    assert len(data["action_items"]) == 2
