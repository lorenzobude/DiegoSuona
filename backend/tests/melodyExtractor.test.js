import assert from 'node:assert/strict'
import test from 'node:test'
import { extractMelody, estimateTempo, melodyToScoreNotes } from '../services/melodyExtractor.js'

function buildEvents(bpm) {
  const beat = 60 / bpm
  const melodyMidi = [67, 69, 71, 72, 71, 69, 67, 64]
  const events = melodyMidi.map((pitchMidi, index) => ({
    startTimeSeconds: 0.3 + index * beat,
    durationSeconds: beat * 0.9,
    pitchMidi,
    amplitude: 0.7
  }))

  events.push({ startTimeSeconds: 0.3, durationSeconds: beat * 8, pitchMidi: 55, amplitude: 0.8 })
  events.push({ startTimeSeconds: 0.3 + beat, durationSeconds: beat, pitchMidi: 93, amplitude: 0.1 })

  return events
}

test('extracts the highest loud voice and ignores weak notes', () => {
  const melody = extractMelody(buildEvents(100))
  assert.deepEqual(melody.map(note => note.midi), [67, 69, 71, 72, 71, 69, 67, 64])
})

test('estimates tempo and quantizes onto a sixteenth grid', () => {
  const melody = extractMelody(buildEvents(100))
  const tempo = estimateTempo(melody)
  assert.ok(Math.abs(tempo.bpm - 100) <= 2)

  const notes = melodyToScoreNotes(melody, tempo)
  assert.equal(notes.length, 8)
  notes.forEach((note, index) => {
    assert.equal(note.start - notes[0].start, index * 4)
    assert.ok(note.length >= 3 && note.length <= 4)
  })
  assert.deepEqual(
    notes.map(note => note.pitch),
    ['Sol4', 'La4', 'Si4', 'Do5', 'Si4', 'La4', 'Sol4', 'Mi4']
  )
})
