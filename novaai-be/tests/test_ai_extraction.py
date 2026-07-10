import pytest
from fastapi.testclient import TestClient

from app.core.config import Settings
from app.core.exceptions import AIProviderError
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


def test_removes_duplicate_action_items(test_settings):
    duplicate_items = [
        ActionItem(task="Write summary", owner="Bob", due_date="Friday"),
        ActionItem(task="Write summary", owner="Bob", due_date="Friday"),
        ActionItem(task="Write summary", owner="bob", due_date="Next week"),
    ]
    client = _make_client(test_settings, MockAIProvider(items=duplicate_items))

    response = client.post(EXTRACT_URL, json={"transcript": VALID_TRANSCRIPT})

    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 1
    assert data["action_items"][0]["task"] == "Write summary"
    assert data["action_items"][0]["owner"] == "Bob"


def test_missing_owner_defaults_to_unassigned(test_settings):
    items = [ActionItem(task="Update the roadmap", owner="", due_date="Friday")]
    client = _make_client(test_settings, MockAIProvider(items=items))

    response = client.post(EXTRACT_URL, json={"transcript": VALID_TRANSCRIPT})

    assert response.status_code == 200
    data = response.json()
    assert data["action_items"][0]["owner"] == "Unassigned"


def test_missing_date_defaults_to_no_date_given(test_settings):
    items = [ActionItem(task="Review the proposal", owner="Alice", due_date="")]
    client = _make_client(test_settings, MockAIProvider(items=items))

    response = client.post(EXTRACT_URL, json={"transcript": VALID_TRANSCRIPT})

    assert response.status_code == 200
    data = response.json()
    assert data["action_items"][0]["due_date"] == "No date given"


def test_provider_error_returns_502(test_settings):
    client = _make_client(
        test_settings,
        MockAIProvider(error=AIProviderError("AI provider returned an error")),
    )

    response = client.post(EXTRACT_URL, json={"transcript": VALID_TRANSCRIPT})

    assert response.status_code == 502
    assert response.json()["error"]["code"] == "AI_PROVIDER_ERROR"


def test_timeout_returns_502(test_settings):
    client = _make_client(
        test_settings,
        MockAIProvider(error=AIProviderError("AI provider request timed out")),
    )

    response = client.post(EXTRACT_URL, json={"transcript": VALID_TRANSCRIPT})

    assert response.status_code == 502
    data = response.json()
    assert data["error"]["code"] == "AI_PROVIDER_ERROR"
    assert "timed out" in data["error"]["message"]


def test_unusable_transcript_returns_400(test_settings):
    client = _make_client(
        test_settings,
        MockAIProvider(
            items=[],
            is_usable_transcript=False,
            rejection_reason="The transcript does not contain a readable meeting conversation.",
        ),
    )

    response = client.post(EXTRACT_URL, json={"transcript": VALID_TRANSCRIPT})

    assert response.status_code == 400
    data = response.json()
    assert data["error"]["code"] == "INVALID_TRANSCRIPT"
    assert "readable meeting conversation" in data["error"]["message"]


def test_empty_result_returns_empty_list(test_settings):
    client = _make_client(test_settings, MockAIProvider(items=[]))

    response = client.post(EXTRACT_URL, json={"transcript": VALID_TRANSCRIPT})

    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 0
    assert data["action_items"] == []


def test_missing_api_key_returns_502(test_settings):
    client = _make_client(
        test_settings,
        MockAIProvider(error=AIProviderError("AI service is not configured")),
    )

    response = client.post(EXTRACT_URL, json={"transcript": VALID_TRANSCRIPT})

    assert response.status_code == 502
    data = response.json()
    assert data["error"]["code"] == "AI_PROVIDER_ERROR"
    assert "not configured" in data["error"]["message"]
