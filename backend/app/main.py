import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, SessionLocal
from app import models
from app.api import detection, media, training


def _load_active_model() -> None:
    """On startup: if DB has an active model with an existing file, load it."""
    db = SessionLocal()
    try:
        record = (
            db.query(models.MLModel)
            .filter(models.MLModel.is_active == True)
            .first()
        )
        if record and os.path.exists(record.file_path):
            from app.services.model_manager import swap_model
            swap_model(record.file_path)
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    models.Base.metadata.create_all(bind=engine)
    _load_active_model()
    yield


app = FastAPI(title="Vision Detection API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(media.router, prefix="/api")
app.include_router(detection.router, prefix="/api")
app.include_router(training.router, prefix="/api")
