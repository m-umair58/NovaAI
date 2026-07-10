import openai

from app.services.ai.openai_errors import build_openai_error


class _FakeAPIError(openai.APIError):
    def __init__(self) -> None:
        self.message = "Invalid parameter"
        self.status_code = 400
        self.body = {
            "error": {
                "message": "response_format not supported for this model",
                "type": "invalid_request_error",
            }
        }
        self.type = "invalid_request_error"


def test_build_openai_error_from_api_error_body():
    message, details = build_openai_error(_FakeAPIError(), "gpt-4")

    assert "response_format not supported" in message
    assert details["provider"] == "openai"
    assert details["model"] == "gpt-4"
    assert details["status_code"] == 400
    assert details["error_type"] == "invalid_request_error"


def test_provider_error_includes_details_in_response(test_settings):
    from fastapi.testclient import TestClient

    from app.core.exceptions import AIProviderError
    from app.dependencies import get_ai_provider, get_settings
    from app.main import create_app
    from tests.helpers import MockAIProvider

    app = create_app()
    app.dependency_overrides[get_settings] = lambda: test_settings
    app.dependency_overrides[get_ai_provider] = lambda: MockAIProvider(
        error=AIProviderError(
            "OpenAI API error (invalid_request_error): model not supported",
            details={
                "provider": "openai",
                "model": "gpt-4",
                "status_code": 400,
                "error_type": "invalid_request_error",
                "provider_message": "model not supported",
            },
        )
    )
    client = TestClient(app, raise_server_exceptions=False)

    response = client.post(
        "/api/v1/action-items/extract",
        json={"transcript": "This is a valid meeting transcript with enough content."},
    )

    assert response.status_code == 502
    data = response.json()
    assert data["error"]["code"] == "AI_PROVIDER_ERROR"
    assert "model not supported" in data["error"]["message"]
    assert data["error"]["details"]["status_code"] == 400
    assert data["error"]["details"]["model"] == "gpt-4"
