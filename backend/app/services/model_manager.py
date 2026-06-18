import threading
from ultralytics import YOLO

_lock = threading.Lock()
_model: YOLO = YOLO("yolov8s.pt")


def get_model() -> YOLO:
    return _model


def swap_model(model_path: str) -> None:
    global _model
    new_model = YOLO(model_path)
    with _lock:
        _model = new_model
