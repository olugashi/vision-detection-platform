import { useState } from 'react'
import {
  Box, Container, CssBaseline, Tab, Tabs,
  ThemeProvider, Typography, createTheme,
} from '@mui/material'
import { CenterFocusStrong, ModelTraining } from '@mui/icons-material'
import DetectionPage from './pages/DetectionPage'
import TrainingPage from './pages/TrainingPage'

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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" alignItems="center" gap={1.5} mb={3}>
          <CenterFocusStrong sx={{ fontSize: 36, color: 'primary.main' }} />
          <Typography variant="h4" fontWeight={700}>מערכת זיהוי אובייקטים</Typography>
        </Box>

        <Tabs
          value={page}
          onChange={(_, v) => setPage(v)}
          sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<CenterFocusStrong />} iconPosition="start" label="זיהוי" />
          <Tab icon={<ModelTraining />} iconPosition="start" label="אימון מודל" />
        </Tabs>

        {page === 0 && <DetectionPage />}
        {page === 1 && <TrainingPage />}
      </Container>
    </ThemeProvider>
  )
}
