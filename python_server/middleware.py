import logging
import time
import uuid
from fastapi import Request
from fastapi.responses import JSONResponse

logger = logging.getLogger("knaps")


class StructuredLoggingMiddleware:
    """ASGI middleware for logging request and response details."""

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        request = Request(scope, receive)
        request_id = str(uuid.uuid4())
        scope.setdefault("state", {})["request_id"] = request_id

        logger.info(
            "request",
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
            },
        )

        start = time.time()
        status_code = 500

        async def send_wrapper(message):
            nonlocal status_code
            if message["type"] == "http.response.start":
                status_code = message["status"]
            await send(message)

        await self.app(scope, receive, send_wrapper)
        duration = int((time.time() - start) * 1000)

        logger.info(
            "response",
            extra={
                "request_id": request_id,
                "status": status_code,
                "duration_ms": duration,
            },
        )


async def http_error_handler(request: Request, exc: Exception):
    from fastapi import HTTPException

    if isinstance(exc, HTTPException):
        status = exc.status_code
        message = exc.detail
    else:
        status = 500
        message = "Internal Server Error"
    return JSONResponse(status_code=status, content={"message": message})
