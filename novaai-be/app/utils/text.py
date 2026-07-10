import re
from collections import Counter

from app.core.exceptions import InvalidTranscriptError

_CORRUPT_TRANSCRIPT_MESSAGE = (
    "This transcript appears to be corrupt or unreadable. "
    "Please paste a valid meeting conversation."
)
_UNUSABLE_TRANSCRIPT_MESSAGE = (
    "This transcript does not look like a usable meeting conversation. "
    "Please check the text and try again."
)


def validate_transcript(transcript: str, min_length: int, max_length: int) -> str:
    stripped = transcript.strip()

    if not stripped:
        raise InvalidTranscriptError("Transcript cannot be empty")

    if len(stripped) < min_length:
        raise InvalidTranscriptError("Transcript is too short")

    if len(stripped) > max_length:
        raise InvalidTranscriptError("Transcript is too long")

    return stripped


def validate_transcript_readability(transcript: str) -> None:
    words = re.findall(r"[a-zA-Z]{2,}", transcript)
    if len(words) < 3:
        raise InvalidTranscriptError(_CORRUPT_TRANSCRIPT_MESSAGE)

    non_whitespace = [char for char in transcript if not char.isspace()]
    if not non_whitespace:
        raise InvalidTranscriptError(_CORRUPT_TRANSCRIPT_MESSAGE)

    alpha_count = sum(1 for char in non_whitespace if char.isalpha())
    if alpha_count / len(non_whitespace) < 0.5:
        raise InvalidTranscriptError(_CORRUPT_TRANSCRIPT_MESSAGE)

    most_common_count = Counter(non_whitespace).most_common(1)[0][1]
    if most_common_count / len(non_whitespace) > 0.6:
        raise InvalidTranscriptError(_CORRUPT_TRANSCRIPT_MESSAGE)


def unusable_transcript_message(reason: str | None = None) -> str:
    if reason and reason.strip():
        return reason.strip()
    return _UNUSABLE_TRANSCRIPT_MESSAGE
