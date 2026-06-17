import { useState } from 'react'
import axios from 'axios'
import UploadZone from './components/UploadZone'
import ResultImage from './components/ResultImage'
import DetectionList from './components/DetectionList'

export interface BBox {
  x: number
  y: number
  width: number
  height: number
}

export interface Detection {
  class_name: string
  confidence: number
  bbox: BBox
}

export interface DetectionResult {
  detections: Detection[]
  annotated_image: string
  total_count: number
  counts_by_class: Record<string, number>
}

export default function App() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DetectionResult | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFile = async (selected: File) => {
    setFile(selected)
    setResult(null)
    const objectUrl = URL.createObjectURL(selected)
    setPreview(objectUrl)

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', selected)
      const response = await axios.post<DetectionResult>(
        'http://localhost:8000/api/detect/image',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      setResult(response.data)
    } catch (err) {
      console.error('Detection failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <h1 className="app-title">מערכת זיהוי אובייקטים</h1>

      <div className="card">
        <UploadZone onFile={handleFile} preview={preview} file={file} />
      </div>

      {loading && (
        <div className="card">
          <div className="spinner-wrapper">
            <div className="spinner" />
            <span className="spinner-label">מזהה אובייקטים...</span>
          </div>
        </div>
      )}

      {result && !loading && (
        <div className="results-grid">
          <div className="card">
            <ResultImage base64={result.annotated_image} />
          </div>
          <div className="card">
            <DetectionList
              detections={result.detections}
              counts_by_class={result.counts_by_class}
            />
          </div>
        </div>
      )}
    </div>
  )
}
