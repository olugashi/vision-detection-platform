import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Box, CircularProgress, Paper, Typography } from '@mui/material'
import { CloudUpload, Image as ImageIcon } from '@mui/icons-material'
import { uploadImage } from '../api/mediaApi'
import { MediaFile } from '../types'

interface UploadZoneProps {
  onUploaded: (file: MediaFile) => void
}

export default function UploadZone({ onUploaded }: UploadZoneProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return
    setUploading(true)
    setError(null)
    try {
      const res = await uploadImage(acceptedFiles[0])
      onUploaded(res.data)
    } catch {
      setError('שגיאה בהעלאה, נסה שנית')
    } finally {
      setUploading(false)
    }
  }, [onUploaded])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
    disabled: uploading,
  })

  return (
    <Paper
      {...getRootProps()}
      variant="outlined"
      sx={{
        p: 3,
        textAlign: 'center',
        cursor: uploading ? 'default' : 'pointer',
        border: '2px dashed',
        borderColor: isDragActive ? 'primary.main' : 'divider',
        bgcolor: isDragActive ? 'action.hover' : 'background.paper',
        transition: 'all 0.2s',
        '&:hover': uploading ? {} : { borderColor: 'primary.main', bgcolor: 'action.hover' },
      }}
    >
      <input {...getInputProps()} />
      {uploading ? (
        <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
          <CircularProgress size={36} />
          <Typography variant="body2" color="text.secondary">מעלה תמונה...</Typography>
        </Box>
      ) : (
        <Box>
          {isDragActive
            ? <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            : <ImageIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          }
          <Typography variant="h6" gutterBottom>
            {isDragActive ? 'שחרר כאן' : 'גרור תמונה לכאן או לחץ לבחירה'}
          </Typography>
          <Typography variant="body2" color="text.secondary">PNG, JPG, JPEG, WEBP</Typography>
          {error && <Typography variant="body2" color="error" mt={1}>{error}</Typography>}
        </Box>
      )}
    </Paper>
  )
}
