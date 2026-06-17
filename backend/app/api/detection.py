import base64
import io
from collections import defaultdict

import cv2
import numpy as np
from fastapi import APIRouter, File, UploadFile
from PIL import Image
from ultralytics import YOLO

router = APIRouter()

# Module-level singleton: load model once at startup
model = YOLO("yolov8s.pt")

# COCO class IDs to detect
ALLOWED_CLASSES = {0, 1, 2, 3, 5, 7}

CLASS_NAMES = {
    0: "person",
    1: "bicycle",
    2: "car",
    3: "motorcycle",
    5: "bus",
    7: "truck",
}

# BGR colors for each class
CLASS_COLORS = {
    "person":     (68,  68,  255),  # #FF4444 in BGR
    "car":        (255, 68,  68),   # #4444FF in BGR
    "truck":      (0,   136, 255),  # #FF8800 in BGR
    "bus":        (255, 0,   136),  # #8800FF in BGR
    "motorcycle": (0,   170, 0),    # #00AA00 in BGR
    "bicycle":    (170, 170, 0),    # #00AAAA in BGR
}


@router.post("/detect/image")
async def detect_image(file: UploadFile = File(...)):
    # Read and decode uploaded image
    contents = await file.read()
    pil_image = Image.open(io.BytesIO(contents)).convert("RGB")
    img_array = np.array(pil_image)
    # Convert RGB -> BGR for OpenCV
    img_bgr = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)

    # Run YOLOv8 inference
    results = model(img_bgr, conf=0.5)

    detections = []
    counts_by_class: dict[str, int] = defaultdict(int)

    for result in results:
        boxes = result.boxes
        if boxes is None:
            continue
        for box in boxes:
            cls_id = int(box.cls[0].item())
            if cls_id not in ALLOWED_CLASSES:
                continue

            class_name = CLASS_NAMES[cls_id]
            confidence = float(box.conf[0].item())
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)

            detections.append({
                "class_name": class_name,
                "confidence": round(confidence, 4),
                "bbox": {
                    "x": x1,
                    "y": y1,
                    "width": x2 - x1,
                    "height": y2 - y1,
                },
            })
            counts_by_class[class_name] += 1

            # Draw bounding box
            color = CLASS_COLORS[class_name]
            cv2.rectangle(img_bgr, (x1, y1), (x2, y2), color, 2)

            # Label text
            label = f"{class_name} {int(confidence * 100)}%"
            (text_w, text_h), baseline = cv2.getTextSize(
                label, cv2.FONT_HERSHEY_SIMPLEX, 0.55, 1
            )
            label_y1 = max(y1, text_h + baseline + 4)

            # Filled rectangle for label background
            cv2.rectangle(
                img_bgr,
                (x1, label_y1 - text_h - baseline - 4),
                (x1 + text_w + 4, label_y1),
                color,
                cv2.FILLED,
            )

            # White text
            cv2.putText(
                img_bgr,
                label,
                (x1 + 2, label_y1 - baseline - 2),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.55,
                (255, 255, 255),
                1,
                cv2.LINE_AA,
            )

    # Encode annotated image to JPEG base64 (no data: prefix)
    _, buffer = cv2.imencode(".jpg", img_bgr, [cv2.IMWRITE_JPEG_QUALITY, 90])
    annotated_b64 = base64.b64encode(buffer).decode("utf-8")

    return {
        "detections": detections,
        "annotated_image": annotated_b64,
        "total_count": len(detections),
        "counts_by_class": dict(counts_by_class),
    }
