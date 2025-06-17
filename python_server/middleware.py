from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import json
import time
from datetime import datetime


def log(message: str, source: str = "fastapi") -> None:
    formatted_time = datetime.now().strftime("%I:%M:%S %p")
    print(f"{formatted_time} [{source}] {message}")

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start = time.time()
        response = await call_next(request)
        duration = int((time.time() - start) * 1000)

        if request.url.path.startswith('/api'):
            body = getattr(response, 'body', None)
            summary = ''
            if body:
                try:
                    summary = json.dumps(json.loads(body))
                except Exception:
                    pass
            log_line = f"{request.method} {request.url.path} {response.status_code} in {duration}ms"
            if summary:
                log_line += f" :: {summary}"
            if len(log_line) > 80:
                log_line = log_line[:79] + '…'
            log(log_line)
        return response

async def http_error_handler(request: Request, exc: Exception):
    from fastapi import HTTPException
    if isinstance(exc, HTTPException):
        status = exc.status_code
        message = exc.detail
    else:
        status = 500
        message = 'Internal Server Error'
    return JSONResponse(status_code=status, content={'message': message})
