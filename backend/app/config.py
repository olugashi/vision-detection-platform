from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://admin:password@localhost:5432/detection_db"
    redis_url: str = "redis://localhost:6379"
    upload_dir: str = "./uploads"
    models_dir: str = "./ml/weights"
    datasets_dir: str = "./datasets"
    yolo_model: str = "yolov8s.pt"

    model_config = {"env_file": ".env"}


settings = Settings()
