import { useEffect, useState } from 'react'
import {
  Box,
  Container,
  CssBaseline,
  Divider,
  Grid,
  ThemeProvider,
  Typography,
  createTheme,
} from '@mui/material'
import { CenterFocusStrong } from '@mui/icons-material'
import { listMedia, deleteMedia } from './api/mediaApi'
import { MediaFile } from './types'
import UploadZone from './components/UploadZone'
import MediaGallery from './components/MediaGallery'
import DetectionPanel from './components/DetectionPanel'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#7c4dff' },
    background: { default: '#0d1117', paper: '#161b22' },
  },
  direction: 'rtl',
})

export default function App() {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const loadFiles = async () => {
    try {
      const res = await listMedia()
      setFiles(res.data)
    } catch {
      // backend not ready yet
    }
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
    } catch {
      // ignore
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" alignItems="center" gap={1.5} mb={4}>
          <CenterFocusStrong sx={{ fontSize: 36, color: 'primary.main' }} />
          <Typography variant="h4" fontWeight={700}>
            מערכת זיהוי אובייקטים
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Left: upload + gallery */}
          <Grid item xs={12} md={4}>
            <UploadZone onUploaded={handleUploaded} />
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="text.secondary" mb={1}>
              תמונות שהועלו
            </Typography>
            <MediaGallery
              files={files}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onDelete={handleDelete}
            />
          </Grid>

          {/* Right: detection */}
          <Grid item xs={12} md={8}>
            {selectedId ? (
              <DetectionPanel key={selectedId} mediaId={selectedId} />
            ) : (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                height={300}
                sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}
              >
                <Typography color="text.disabled">
                  העלה תמונה ובחר אותה כדי להתחיל זיהוי
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  )
}
