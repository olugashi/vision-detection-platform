from celery import Celery
from app.config import settings

celery_app = Celery("vision_detection", broker=settings.redis_url, backend=settings.redis_url)


@celery_app.task(name="tasks.run_training")
def run_training_task(job_id: str, epochs: int) -> None:
    from app.services.training_service import run_training
    run_training(job_id, epochs)
