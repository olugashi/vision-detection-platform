export interface MediaFile {
  id: string
  original_filename: string
  file_type: string
  size_bytes: number
  uploaded_at: string
}

export interface BBox {
  x: number
  y: number
  width: number
  height: number
}

export interface Detection {
  class_id: number
  class_name: string
  confidence: number
  bbox: BBox
}

export interface DetectionResult {
  media_id: string
  detections: Detection[]
  annotated_image: string
  total_count: number
  counts_by_class: Record<string, number>
}

export interface AnnotationOut {
  id: string
  image_id: string
  class_id: number
  x: number
  y: number
  width: number
  height: number
  confidence: number | null
  source: string
  is_verified: boolean
}

export interface TrainingJobOut {
  id: string
  name: string
  status: string
  epochs: number
  current_epoch: number
  loss: number | null
  map50: number | null
  error_message: string | null
  output_model_id: string | null
  created_at: string
  started_at: string | null
  completed_at: string | null
}

export interface MLModelOut {
  id: string
  name: string
  file_path: string
  is_active: boolean
  base_model: string
  created_at: string
}
