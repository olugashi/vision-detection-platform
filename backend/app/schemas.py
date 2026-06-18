from pydantic import BaseModel
from datetime import datetime
from typing import Optional


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


# Training schemas

class AnnotationIn(BaseModel):
    class_id: int
    x: float
    y: float
    width: float
    height: float
    confidence: Optional[float] = None
    source: str = "manual"


class AnnotationOut(BaseModel):
    id: str
    image_id: str
    class_id: int
    x: float
    y: float
    width: float
    height: float
    confidence: Optional[float]
    source: str
    is_verified: bool
    model_config = {"from_attributes": True}


class SaveAnnotationsRequest(BaseModel):
    image_id: str
    annotations: list[AnnotationIn]


class AutoAnnotateRequest(BaseModel):
    media_id: str
    confidence_threshold: float = 0.4


class TrainStartRequest(BaseModel):
    name: str
    epochs: int = 50
    confidence_threshold: float = 0.5


class TrainingJobOut(BaseModel):
    id: str
    name: str
    status: str
    epochs: int
    current_epoch: int
    loss: Optional[float]
    map50: Optional[float]
    error_message: Optional[str]
    output_model_id: Optional[str]
    created_at: datetime
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    model_config = {"from_attributes": True}


class MLModelOut(BaseModel):
    id: str
    name: str
    file_path: str
    is_active: bool
    base_model: str
    created_at: datetime
    model_config = {"from_attributes": True}
