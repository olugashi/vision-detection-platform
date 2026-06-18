from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app import models
from app.api import detection, media, training

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Vision Detection API")

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
