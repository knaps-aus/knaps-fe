from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from starlette.staticfiles import StaticFiles
import httpx


BASE_DIR = Path(__file__).resolve().parent
PUBLIC_DIR = BASE_DIR / "public"


def mount_static(app: FastAPI) -> None:
    if not PUBLIC_DIR.exists():
        raise RuntimeError(
            f"Could not find the build directory: {PUBLIC_DIR}, make sure to build the client first"
        )
    app.mount(
        "/",
        StaticFiles(directory=str(PUBLIC_DIR), html=True),
        name="static",
    )


def mount_vite_proxy(app: FastAPI, vite_url: str = "http://localhost:5173") -> None:
    @app.middleware("http")
    async def vite_proxy(request: Request, call_next):
        if request.url.path.startswith("/api"):
            return await call_next(request)
        target = f"{vite_url}{request.url.path}"
        if request.url.query:
            target += f"?{request.url.query}"
        async with httpx.AsyncClient() as client:
            vite_resp = await client.request(
                request.method,
                target,
                content=await request.body(),
                headers=request.headers.raw,
                follow_redirects=True,
            )
        response = StreamingResponse(
            vite_resp.aiter_raw(),
            status_code=vite_resp.status_code,
            headers=dict(vite_resp.headers),
        )
        return response
