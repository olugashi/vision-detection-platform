import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime
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
