from fastapi import FastAPI

from .database import init_db
from .config import settings
from .middleware import log


from .middleware import LoggingMiddleware, http_error_handler
from .routes.products.router import router as products_router
from .routes.sell_ins.router import router as sell_ins_router
from .routes.sell_throughs.router import router as sell_throughs_router
from .routes.analytics.router import router as analytics_router
from .static import mount_static, mount_vite_proxy

app = FastAPI()

app.add_middleware(LoggingMiddleware)
app.add_exception_handler(Exception, http_error_handler)

app.include_router(products_router)
app.include_router(sell_ins_router)
app.include_router(sell_throughs_router)
app.include_router(analytics_router)

@app.on_event("startup")
async def startup():
    await init_db()
    log("serving on port 5001")

# Setup static serving or Vite proxy depending on environment
if settings.node_env == "development":
    mount_vite_proxy(app)
else:
    mount_static(app)
