import os
from celery import Celery

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

celery_app = Celery("vision_detection", broker=REDIS_URL, backend=REDIS_URL)


@celery_app.task(name="tasks.run_training")
def run_training_task(job_id: str, epochs: int) -> None:
    from app.services.training_service import run_training
    db_url = os.getenv("DATABASE_URL", "postgresql://admin:password@postgres:5432/detection_db")
    run_training(job_id, db_url, epochs)
