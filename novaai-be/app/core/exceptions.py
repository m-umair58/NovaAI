class ApplicationError(Exception):
    def __init__(
        self,
        message: str,
        code: str,
        status_code: int = 400,
        details: dict | None = None,
    ) -> None:
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details
        super().__init__(message)


class InvalidTranscriptError(ApplicationError):
    def __init__(self, message: str = "Invalid transcript") -> None:
        super().__init__(message=message, code="INVALID_TRANSCRIPT", status_code=400)


class AIProviderError(ApplicationError):
    def __init__(
        self,
        message: str = "AI provider error",
        details: dict | None = None,
    ) -> None:
        super().__init__(
            message=message,
            code="AI_PROVIDER_ERROR",
            status_code=502,
            details=details,
        )


class InvalidAIResponseError(ApplicationError):
    def __init__(
        self,
        message: str = "Invalid AI response",
        details: dict | None = None,
    ) -> None:
        super().__init__(
            message=message,
            code="INVALID_AI_RESPONSE",
            status_code=502,
            details=details,
        )
