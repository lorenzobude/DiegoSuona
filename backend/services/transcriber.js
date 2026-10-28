import { decodeAudioFile, removeFile } from './audioDecoder.js'
import { detectNotes } from './polyphonicDetector.js'
import { extractMelody, estimateTempo, melodyToScoreNotes } from './melodyExtractor.js'

const MODEL_SAMPLE_RATE = 22050

export async function transcribeAudio(filePath) {
  try {
    const { audioBuffer, sampleRate } = await decodeAudioFile(filePath, MODEL_SAMPLE_RATE)
    const duration = audioBuffer.length / sampleRate

    const noteEvents = await detectNotes(audioBuffer)
    const melody = extractMelody(noteEvents)
    const tempo = estimateTempo(melody)
    const notes = melodyToScoreNotes(melody, tempo)

    return {
      success: true,
      notes,
      metadata: {
        sampleRate,
        duration,
        tempo: tempo.bpm,
        confidence: calculateConfidence(notes),
        totalNotesDetected: noteEvents.length
      }
    }
  } catch (error) {
    console.error('[Transcriber] Error:', error.message)
    return {
      success: false,
      error: error.message,
      code: 'TRANSCRIPTION_ERROR'
    }
  } finally {
    await removeFile(filePath)
  }
}

function calculateConfidence(notes) {
  if (notes.length === 0) return 0

  const avgConfidence = notes.reduce((sum, note) => sum + (note.confidence || 0.5), 0) / notes.length
  return Math.round(avgConfidence * 100) / 100
}
