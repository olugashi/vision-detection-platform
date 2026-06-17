import axios from 'axios'
import { MediaFile } from '../types'

const BASE = 'http://localhost:8000/api'

export const uploadImage = (file: File) => {
  const fd = new FormData()
  fd.append('file', file)
  return axios.post<MediaFile>(`${BASE}/media/upload`, fd)
}

export const listMedia = () => axios.get<MediaFile[]>(`${BASE}/media/list`)

export const deleteMedia = (id: string) => axios.delete(`${BASE}/media/${id}`)

export const getMediaUrl = (id: string) => `${BASE}/media/${id}`
