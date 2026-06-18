import { useEffect, useState } from 'react'
import {
  Box, Chip, LinearProgress, Paper, Typography
} from '@mui/material'
import { getJob } from '../../api/trainingApi'
import { TrainingJobOut } from '../../types'

const STATUS_COLORS: Record<string, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
  pending: 'default',
  running: 'info',
  done: 'success',
  error: 'error',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'ממתין',
  running: 'רץ',
  done: 'הסתיים',
  error: 'שגיאה',
}

interface Props {
  job: TrainingJobOut
  onDone: () => void
}

export default function TrainingProgress({ job: initialJob, onDone }: Props) {
  const [job, setJob] = useState(initialJob)

  useEffect(() => {
    if (job.status === 'done' || job.status === 'error') {
      onDone()
      return
    }
    const interval = setInterval(async () => {
      try {
        const res = await getJob(job.id)
        setJob(res.data)
        if (res.data.status === 'done' || res.data.status === 'error') {
          clearInterval(interval)
          onDone()
        }
      } catch {
        // ignore polling errors
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [job.id, job.status])

  const progress = job.epochs > 0 ? (job.current_epoch / job.epochs) * 100 : 0

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
        <Typography variant="subtitle2">{job.name}</Typography>
        <Chip
          size="small"
          label={STATUS_LABELS[job.status] ?? job.status}
          color={STATUS_COLORS[job.status] ?? 'default'}
        />
      </Box>

      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{ height: 8, borderRadius: 4, mb: 1 }}
      />

      <Box display="flex" justifyContent="space-between">
        <Typography variant="caption" color="text.secondary">
          epoch {job.current_epoch} / {job.epochs}
        </Typography>
        {job.map50 != null && (
          <Typography variant="caption" color="text.secondary">
            mAP50: {(job.map50 * 100).toFixed(1)}%
          </Typography>
        )}
        {job.loss != null && (
          <Typography variant="caption" color="text.secondary">
            loss: {job.loss.toFixed(4)}
          </Typography>
        )}
      </Box>

      {job.error_message && (
        <Typography variant="caption" color="error" mt={1} display="block">
          {job.error_message}
        </Typography>
      )}
    </Paper>
  )
}
