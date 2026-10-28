import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import path from 'path'
import { uploadHandler } from './middleware/uploadHandler.js'
import { transcribeAudio } from './services/transcriber.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

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
  if (!req.uploadedFile) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded',
      code: 'NO_FILE'
    })
  }

  const { path: filePath } = req.uploadedFile

  try {
    console.log(`[API] Transcribing: ${req.uploadedFile.originalName}`)

    const result = await transcribeAudio(filePath)

    if (result.success) {
      console.log(`[API] Transcription complete: ${result.notes.length} notes`)
      return res.json(result)
    } else {
      console.error(`[API] Transcription failed: ${result.error}`)
      return res.status(500).json(result)
    }
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
  console.log(`\n✅ Backend server running on http://localhost:${PORT}`)
  console.log(`📡 CORS origin: ${CORS_ORIGIN}`)
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health\n`)
})

export default app
