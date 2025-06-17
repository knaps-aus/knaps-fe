import json
import logging
import time
import uuid
from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("knaps")


class StructuredLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id

        try:
            body_bytes = await request.body()
            request._body = body_bytes
            body_text = body_bytes.decode("utf-8")
        except Exception:
            body_text = ""
        if len(body_text) > 100:
            body_text = body_text[:97] + "..."

        logger.info(
            "request",
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "body": body_text,
            },
        )

        start = time.time()
        response = await call_next(request)
        duration = int((time.time() - start) * 1000)

        resp_body = getattr(response, "body", b"")
        try:
            resp_text = resp_body.decode("utf-8") if resp_body else ""
        except Exception:
            resp_text = ""
        if len(resp_text) > 100:
            resp_text = resp_text[:97] + "..."

        logger.info(
            "response",
            extra={
                "request_id": request_id,
                "status": response.status_code,
                "duration_ms": duration,
                "body": resp_text,
            },
        )
        return response


async def http_error_handler(request: Request, exc: Exception):
    from fastapi import HTTPException

    if isinstance(exc, HTTPException):
        status = exc.status_code
        message = exc.detail
    else:
        status = 500
        message = "Internal Server Error"
    return JSONResponse(status_code=status, content={"message": message})
