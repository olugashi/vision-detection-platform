import { useState } from 'react'
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Slider,
  Typography,
} from '@mui/material'
import { CenterFocusStrong } from '@mui/icons-material'
import { detectImage } from '../api/detectionApi'
import { DetectionResult } from '../types'
import ResultImage from './ResultImage'
import DetectionList from './DetectionList'

interface DetectionPanelProps {
  mediaId: string
}

export default function DetectionPanel({ mediaId }: DetectionPanelProps) {
  const [confidence, setConfidence] = useState(0.5)
  const [detecting, setDetecting] = useState(false)
  const [result, setResult] = useState<DetectionResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDetect = async () => {
    setDetecting(true)
    setError(null)
    setResult(null)
    try {
      const res = await detectImage(mediaId, confidence)
      setResult(res.data)
    } catch {
      setError('שגיאה בזיהוי. ודא שה-backend פועל.')
    } finally {
      setDetecting(false)
    }
  }

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Typography variant="subtitle1" fontWeight={600} mb={2}>
        הגדרות זיהוי
      </Typography>

      <Box mb={3}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          סף ביטחון: {Math.round(confidence * 100)}%
        </Typography>
        <Slider
          value={confidence}
          onChange={(_, v) => setConfidence(v as number)}
          min={0.1}
          max={0.9}
          step={0.05}
          marks={[
            { value: 0.1, label: '10%' },
            { value: 0.5, label: '50%' },
            { value: 0.9, label: '90%' },
          ]}
        />
      </Box>

      <Button
        variant="contained"
        size="large"
        fullWidth
        startIcon={detecting ? <CircularProgress size={18} color="inherit" /> : <CenterFocusStrong />}
        onClick={handleDetect}
        disabled={detecting}
      >
        {detecting ? 'מזהה...' : 'זהה אובייקטים'}
      </Button>

      {error && (
        <Typography color="error" variant="body2" mt={2} textAlign="center">{error}</Typography>
      )}

      {result && !detecting && (
        <>
          <Divider sx={{ my: 3 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} md={7}>
              <ResultImage base64={result.annotated_image} />
            </Grid>
            <Grid item xs={12} md={5}>
              <DetectionList
                detections={result.detections}
                counts_by_class={result.counts_by_class}
              />
            </Grid>
          </Grid>
        </>
      )}
    </Paper>
  )
}
