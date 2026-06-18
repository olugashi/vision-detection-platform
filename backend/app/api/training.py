import os
import uuid
from datetime import datetime

import cv2
import numpy as np
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Annotation, MediaFile, MLModel, TrainingJob
from app.schemas import (
    AnnotationOut,
    AutoAnnotateRequest,
    MLModelOut,
    SaveAnnotationsRequest,
    TrainStartRequest,
    TrainingJobOut,
)
from app.services.model_manager import get_model, swap_model

router = APIRouter()

ALLOWED_CLASSES = {0, 1, 2, 3, 4, 5, 7, 8}
CLASS_INFO = {
    0: "person",
    1: "bicycle",
    2: "car",
    3: "motorcycle",
    4: "airplane",
    5: "bus",
    7: "truck",
    8: "boat",
}


# ── Annotations ───────────────────────────────────────────────

@router.post("/training/annotate", response_model=list[AnnotationOut])
def save_annotations(req: SaveAnnotationsRequest, db: Session = Depends(get_db)):
    media = db.query(MediaFile).filter(MediaFile.id == req.image_id).first()
    if not media:
        raise HTTPException(status_code=404, detail="תמונה לא נמצאה")

    # Replace existing annotations for this image
    db.query(Annotation).filter(Annotation.image_id == req.image_id).delete()

    records = []
    for ann in req.annotations:
        record = Annotation(
            image_id=req.image_id,
            class_id=ann.class_id,
            x=ann.x,
            y=ann.y,
            width=ann.width,
            height=ann.height,
            confidence=ann.confidence,
            source=ann.source,
            is_verified=True,
        )
        db.add(record)
        records.append(record)

    db.commit()
    for r in records:
        db.refresh(r)
    return records


@router.get("/training/annotations/{image_id}", response_model=list[AnnotationOut])
def get_annotations(image_id: str, db: Session = Depends(get_db)):
    return db.query(Annotation).filter(Annotation.image_id == image_id).all()


@router.post("/training/auto-annotate", response_model=list[AnnotationOut])
def auto_annotate(req: AutoAnnotateRequest, db: Session = Depends(get_db)):
    media = db.query(MediaFile).filter(MediaFile.id == req.media_id).first()
    if not media or not os.path.exists(media.file_path):
        raise HTTPException(status_code=404, detail="תמונה לא נמצאה")

    img = cv2.imread(media.file_path)
    if img is None:
        raise HTTPException(status_code=422, detail="לא ניתן לקרוא את התמונה")

    model = get_model()
    results = model(img, conf=req.confidence_threshold)

    suggestions = []
    for result in results:
        if result.boxes is None:
            continue
        for box in result.boxes:
            cls_id = int(box.cls[0].item())
            if cls_id not in ALLOWED_CLASSES:
                continue
            x1, y1, x2, y2 = (int(v) for v in box.xyxy[0].tolist())
            suggestions.append(Annotation(
                image_id=req.media_id,
                class_id=cls_id,
                x=float(x1),
                y=float(y1),
                width=float(x2 - x1),
                height=float(y2 - y1),
                confidence=round(float(box.conf[0].item()), 4),
                source="auto",
                is_verified=False,
            ))

    # Save as unverified — user confirms/edits via annotate endpoint
    db.query(Annotation).filter(Annotation.image_id == req.media_id).delete()
    for s in suggestions:
        db.add(s)
    db.commit()
    for s in suggestions:
        db.refresh(s)
    return suggestions


# ── Training Jobs ─────────────────────────────────────────────

@router.post("/training/train/start", response_model=TrainingJobOut)
def start_training(req: TrainStartRequest, db: Session = Depends(get_db)):
    from celery_worker import run_training_task

    job = TrainingJob(
        id=str(uuid.uuid4()),
        name=req.name,
        epochs=req.epochs,
        status="pending",
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    run_training_task.delay(job.id, req.epochs)
    return job


@router.get("/training/jobs", response_model=list[TrainingJobOut])
def list_jobs(db: Session = Depends(get_db)):
    return db.query(TrainingJob).order_by(TrainingJob.created_at.desc()).all()


@router.get("/training/jobs/{job_id}", response_model=TrainingJobOut)
def get_job(job_id: str, db: Session = Depends(get_db)):
    job = db.query(TrainingJob).filter(TrainingJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="עבודה לא נמצאה")
    return job


# ── Models ────────────────────────────────────────────────────

@router.get("/training/models", response_model=list[MLModelOut])
def list_models(db: Session = Depends(get_db)):
    return db.query(MLModel).order_by(MLModel.created_at.desc()).all()


@router.post("/training/models/{model_id}/activate")
def activate_model(model_id: str, db: Session = Depends(get_db)):
    model_record = db.query(MLModel).filter(MLModel.id == model_id).first()
    if not model_record:
        raise HTTPException(status_code=404, detail="מודל לא נמצא")
    if not os.path.exists(model_record.file_path):
        raise HTTPException(status_code=422, detail="קובץ המודל לא קיים על הדיסק")

    db.query(MLModel).update({"is_active": False})
    model_record.is_active = True
    db.commit()

    swap_model(model_record.file_path)
    return {"ok": True, "model_id": model_id}
