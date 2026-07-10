import openai


def build_openai_error(exc: Exception, model: str) -> tuple[str, dict]:
    """Return a human-readable message and structured details from an OpenAI SDK error."""
    if isinstance(exc, openai.APITimeoutError):
        return (
            "OpenAI request timed out",
            {
                "provider": "openai",
                "model": model,
                "error_type": "timeout_error",
                "provider_message": str(exc),
            },
        )

    if isinstance(exc, openai.APIConnectionError):
        return (
            "Unable to connect to OpenAI — check your network connection",
            {
                "provider": "openai",
                "model": model,
                "error_type": "connection_error",
                "provider_message": str(exc),
            },
        )

    if isinstance(exc, openai.AuthenticationError):
        provider_message = _extract_provider_message(exc)
        return (
            f"OpenAI authentication failed: {provider_message}",
            {
                "provider": "openai",
                "model": model,
                "status_code": getattr(exc, "status_code", None),
                "error_type": "authentication_error",
                "provider_message": provider_message,
            },
        )

    if isinstance(exc, openai.RateLimitError):
        provider_message = _extract_provider_message(exc)
        return (
            f"OpenAI rate limit exceeded: {provider_message}",
            {
                "provider": "openai",
                "model": model,
                "status_code": getattr(exc, "status_code", None),
                "error_type": "rate_limit_error",
                "provider_message": provider_message,
            },
        )

    if isinstance(exc, openai.APIError):
        provider_message = _extract_provider_message(exc)
        error_type = _extract_error_type(exc)
        status_code = getattr(exc, "status_code", None)
        return (
            f"OpenAI API error ({error_type}): {provider_message}",
            {
                "provider": "openai",
                "model": model,
                "status_code": status_code,
                "error_type": error_type,
                "provider_message": provider_message,
            },
        )

    return (
        f"Unexpected OpenAI error: {exc}",
        {
            "provider": "openai",
            "model": model,
            "error_type": type(exc).__name__,
            "provider_message": str(exc),
        },
    )


def _extract_provider_message(exc: openai.APIError) -> str:
    body = getattr(exc, "body", None)
    if isinstance(body, dict):
        error_obj = body.get("error")
        if isinstance(error_obj, dict) and error_obj.get("message"):
            return str(error_obj["message"])
    message = getattr(exc, "message", None)
    if message:
        return str(message)
    return str(exc)


def _extract_error_type(exc: openai.APIError) -> str:
    body = getattr(exc, "body", None)
    if isinstance(body, dict):
        error_obj = body.get("error")
        if isinstance(error_obj, dict) and error_obj.get("type"):
            return str(error_obj["type"])
    error_type = getattr(exc, "type", None)
    if error_type:
        return str(error_type)
    return type(exc).__name__
