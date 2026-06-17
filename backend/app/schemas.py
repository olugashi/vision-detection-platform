from pydantic import BaseModel
from datetime import datetime


class MediaFileOut(BaseModel):
    id: str
    original_filename: str
    file_type: str
    size_bytes: int
    uploaded_at: datetime
    model_config = {"from_attributes": True}


class BBox(BaseModel):
    x: int
    y: int
    width: int
    height: int


class Detection(BaseModel):
    class_id: int
    class_name: str
    confidence: float
    bbox: BBox


class DetectImageRequest(BaseModel):
    media_id: str
    confidence_threshold: float = 0.5


class DetectImageResponse(BaseModel):
    media_id: str
    detections: list[Detection]
    annotated_image: str
    total_count: int
    counts_by_class: dict[str, int]
