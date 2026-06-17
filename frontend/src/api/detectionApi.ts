import axios from 'axios'
import { DetectionResult } from '../types'

const BASE = 'http://localhost:8000/api'

export const detectImage = (media_id: string, confidence_threshold: number) =>
  axios.post<DetectionResult>(`${BASE}/detect/image`, { media_id, confidence_threshold })
