# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the project

```bash
# Full stack (recommended)
docker compose up --build

# Backend only (local dev, from backend/)
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend only (local dev, from frontend/)
npm install
npm run dev
```

- Backend: http://localhost:8000
- Frontend: http://localhost:3000
- YOLOv8s weights (~22MB) download automatically on first backend startup via `ultralytics`.

## Architecture

**Single-feature app** — upload an image, get back the same image annotated with bounding boxes + a JSON list of detections.

```
backend/app/api/detection.py   ← all detection logic (single file)
backend/app/main.py            ← FastAPI app + CORS middleware
frontend/src/App.tsx           ← state, API call, layout
frontend/src/components/       ← UploadZone, ResultImage, DetectionList
```

### Detection flow

1. Frontend POSTs `multipart/form-data` to `POST /api/detect/image`
2. Backend decodes image → runs `YOLO("yolov8s.pt")` (module-level singleton) → filters detections to the 8 allowed COCO classes → draws colored boxes with OpenCV → returns JSON with base64-encoded annotated JPEG + structured detections list
3. Frontend renders the annotated image (`ResultImage`) and a sidebar with MUI `Chip` badges and `LinearProgress` confidence bars (`DetectionList`)

### Detected classes (COCO IDs)

| ID | Class | Color |
|----|-------|-------|
| 0 | person | `#FF4444` |
| 1 | bicycle | `#00AAAA` |
| 2 | car | `#4444FF` |
| 3 | motorcycle | `#00AA00` |
| 4 | airplane | `#DCDC00` |
| 5 | bus | `#8800FF` |
| 7 | truck | `#FF8800` |
| 8 | boat | `#FF69B4` |

Colors must stay in sync between `backend/app/api/detection.py` (`CLASS_COLORS` in BGR) and `frontend/src/components/DetectionList.tsx` (`CLASS_COLORS` in hex).

### Frontend stack

React 18 + TypeScript + Vite + **MUI v5** (dark theme, `direction: rtl`). UI text is in Hebrew. No global state library — all state lives in `App.tsx`.

## Extending

**Add a new detectable class:** add its COCO ID to `ALLOWED_CLASSES`, `CLASS_NAMES`, and `CLASS_COLORS` in `detection.py`, then add the matching hex color and Hebrew label in `DetectionList.tsx`.

**Drone/custom class support:** YOLOv8s is pre-trained on COCO (80 classes) — drones are not included. Supporting them requires fine-tuning with a labeled drone dataset using `model.train()`.
