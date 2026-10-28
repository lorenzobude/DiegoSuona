import { decodeAudioFile, cleanup } from './audioDecoder.js'
import { detectNotes } from './polyphonicDetector.js'
import { extractMelody, estimateTempo, melodyToScoreNotes } from './melodyExtractor.js'

const MODEL_SAMPLE_RATE = 22050

export async function transcribeAudio(filePath) {
  try {
    console.log(`[Transcriber] Decoding audio file: ${filePath}`)
    const { audioBuffer, sampleRate } = await decodeAudioFile(filePath, MODEL_SAMPLE_RATE, true)
    const duration = audioBuffer.length / sampleRate
    console.log(`[Transcriber] Audio decoded: ${duration.toFixed(1)}s @ ${sampleRate}Hz`)

    console.log('[Transcriber] Detecting notes with Basic Pitch...')
    let lastLoggedPercent = -10
    const noteEvents = await detectNotes(audioBuffer, percent => {
      const rounded = Math.floor(percent * 100)
      if (rounded >= lastLoggedPercent + 10) {
        lastLoggedPercent = rounded
        console.log(`[Transcriber] Progress: ${rounded}%`)
      }
    })
    console.log(`[Transcriber] Notes detected: ${noteEvents.length}`)

    const melody = extractMelody(noteEvents)
    const tempo = estimateTempo(melody)
    const notes = melodyToScoreNotes(melody, tempo)
    console.log(`[Transcriber] Melody notes: ${notes.length}, tempo: ${tempo.bpm} bpm`)

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
    if (filePath) {
      await cleanup(filePath)
    }
  }
}

function calculateConfidence(notes) {
  if (notes.length === 0) return 0

  const avgConfidence = notes.reduce((sum, note) => sum + (note.confidence || 0.5), 0) / notes.length
  return Math.round(avgConfidence * 100) / 100
}

export default {
  transcribeAudio
}
