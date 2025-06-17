from pathlib import Path
from fastapi import FastAPI
from starlette.staticfiles import StaticFiles

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


