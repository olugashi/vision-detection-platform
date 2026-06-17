import { useState } from 'react'
import axios from 'axios'
import {
  Box,
  CircularProgress,
  Container,
  CssBaseline,
  Grid,
  ThemeProvider,
  Typography,
  createTheme,
} from '@mui/material'
import { CenterFocusStrong } from '@mui/icons-material'
import UploadZone from './components/UploadZone'
import ResultImage from './components/ResultImage'
import DetectionList from './components/DetectionList'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#7c4dff' },
    background: { default: '#0d1117', paper: '#161b22' },
  },
  direction: 'rtl',
})

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
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (selected: File) => {
    setFile(selected)
    setResult(null)
    setError(null)
    setPreview(URL.createObjectURL(selected))
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
    } catch {
      setError('שגיאה בזיהוי. ודא שה-backend פועל.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" gap={1.5} mb={4}>
          <CenterFocusStrong sx={{ fontSize: 36, color: 'primary.main' }} />
          <Typography variant="h4" fontWeight={700}>
            מערכת זיהוי אובייקטים
          </Typography>
        </Box>

        {/* Upload */}
        <UploadZone onFile={handleFile} preview={preview} file={file} />

        {/* Loading */}
        {loading && (
          <Box display="flex" alignItems="center" justifyContent="center" gap={2} mt={4}>
            <CircularProgress size={28} />
            <Typography color="text.secondary">מזהה אובייקטים...</Typography>
          </Box>
        )}

        {/* Error */}
        {error && !loading && (
          <Typography color="error" mt={3} textAlign="center">{error}</Typography>
        )}

        {/* Results */}
        {result && !loading && (
          <Grid container spacing={3} mt={1}>
            <Grid item xs={12} md={8}>
              <ResultImage base64={result.annotated_image} />
            </Grid>
            <Grid item xs={12} md={4}>
              <DetectionList
                detections={result.detections}
                counts_by_class={result.counts_by_class}
              />
            </Grid>
          </Grid>
        )}
      </Container>
    </ThemeProvider>
  )
}
