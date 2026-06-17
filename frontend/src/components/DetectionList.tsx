import { Box, Chip, LinearProgress, Paper, Stack, Typography } from '@mui/material'
import { Detection } from '../types'

interface DetectionListProps {
  detections: Detection[]
  counts_by_class: Record<string, number>
}

const CLASS_COLORS: Record<string, string> = {
  person:     '#FF4444',
  bicycle:    '#00AAAA',
  car:        '#4444FF',
  motorcycle: '#00AA00',
  airplane:   '#DCDC00',
  bus:        '#8800FF',
  truck:      '#FF8800',
  boat:       '#FF69B4',
}

const CLASS_LABELS: Record<string, string> = {
  person:     'אדם',
  bicycle:    'אופניים',
  car:        'רכב',
  motorcycle: 'אופנוע',
  airplane:   'מטוס',
  bus:        'אוטובוס',
  truck:      'משאית',
  boat:       'סירה',
}

function colorFor(cls: string) {
  return CLASS_COLORS[cls] ?? '#7777aa'
}

export default function DetectionList({ detections, counts_by_class }: DetectionListProps) {
  return (
    <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
      <Typography variant="subtitle2" color="text.secondary" mb={2}>
        זיהויים ({detections.length})
      </Typography>

      <Stack direction="row" flexWrap="wrap" gap={1} mb={3}>
        {Object.entries(counts_by_class).map(([cls, count]) => (
          <Chip
            key={cls}
            label={`${CLASS_LABELS[cls] ?? cls} × ${count}`}
            size="small"
            sx={{ bgcolor: colorFor(cls), color: '#fff', fontWeight: 600 }}
          />
        ))}
      </Stack>

      {detections.length === 0 ? (
        <Typography color="text.disabled" variant="body2">לא נמצאו זיהויים.</Typography>
      ) : (
        <Stack spacing={1.5}>
          {detections.map((det, idx) => {
            const pct = Math.round(det.confidence * 100)
            const color = colorFor(det.class_name)
            return (
              <Box
                key={idx}
                sx={{
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                  p: 1.5,
                  borderRight: `4px solid ${color}`,
                }}
              >
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="body2" fontWeight={600}>
                    {CLASS_LABELS[det.class_name] ?? det.class_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">{pct}%</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={pct}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: 'action.selected',
                    '& .MuiLinearProgress-bar': { bgcolor: color },
                  }}
                />
              </Box>
            )
          })}
        </Stack>
      )}
    </Paper>
  )
}
