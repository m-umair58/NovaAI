import logging

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.core.exceptions import ApplicationError

logger = logging.getLogger(__name__)


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(ApplicationError)
    async def application_error_handler(
        _request: Request, exc: ApplicationError
    ) -> JSONResponse:
        logger.warning(
            "Application error: code=%s message=%s details=%s",
            exc.code,
            exc.message,
            exc.details,
        )
        error_body: dict = {"code": exc.code, "message": exc.message}
        if exc.details is not None:
            error_body["details"] = exc.details
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": error_body},
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(_request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled exception: %s", type(exc).__name__)
        return JSONResponse(
            status_code=500,
            content={
                "error": {
                    "code": "INTERNAL_SERVER_ERROR",
                    "message": "An unexpected error occurred",
                }
            },
        )
