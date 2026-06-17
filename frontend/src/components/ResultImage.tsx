import { Box, Paper, Typography } from '@mui/material'

interface ResultImageProps {
  base64: string
}

export default function ResultImage({ base64 }: ResultImageProps) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle2" color="text.secondary" mb={1}>
        תמונה עם זיהויים
      </Typography>
      <Box
        component="img"
        src={`data:image/jpeg;base64,${base64}`}
        alt="תמונה עם זיהויים"
        sx={{ width: '100%', borderRadius: 1, display: 'block' }}
      />
    </Paper>
  )
}
