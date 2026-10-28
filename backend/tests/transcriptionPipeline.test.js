import assert from 'node:assert/strict'
import test from 'node:test'
import { detectOnsets } from '../services/onsetDetector.js'
import { detectPitch, smoothPitchContour } from '../services/pitchDetector.js'
import { quantizeNotes } from '../services/noteQuantizer.js'

function createMelodyAudio() {
  const sampleRate = 44100
  const duration = 4
  const frequencies = [262, 294, 330, 349, 392, 440, 392]
  const samplesPerNote = Math.floor(sampleRate * duration / frequencies.length)
  const audio = new Float32Array(sampleRate * duration)

  frequencies.forEach((frequency, noteIndex) => {
    const start = noteIndex * samplesPerNote
    for (let i = 0; i < samplesPerNote; i++) {
      audio[start + i] = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.3
    }
  })

  return { audio, sampleRate, duration, frequencies }
}

test('transcribes the expected notes from the seven-note melody', () => {
  const { audio, sampleRate, duration } = createMelodyAudio()
  const pitches = smoothPitchContour(detectPitch(audio, sampleRate), 0.1)
  const { onsetTimes } = detectOnsets(audio, sampleRate)
  const notes = quantizeNotes(pitches, onsetTimes, duration)

  assert.equal(onsetTimes.length, 7)
  assert.equal(notes.length, 7)
  assert.deepEqual(
    notes.map(note => note.pitch),
    ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Sol4']
  )

  const expectedBoundaries = [0, 4 / 7, 8 / 7, 12 / 7, 16 / 7, 20 / 7, 24 / 7]
  onsetTimes.forEach((onset, index) => {
    assert.ok(Math.abs(onset - expectedBoundaries[index]) < 0.03)
  })
})
