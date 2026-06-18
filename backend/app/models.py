import uuid
from datetime import datetime
from sqlalchemy import Boolean, Column, Float, Integer, String, DateTime, ForeignKey, Text
from app.database import Base


class MediaFile(Base):
    __tablename__ = "media_files"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    size_bytes = Column(Integer, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)


class Annotation(Base):
    __tablename__ = "annotations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    image_id = Column(String, ForeignKey("media_files.id", ondelete="CASCADE"), nullable=False)
    class_id = Column(Integer, nullable=False)
    x = Column(Float, nullable=False)
    y = Column(Float, nullable=False)
    width = Column(Float, nullable=False)
    height = Column(Float, nullable=False)
    confidence = Column(Float, nullable=True)
    source = Column(String, nullable=False, default="manual")  # manual | auto
    is_verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class MLModel(Base):
    __tablename__ = "ml_models"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    is_active = Column(Boolean, default=False)
    base_model = Column(String, default="yolov8s.pt")
    created_at = Column(DateTime, default=datetime.utcnow)


class TrainingJob(Base):
    __tablename__ = "training_jobs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    status = Column(String, default="pending")  # pending | running | done | error
    epochs = Column(Integer, default=50)
    current_epoch = Column(Integer, default=0)
    loss = Column(Float, nullable=True)
    map50 = Column(Float, nullable=True)
    dataset_path = Column(String, nullable=True)
    output_model_id = Column(String, ForeignKey("ml_models.id"), nullable=True)
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
