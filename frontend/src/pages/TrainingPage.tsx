import { useEffect, useState, useCallback } from 'react'
import {
  Box, Button, CircularProgress, Divider, Grid, Paper,
  Slider, Stack, Tab, Tabs, TextField, Typography,
} from '@mui/material'
import { AutoFixHigh, FitnessCenterOutlined, ModelTraining } from '@mui/icons-material'

import { listMedia, getMediaUrl } from '../api/mediaApi'
import {
  getAnnotations, saveAnnotations, autoAnnotate,
  startTraining, listJobs, listModels,
  AnnotationIn,
} from '../api/trainingApi'
import { MediaFile, TrainingJobOut, MLModelOut } from '../types'

import MediaGallery from '../components/MediaGallery'
import UploadZone from '../components/UploadZone'
import AnnotationCanvas, { DrawingBox } from '../components/training/AnnotationCanvas'
import TrainingProgress from '../components/training/TrainingProgress'
import ModelList from '../components/training/ModelList'

export default function TrainingPage() {
  const [tab, setTab] = useState(0)

  // Media
  const [files, setFiles] = useState<MediaFile[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Annotations
  const [boxes, setBoxes] = useState<DrawingBox[]>([])
  const [autoLoading, setAutoLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Training
  const [jobName, setJobName] = useState('אימון חדש')
  const [epochs, setEpochs] = useState(30)
  const [jobs, setJobs] = useState<TrainingJobOut[]>([])
  const [activeJob, setActiveJob] = useState<TrainingJobOut | null>(null)
  const [startingTrain, setStartingTrain] = useState(false)

  // Models
  const [models, setModels] = useState<MLModelOut[]>([])

  const loadFiles = async () => {
    try { setFiles((await listMedia()).data) } catch {}
  }
  const loadJobs = async () => {
    try { setJobs((await listJobs()).data) } catch {}
  }
  const loadModels = async () => {
    try { setModels((await listModels()).data) } catch {}
  }

  useEffect(() => { loadFiles(); loadJobs(); loadModels() }, [])

  const handleSelectImage = async (id: string) => {
    setSelectedId(id)
    try {
      const res = await getAnnotations(id)
      setBoxes(res.data.map((a) => ({
        tempId: a.id,
        class_id: a.class_id,
        x: a.x,
        y: a.y,
        width: a.width,
        height: a.height,
        confidence: a.confidence ?? undefined,
        source: a.source,
      })))
    } catch {
      setBoxes([])
    }
  }

  const handleAutoAnnotate = async () => {
    if (!selectedId) return
    setAutoLoading(true)
    try {
      const res = await autoAnnotate(selectedId)
      setBoxes(res.data.map((a) => ({
        tempId: a.id,
        class_id: a.class_id,
        x: a.x,
        y: a.y,
        width: a.width,
        height: a.height,
        confidence: a.confidence ?? undefined,
        source: a.source,
      })))
    } catch {
    } finally {
      setAutoLoading(false)
    }
  }

  const handleSaveAnnotations = async () => {
    if (!selectedId) return
    setSaving(true)
    try {
      const payload: AnnotationIn[] = boxes.map((b) => ({
        class_id: b.class_id,
        x: b.x,
        y: b.y,
        width: b.width,
        height: b.height,
        confidence: b.confidence,
        source: b.source ?? 'manual',
      }))
      await saveAnnotations(selectedId, payload)
    } catch {
    } finally {
      setSaving(false)
    }
  }

  const handleStartTraining = async () => {
    setStartingTrain(true)
    try {
      const res = await startTraining(jobName, epochs)
      setActiveJob(res.data)
      await loadJobs()
      setTab(2)
    } catch {
    } finally {
      setStartingTrain(false)
    }
  }

  return (
    <Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab icon={<FitnessCenterOutlined />} iconPosition="start" label="תיוג" />
        <Tab icon={<ModelTraining />} iconPosition="start" label="אימון" />
        <Tab icon={<AutoFixHigh />} iconPosition="start" label="מודלים" />
      </Tabs>

      {/* ── Tab 0: Annotation ── */}
      {tab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <UploadZone onUploaded={(f) => { setFiles((p) => [f, ...p]); setSelectedId(f.id) }} />
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="text.secondary" mb={1}>תמונות</Typography>
            <MediaGallery
              files={files}
              selectedId={selectedId}
              onSelect={handleSelectImage}
              onDelete={async (id) => {
                const { deleteMedia } = await import('../api/mediaApi')
                await deleteMedia(id)
                setFiles((p) => p.filter((f) => f.id !== id))
                if (selectedId === id) { setSelectedId(null); setBoxes([]) }
              }}
            />
          </Grid>

          <Grid item xs={12} md={9}>
            {selectedId ? (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box display="flex" gap={1.5} mb={2} flexWrap="wrap">
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={autoLoading ? <CircularProgress size={14} /> : <AutoFixHigh />}
                    onClick={handleAutoAnnotate}
                    disabled={autoLoading}
                  >
                    תיוג אוטומטי
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    disabled={saving}
                    onClick={handleSaveAnnotations}
                  >
                    {saving ? 'שומר...' : `שמור תיוגים (${boxes.length})`}
                  </Button>
                </Box>

                <AnnotationCanvas
                  imageUrl={getMediaUrl(selectedId)}
                  initialBoxes={boxes}
                  onChange={setBoxes}
                />
              </Paper>
            ) : (
              <Box
                display="flex" alignItems="center" justifyContent="center"
                height={400}
                sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}
              >
                <Typography color="text.disabled">בחר תמונה מהרשימה לתיוג</Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      )}

      {/* ── Tab 1: Train ── */}
      {tab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} mb={3}>הגדרות אימון</Typography>

              <TextField
                label="שם האימון"
                value={jobName}
                onChange={(e) => setJobName(e.target.value)}
                fullWidth
                size="small"
                sx={{ mb: 3 }}
              />

              <Typography variant="body2" color="text.secondary" gutterBottom>
                מספר Epochs: {epochs}
              </Typography>
              <Slider
                value={epochs}
                onChange={(_, v) => setEpochs(v as number)}
                min={5}
                max={100}
                step={5}
                marks={[
                  { value: 5, label: '5' },
                  { value: 50, label: '50' },
                  { value: 100, label: '100' },
                ]}
                sx={{ mb: 3 }}
              />

              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={startingTrain ? <CircularProgress size={18} color="inherit" /> : <ModelTraining />}
                onClick={handleStartTraining}
                disabled={startingTrain}
              >
                {startingTrain ? 'מתחיל...' : 'התחל אימון'}
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} md={7}>
            <Typography variant="subtitle2" color="text.secondary" mb={2}>עבודות אימון</Typography>
            <Stack spacing={2}>
              {jobs.length === 0
                ? <Typography color="text.disabled" variant="body2">אין עבודות עדיין</Typography>
                : jobs.map((job) =>
                    job.status === 'pending' || job.status === 'running' || job.status === 'done' || job.status === 'error' ? (
                      <TrainingProgress
                        key={job.id}
                        job={job}
                        onDone={loadModels}
                      />
                    ) : null
                  )
              }
            </Stack>
          </Grid>
        </Grid>
      )}

      {/* ── Tab 2: Models ── */}
      {tab === 2 && (
        <Box>
          <Typography variant="subtitle2" color="text.secondary" mb={2}>מודלים זמינים</Typography>
          <ModelList models={models} onActivated={loadModels} />
        </Box>
      )}
    </Box>
  )
}
