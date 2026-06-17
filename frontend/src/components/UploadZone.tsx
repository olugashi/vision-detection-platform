import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Box, Paper, Typography } from '@mui/material'
import { CloudUpload, Image as ImageIcon } from '@mui/icons-material'

interface UploadZoneProps {
  onFile: (file: File) => void
  preview: string | null
  file: File | null
}

export default function UploadZone({ onFile, preview, file }: UploadZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) onFile(acceptedFiles[0])
    },
    [onFile]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
  })

  return (
    <Paper
      {...getRootProps()}
      variant="outlined"
      sx={{
        p: 3,
        textAlign: 'center',
        cursor: 'pointer',
        border: '2px dashed',
        borderColor: isDragActive ? 'primary.main' : 'divider',
        bgcolor: isDragActive ? 'action.hover' : 'background.paper',
        transition: 'all 0.2s',
        '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
      }}
    >
      <input {...getInputProps()} />

      {preview && file ? (
        <Box>
          <Box
            component="img"
            src={preview}
            alt="תצוגה מקדימה"
            sx={{ maxHeight: 300, maxWidth: '100%', borderRadius: 1, mb: 1 }}
          />
          <Typography variant="body2" color="text.secondary">{file.name}</Typography>
          <Typography variant="caption" color="text.disabled">לחץ או גרור תמונה חדשה</Typography>
        </Box>
      ) : (
        <Box>
          {isDragActive
            ? <CloudUpload sx={{ fontSize: 52, color: 'primary.main', mb: 1 }} />
            : <ImageIcon sx={{ fontSize: 52, color: 'text.disabled', mb: 1 }} />
          }
          <Typography variant="h6" gutterBottom>
            {isDragActive ? 'שחרר כאן' : 'גרור תמונה לכאן או לחץ לבחירה'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            PNG, JPG, JPEG, WEBP
          </Typography>
        </Box>
      )}
    </Paper>
  )
}
