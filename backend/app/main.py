from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

from app.api.routes import workflows
from app.api.routes import screenshots
from app.api.routes import intents
from app.api.routes import executions
from app.models import init_db
from app.config import settings
from app.middleware.request_id import RequestIdMiddleware

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.OUTPUT_DIR, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="SnapFlow API", version="0.1.0", lifespan=lifespan, redirect_slashes=False)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RequestIdMiddleware)

app.include_router(workflows.router, prefix="/api/workflows", tags=["workflows"])
app.include_router(screenshots.router, prefix="/api/screenshots", tags=["screenshots"])
app.include_router(intents.router, prefix="/api/intent", tags=["intents"])
app.include_router(executions.router, prefix="/api/executions", tags=["executions"])

if os.path.exists(settings.UPLOAD_DIR):
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")


@app.get("/")
async def root():
    return {"message": "SnapFlow API", "version": "0.1.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}