import os
import uuid
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import MediaFile
from app.schemas import MediaFileOut

router = APIRouter()

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/media/upload", response_model=MediaFileOut)
async def upload_media(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="רק קבצי תמונה מותרים")

    media_id = str(uuid.uuid4())
    ext = os.path.splitext(file.filename or "image.jpg")[1] or ".jpg"
    saved_filename = f"{media_id}{ext}"
    file_path = os.path.join(UPLOAD_DIR, saved_filename)

    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)

    record = MediaFile(
        id=media_id,
        filename=saved_filename,
        original_filename=file.filename or saved_filename,
        file_path=file_path,
        file_type="image",
        size_bytes=len(contents),
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("/media/list", response_model=list[MediaFileOut])
def list_media(db: Session = Depends(get_db)):
    return db.query(MediaFile).order_by(MediaFile.uploaded_at.desc()).all()


@router.get("/media/{media_id}")
def get_media(media_id: str, db: Session = Depends(get_db)):
    record = db.query(MediaFile).filter(MediaFile.id == media_id).first()
    if not record or not os.path.exists(record.file_path):
        raise HTTPException(status_code=404, detail="קובץ לא נמצא")
    return FileResponse(record.file_path)


@router.delete("/media/{media_id}")
def delete_media(media_id: str, db: Session = Depends(get_db)):
    record = db.query(MediaFile).filter(MediaFile.id == media_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="קובץ לא נמצא")
    if os.path.exists(record.file_path):
        os.remove(record.file_path)
    db.delete(record)
    db.commit()
    return {"ok": True}
