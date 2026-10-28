import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import { uploadHandler } from './middleware/uploadHandler.js'
import { transcribeAudio } from './services/transcriber.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173'

app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '0.1.0'
  })
})

app.post('/api/transcribe', uploadHandler, async (req, res) => {
  try {
    const result = await transcribeAudio(req.uploadedFile.path)
    return res.status(result.success ? 200 : 500).json(result)
  } catch (error) {
    console.error('[API] Unexpected error:', error)
    return res.status(500).json({
      success: false,
      error: error.message,
      code: 'SERVER_ERROR'
    })
  }
})

app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
    code: 'SERVER_ERROR'
  })
})

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`)
})

export default app
