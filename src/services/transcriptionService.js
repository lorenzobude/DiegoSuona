import { validateAudioFile } from './fileValidator.js'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

export async function transcribeAudio(file) {
  try {
    const validation = validateAudioFile(file)
    if (!validation.valid) {
      throw new Error(validation.message)
    }

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

    return {
      success: true,
      notes: result.notes,
      metadata: result.metadata
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      code: 'TRANSCRIPTION_ERROR'
    }
  }
}
