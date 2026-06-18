import { useEffect, useState } from 'react'
import { Box, Divider, Grid, Typography } from '@mui/material'
import { listMedia, deleteMedia } from '../api/mediaApi'
import { MediaFile } from '../types'
import UploadZone from '../components/UploadZone'
import MediaGallery from '../components/MediaGallery'
import DetectionPanel from '../components/DetectionPanel'

export default function DetectionPage() {
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
    <Grid container spacing={3}>
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
  )
}
