import { useState } from 'react'
import {
  Box, Button, Chip, Paper, Stack, Typography
} from '@mui/material'
import { CheckCircle, RadioButtonUnchecked } from '@mui/icons-material'
import { activateModel } from '../../api/trainingApi'
import { MLModelOut } from '../../types'

interface Props {
  models: MLModelOut[]
  onActivated: () => void
}

export default function ModelList({ models, onActivated }: Props) {
  const [loading, setLoading] = useState<string | null>(null)

  const handleActivate = async (id: string) => {
    setLoading(id)
    try {
      await activateModel(id)
      onActivated()
    } catch {
      // ignore
    } finally {
      setLoading(null)
    }
  }

  if (models.length === 0) {
    return (
      <Typography variant="body2" color="text.disabled">
        אין מודלים מאומנים עדיין
      </Typography>
    )
  }

  return (
    <Stack spacing={1.5}>
      {models.map((m) => (
        <Paper
          key={m.id}
          variant="outlined"
          sx={{
            p: 1.5,
            borderColor: m.is_active ? 'primary.main' : 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            {m.is_active
              ? <CheckCircle color="primary" fontSize="small" />
              : <RadioButtonUnchecked fontSize="small" sx={{ color: 'text.disabled' }} />
            }
            <Box>
              <Typography variant="body2" fontWeight={600}>{m.name}</Typography>
              <Typography variant="caption" color="text.secondary">{m.base_model}</Typography>
            </Box>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            {m.is_active && <Chip label="פעיל" size="small" color="primary" />}
            {!m.is_active && (
              <Button
                size="small"
                variant="outlined"
                disabled={loading === m.id}
                onClick={() => handleActivate(m.id)}
              >
                הפעל
              </Button>
            )}
          </Box>
        </Paper>
      ))}
    </Stack>
  )
}
