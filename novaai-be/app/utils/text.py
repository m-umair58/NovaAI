from app.core.exceptions import InvalidTranscriptError


def validate_transcript(transcript: str, min_length: int, max_length: int) -> str:
    stripped = transcript.strip()

    if not stripped:
        raise InvalidTranscriptError("Transcript cannot be empty")

    if len(stripped) < min_length:
        raise InvalidTranscriptError("Transcript is too short")

    if len(stripped) > max_length:
        raise InvalidTranscriptError("Transcript is too long")

    return stripped
