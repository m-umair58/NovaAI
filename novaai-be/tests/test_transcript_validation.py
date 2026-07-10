import pytest

from app.core.exceptions import InvalidTranscriptError
from app.utils.text import validate_transcript_readability

VALID_TRANSCRIPT = "This is a valid meeting transcript with enough content."


def test_validate_transcript_readability_accepts_valid_transcript():
    validate_transcript_readability(VALID_TRANSCRIPT)


def test_validate_transcript_readability_rejects_repeated_characters():
    with pytest.raises(InvalidTranscriptError) as exc_info:
        validate_transcript_readability("@@@@@@@@@@@@@@@@@@@@@@")

    assert exc_info.value.code == "INVALID_TRANSCRIPT"
    assert "corrupt or unreadable" in exc_info.value.message


def test_validate_transcript_readability_rejects_too_few_words():
    with pytest.raises(InvalidTranscriptError) as exc_info:
        validate_transcript_readability("abcdefgh ij")

    assert exc_info.value.code == "INVALID_TRANSCRIPT"


def test_validate_transcript_readability_rejects_symbol_heavy_text():
    with pytest.raises(InvalidTranscriptError) as exc_info:
        validate_transcript_readability("@@ ## $$ %% ^^ && ** (( ))")

    assert exc_info.value.code == "INVALID_TRANSCRIPT"
