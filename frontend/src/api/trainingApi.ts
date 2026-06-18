import axios from 'axios'
import { AnnotationOut, TrainingJobOut, MLModelOut } from '../types'

const BASE = 'http://localhost:8000/api'

export const saveAnnotations = (image_id: string, annotations: AnnotationIn[]) =>
  axios.post<AnnotationOut[]>(`${BASE}/training/annotate`, { image_id, annotations })

export const getAnnotations = (image_id: string) =>
  axios.get<AnnotationOut[]>(`${BASE}/training/annotations/${image_id}`)

export const autoAnnotate = (media_id: string, confidence_threshold = 0.4) =>
  axios.post<AnnotationOut[]>(`${BASE}/training/auto-annotate`, { media_id, confidence_threshold })

export const startTraining = (name: string, epochs: number) =>
  axios.post<TrainingJobOut>(`${BASE}/training/train/start`, { name, epochs })

export const listJobs = () =>
  axios.get<TrainingJobOut[]>(`${BASE}/training/jobs`)

export const getJob = (job_id: string) =>
  axios.get<TrainingJobOut>(`${BASE}/training/jobs/${job_id}`)

export const listModels = () =>
  axios.get<MLModelOut[]>(`${BASE}/training/models`)

export const activateModel = (model_id: string) =>
  axios.post(`${BASE}/training/models/${model_id}/activate`)

export interface AnnotationIn {
  class_id: number
  x: number
  y: number
  width: number
  height: number
  confidence?: number
  source?: string
}
