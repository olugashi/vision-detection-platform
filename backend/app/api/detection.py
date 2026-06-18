import base64
import os
from collections import defaultdict

import cv2
import numpy as np
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import MediaFile
from app.schemas import BBox, Detection, DetectImageRequest, DetectImageResponse
from app.services.model_manager import get_model
from app.class_info import CLASS_INFO, ALLOWED_CLASSES

router = APIRouter()


@router.post("/detect/image", response_model=DetectImageResponse)
def detect_image(req: DetectImageRequest, db: Session = Depends(get_db)):
    record = db.query(MediaFile).filter(MediaFile.id == req.media_id).first()
    if not record or not os.path.exists(record.file_path):
        raise HTTPException(status_code=404, detail="קובץ לא נמצא")

    img_bgr = cv2.imread(record.file_path)
    if img_bgr is None:
        raise HTTPException(status_code=422, detail="לא ניתן לקרוא את התמונה")

    results = get_model()(img_bgr, conf=req.confidence_threshold)

    detections: list[Detection] = []
    counts_by_class: dict[str, int] = defaultdict(int)

    for result in results:
        if result.boxes is None:
            continue
        for box in result.boxes:
            cls_id = int(box.cls[0].item())
            if cls_id not in ALLOWED_CLASSES:
                continue

            class_name, color = CLASS_INFO[cls_id]
            confidence = float(box.conf[0].item())
            x1, y1, x2, y2 = (int(v) for v in box.xyxy[0].tolist())

            detections.append(Detection(
                class_id=cls_id,
                class_name=class_name,
                confidence=round(confidence, 4),
                bbox=BBox(x=x1, y=y1, width=x2 - x1, height=y2 - y1),
            ))
            counts_by_class[class_name] += 1

            cv2.rectangle(img_bgr, (x1, y1), (x2, y2), color, 2)

            label = f"{class_name} {int(confidence * 100)}%"
            (tw, th), baseline = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.55, 1)
            label_y = max(y1, th + baseline + 4)
            cv2.rectangle(img_bgr, (x1, label_y - th - baseline - 4), (x1 + tw + 4, label_y), color, cv2.FILLED)
            cv2.putText(img_bgr, label, (x1 + 2, label_y - baseline - 2),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 1, cv2.LINE_AA)

    _, buf = cv2.imencode(".jpg", img_bgr, [cv2.IMWRITE_JPEG_QUALITY, 90])
    annotated_b64 = base64.b64encode(buf).decode("utf-8")

    return DetectImageResponse(
        media_id=req.media_id,
        detections=detections,
        annotated_image=annotated_b64,
        total_count=len(detections),
        counts_by_class=dict(counts_by_class),
    )
