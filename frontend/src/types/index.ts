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
