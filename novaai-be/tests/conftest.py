import pytest
from fastapi.testclient import TestClient

from app.core.config import Settings
from app.dependencies import get_action_item_service, get_ai_provider, get_settings
from app.main import create_app
from app.services.action_item_service import ActionItemService
from tests.helpers import DEFAULT_MOCK_ITEMS, MockAIProvider

__all__ = ["DEFAULT_MOCK_ITEMS", "MockAIProvider"]


@pytest.fixture
def test_settings() -> Settings:
    return Settings(
        MIN_TRANSCRIPT_LENGTH=10,
        MAX_TRANSCRIPT_LENGTH=100,
    )


@pytest.fixture
def client(test_settings: Settings) -> TestClient:
    app = create_app()
    app.dependency_overrides[get_settings] = lambda: test_settings
    app.dependency_overrides[get_ai_provider] = lambda: MockAIProvider()
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
    get_settings.cache_clear()


@pytest.fixture
def client_with_service_override(test_settings: Settings) -> TestClient:
    app = create_app()
    mock_provider = MockAIProvider()
    app.dependency_overrides[get_settings] = lambda: test_settings
    app.dependency_overrides[get_action_item_service] = lambda: ActionItemService(
        test_settings, mock_provider
    )
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
    get_settings.cache_clear()
