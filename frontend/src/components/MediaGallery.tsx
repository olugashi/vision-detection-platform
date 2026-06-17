import {
  Box,
  Card,
  CardMedia,
  Grid,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material'
import { Delete } from '@mui/icons-material'
import { MediaFile } from '../types'
import { getMediaUrl } from '../api/mediaApi'

interface MediaGalleryProps {
  files: MediaFile[]
  selectedId: string | null
  onSelect: (id: string) => void
  onDelete: (id: string) => void
}

export default function MediaGallery({ files, selectedId, onSelect, onDelete }: MediaGalleryProps) {
  if (files.length === 0) {
    return (
      <Typography variant="body2" color="text.disabled" mt={2} textAlign="center">
        לא הועלו תמונות עדיין
      </Typography>
    )
  }

  return (
    <Grid container spacing={1.5} mt={1}>
      {files.map((f) => (
        <Grid item xs={6} sm={4} key={f.id}>
          <Card
            onClick={() => onSelect(f.id)}
            sx={{
              cursor: 'pointer',
              position: 'relative',
              border: '2px solid',
              borderColor: selectedId === f.id ? 'primary.main' : 'transparent',
              transition: 'border-color 0.15s',
              '&:hover': { borderColor: 'primary.light' },
            }}
          >
            <CardMedia
              component="img"
              image={getMediaUrl(f.id)}
              alt={f.original_filename}
              sx={{ height: 100, objectFit: 'cover' }}
            />
            <Box
              sx={{
                px: 0.75,
                py: 0.5,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                noWrap
                sx={{ maxWidth: '75%' }}
              >
                {f.original_filename}
              </Typography>
              <Tooltip title="מחק">
                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); onDelete(f.id) }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}
