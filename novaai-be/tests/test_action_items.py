EXTRACT_URL = "/api/v1/action-items/extract"
VALID_TRANSCRIPT = "This is a valid meeting transcript with enough content."


def test_extract_action_items_success(client):
    response = client.post(EXTRACT_URL, json={"transcript": VALID_TRANSCRIPT})

    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 1
    assert len(data["action_items"]) == 1
    assert data["action_items"][0] == {
        "task": "Send the report",
        "owner": "Alice",
        "due_date": "Monday",
        "due_date_text": "Monday",
        "priority": "Not specified",
        "warnings": [],
    }


def test_extract_action_items_with_meeting_date(client):
    response = client.post(
        EXTRACT_URL,
        json={"transcript": VALID_TRANSCRIPT, "meeting_date": "2026-07-10"},
    )

    assert response.status_code == 200
    assert response.json()["count"] == 1


def test_extract_rejects_empty_transcript(client):
    response = client.post(EXTRACT_URL, json={"transcript": ""})

    assert response.status_code == 400
    data = response.json()
    assert data["error"]["code"] == "INVALID_TRANSCRIPT"
    assert data["error"]["message"] == "Transcript cannot be empty"


def test_extract_rejects_whitespace_transcript(client):
    response = client.post(EXTRACT_URL, json={"transcript": "   \n\t  "})

    assert response.status_code == 400
    data = response.json()
    assert data["error"]["code"] == "INVALID_TRANSCRIPT"
    assert data["error"]["message"] == "Transcript cannot be empty"


def test_extract_rejects_too_short_transcript(client):
    response = client.post(EXTRACT_URL, json={"transcript": "short"})

    assert response.status_code == 400
    data = response.json()
    assert data["error"]["code"] == "INVALID_TRANSCRIPT"
    assert data["error"]["message"] == "Transcript is too short"


def test_extract_rejects_too_long_transcript(client):
    response = client.post(EXTRACT_URL, json={"transcript": "a" * 101})

    assert response.status_code == 400
    data = response.json()
    assert data["error"]["code"] == "INVALID_TRANSCRIPT"
    assert data["error"]["message"] == "Transcript is too long"


def test_extract_rejects_corrupt_transcript(client):
    response = client.post(EXTRACT_URL, json={"transcript": "@@@@@@@@@@"})

    assert response.status_code == 400
    data = response.json()
    assert data["error"]["code"] == "INVALID_TRANSCRIPT"
    assert "corrupt or unreadable" in data["error"]["message"]


def test_dependency_override_support(client_with_service_override):
    response = client_with_service_override.post(
        EXTRACT_URL, json={"transcript": VALID_TRANSCRIPT}
    )

    assert response.status_code == 200
    assert response.json()["count"] == 1
