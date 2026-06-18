import { useState } from 'react'
import {
  Box, Container, CssBaseline, Tab, Tabs,
  ThemeProvider, Typography, createTheme,
} from '@mui/material'
import { CenterFocusStrong, ModelTraining } from '@mui/icons-material'
import { useEffect } from 'react'
import { listMedia, deleteMedia } from './api/mediaApi'
import { MediaFile, DetectionResult } from './types'
import UploadZone from './components/UploadZone'
import MediaGallery from './components/MediaGallery'
import DetectionPanel from './components/DetectionPanel'
import TrainingPage from './pages/TrainingPage'
import { Divider, Grid } from '@mui/material'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#7c4dff' },
    background: { default: '#0d1117', paper: '#161b22' },
  },
  direction: 'rtl',
})

export default function App() {
  const [page, setPage] = useState(0)

  // Detection state
  const [files, setFiles] = useState<MediaFile[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const loadFiles = async () => {
    try { setFiles((await listMedia()).data) } catch {}
  }

  useEffect(() => { loadFiles() }, [])

  const handleUploaded = (file: MediaFile) => {
    setFiles((prev) => [file, ...prev])
    setSelectedId(file.id)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteMedia(id)
      setFiles((prev) => prev.filter((f) => f.id !== id))
      if (selectedId === id) setSelectedId(null)
    } catch {}
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" gap={1.5} mb={3}>
          <CenterFocusStrong sx={{ fontSize: 36, color: 'primary.main' }} />
          <Typography variant="h4" fontWeight={700}>מערכת זיהוי אובייקטים</Typography>
        </Box>

        {/* Top-level navigation */}
        <Tabs value={page} onChange={(_, v) => setPage(v)} sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}>
          <Tab icon={<CenterFocusStrong />} iconPosition="start" label="זיהוי" />
          <Tab icon={<ModelTraining />} iconPosition="start" label="אימון מודל" />
        </Tabs>

        {/* Detection Page */}
        {page === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <UploadZone onUploaded={handleUploaded} />
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="text.secondary" mb={1}>תמונות שהועלו</Typography>
              <MediaGallery
                files={files}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onDelete={handleDelete}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              {selectedId ? (
                <DetectionPanel key={selectedId} mediaId={selectedId} />
              ) : (
                <Box
                  display="flex" alignItems="center" justifyContent="center"
                  height={300}
                  sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}
                >
                  <Typography color="text.disabled">העלה תמונה ובחר אותה כדי להתחיל זיהוי</Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        )}

        {/* Training Page */}
        {page === 1 && <TrainingPage />}
      </Container>
    </ThemeProvider>
  )
}
