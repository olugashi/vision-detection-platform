import threading
from ultralytics import YOLO
from app.config import settings

_lock = threading.Lock()
_model: YOLO = YOLO(settings.yolo_model)


def get_model() -> YOLO:
    return _model


def swap_model(model_path: str) -> None:
    global _model
    new_model = YOLO(model_path)
    with _lock:
        _model = new_model
