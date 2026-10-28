import { validateMp3File } from './fileValidator.js'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

export async function transcribeAudio(file) {
  try {
    const validation = validateMp3File(file)
    if (!validation.valid) {
      throw new Error(validation.message)
    }

    console.log(`[Frontend] Sending file to backend: ${file.name}`)

    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${BACKEND_URL}/api/transcribe`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Transcription failed')
    }

    console.log(`[Frontend] Transcription complete: ${result.notes.length} notes`)

    return {
      success: true,
      notes: result.notes,
      metadata: result.metadata
    }
  } catch (error) {
    console.error('[Frontend] Transcription error:', error.message)
    return {
      success: false,
      error: error.message,
      code: 'TRANSCRIPTION_ERROR'
    }
  }
}
