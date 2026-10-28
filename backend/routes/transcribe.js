import express from 'express'
import { transcribeAudio } from '../services/transcriber.js'

const router = express.Router()

router.post('/', async (req, res) => {
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

export default router
