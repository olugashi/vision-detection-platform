import os
import shutil
import uuid
import random
import yaml
from datetime import datetime

from sqlalchemy.orm import Session
from app.models import Annotation, MediaFile, MLModel, TrainingJob
from app.services.model_manager import get_model, swap_model

MODELS_DIR = os.getenv("MODELS_DIR", "./ml/weights")
DATASETS_DIR = os.getenv("DATASETS_DIR", "./datasets")

CLASS_NAMES = {
    0: "person",
    1: "bicycle",
    2: "car",
    3: "motorcycle",
    4: "airplane",
    5: "bus",
    7: "truck",
    8: "boat",
}
# Remap sparse COCO IDs to consecutive dataset IDs
COCO_TO_IDX = {coco_id: idx for idx, coco_id in enumerate(sorted(CLASS_NAMES.keys()))}
IDX_TO_NAME = [CLASS_NAMES[coco_id] for coco_id in sorted(CLASS_NAMES.keys())]


def export_dataset(db: Session, job_id: str) -> str:
    """Export all verified annotations to YOLO format dataset. Returns dataset path."""
    annotations = (
        db.query(Annotation)
        .filter(Annotation.is_verified == True)
        .all()
    )
    if not annotations:
        raise ValueError("אין תיוגים מאומתים לאימון")

    dataset_path = os.path.join(DATASETS_DIR, job_id)
    for split in ("train", "val"):
        os.makedirs(os.path.join(dataset_path, "images", split), exist_ok=True)
        os.makedirs(os.path.join(dataset_path, "labels", split), exist_ok=True)

    # Group annotations by image
    by_image: dict[str, list[Annotation]] = {}
    for ann in annotations:
        by_image.setdefault(ann.image_id, []).append(ann)

    image_ids = list(by_image.keys())
    random.shuffle(image_ids)
    split_idx = max(1, int(len(image_ids) * 0.8))
    train_ids = set(image_ids[:split_idx])
    val_ids = set(image_ids[split_idx:]) or set(image_ids[:1])  # ensure val not empty

    for image_id, anns in by_image.items():
        media = db.query(MediaFile).filter(MediaFile.id == image_id).first()
        if not media or not os.path.exists(media.file_path):
            continue

        split = "train" if image_id in train_ids else "val"
        ext = os.path.splitext(media.file_path)[1]
        dst_img = os.path.join(dataset_path, "images", split, f"{image_id}{ext}")
        shutil.copy2(media.file_path, dst_img)

        # Read image size for normalization
        import cv2
        img = cv2.imread(media.file_path)
        if img is None:
            continue
        h, w = img.shape[:2]

        label_path = os.path.join(dataset_path, "labels", split, f"{image_id}.txt")
        with open(label_path, "w") as f:
            for ann in anns:
                if ann.class_id not in COCO_TO_IDX:
                    continue
                idx = COCO_TO_IDX[ann.class_id]
                x_c = (ann.x + ann.width / 2) / w
                y_c = (ann.y + ann.height / 2) / h
                nw = ann.width / w
                nh = ann.height / h
                f.write(f"{idx} {x_c:.6f} {y_c:.6f} {nw:.6f} {nh:.6f}\n")

    data_yaml = {
        "nc": len(IDX_TO_NAME),
        "names": IDX_TO_NAME,
        "train": os.path.abspath(os.path.join(dataset_path, "images", "train")),
        "val": os.path.abspath(os.path.join(dataset_path, "images", "val")),
    }
    with open(os.path.join(dataset_path, "data.yaml"), "w") as f:
        yaml.dump(data_yaml, f)

    return dataset_path


def run_training(job_id: str, db_url: str, epochs: int) -> None:
    """Runs in Celery worker. Updates job progress in DB."""
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker

    engine = create_engine(db_url)
    Session = sessionmaker(bind=engine)
    db = Session()

    job = db.query(TrainingJob).filter(TrainingJob.id == job_id).first()
    if not job:
        return

    try:
        job.status = "running"
        job.started_at = datetime.utcnow()
        db.commit()

        dataset_path = export_dataset(db, job_id)
        job.dataset_path = dataset_path
        db.commit()

        os.makedirs(MODELS_DIR, exist_ok=True)
        output_dir = os.path.join(MODELS_DIR, job_id)

        model = get_model()

        class ProgressCallback:
            def on_train_epoch_end(self, trainer):
                try:
                    j = db.query(TrainingJob).filter(TrainingJob.id == job_id).first()
                    if j:
                        j.current_epoch = trainer.epoch + 1
                        metrics = trainer.metrics
                        j.loss = float(trainer.loss.item()) if hasattr(trainer, "loss") else None
                        j.map50 = float(metrics.get("metrics/mAP50(B)", 0)) if metrics else None
                        db.commit()
                except Exception:
                    pass

        model.add_callback("on_train_epoch_end", ProgressCallback().on_train_epoch_end)

        result = model.train(
            data=os.path.join(dataset_path, "data.yaml"),
            epochs=epochs,
            project=MODELS_DIR,
            name=job_id,
            exist_ok=True,
        )

        best_pt = os.path.join(MODELS_DIR, job_id, "weights", "best.pt")
        ml_model = MLModel(
            name=f"fine-tuned-{job_id[:8]}",
            file_path=best_pt,
            is_active=False,
            base_model="yolov8s.pt",
        )
        db.add(ml_model)
        db.flush()

        job.status = "done"
        job.output_model_id = ml_model.id
        job.completed_at = datetime.utcnow()
        job.current_epoch = epochs
        db.commit()

    except Exception as e:
        job = db.query(TrainingJob).filter(TrainingJob.id == job_id).first()
        if job:
            job.status = "error"
            job.error_message = str(e)
            job.completed_at = datetime.utcnow()
            db.commit()
    finally:
        db.close()
