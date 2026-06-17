from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import detection

app = FastAPI(title="Vision Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(detection.router, prefix="/api")
