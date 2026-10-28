const MIDI_TO_NOTE = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si']

const MIN_AMPLITUDE = 0.2
const MIN_DURATION = 0.08
const MIN_MIDI = 55
const MAX_MIDI = 96
const LOUDNESS_RATIO = 0.6
const MERGE_GAP = 0.06
const MIN_BPM = 60
const MAX_BPM = 180
const PREFERRED_BPM = 100
const STEPS_PER_BEAT = 4

function midiToPitchName(midiNote) {
  const octave = Math.floor(midiNote / 12) - 1
  return MIDI_TO_NOTE[midiNote % 12] + octave
}

export function extractMelody(noteEvents) {
  const notes = noteEvents
    .filter(note =>
      note.amplitude >= MIN_AMPLITUDE &&
      note.durationSeconds >= MIN_DURATION &&
      note.pitchMidi >= MIN_MIDI &&
      note.pitchMidi <= MAX_MIDI
    )
    .map(note => ({
      start: note.startTimeSeconds,
      end: note.startTimeSeconds + note.durationSeconds,
      midi: note.pitchMidi,
      amplitude: note.amplitude
    }))

  const boundaries = [...new Set(notes.flatMap(note => [note.start, note.end]))].sort((a, b) => a - b)
  const segments = []

  for (let i = 0; i < boundaries.length - 1; i++) {
    const start = boundaries[i]
    const end = boundaries[i + 1]
    if (end - start < 0.005) continue

    const active = notes.filter(note => note.start <= start + 0.001 && note.end >= end - 0.001)
    if (active.length === 0) continue

    const loudest = Math.max(...active.map(note => note.amplitude))
    const chosen = active
      .filter(note => note.amplitude >= loudest * LOUDNESS_RATIO)
      .reduce((highest, note) => (note.midi > highest.midi ? note : highest))

    const previous = segments[segments.length - 1]
    if (previous && previous.source === chosen && Math.abs(previous.end - start) < 0.005) {
      previous.end = end
    } else {
      segments.push({ source: chosen, start, end, midi: chosen.midi, amplitude: chosen.amplitude })
    }
  }

  const melody = []

  for (const segment of segments) {
    if (segment.end - segment.start < MIN_DURATION) continue

    const previous = melody[melody.length - 1]
    if (previous && previous.midi === segment.midi && segment.start - previous.end < MERGE_GAP) {
      previous.end = segment.end
      previous.amplitude = Math.max(previous.amplitude, segment.amplitude)
    } else {
      melody.push({
        start: segment.start,
        end: segment.end,
        midi: segment.midi,
        amplitude: segment.amplitude
      })
    }
  }

  return melody
}

export function estimateTempo(melody) {
  if (melody.length < 2) {
    return { bpm: PREFERRED_BPM, offset: melody.length ? melody[0].start : 0 }
  }

  const totalWeight = melody.reduce((sum, note) => sum + note.amplitude, 0)
  let best = { score: -1, bpm: PREFERRED_BPM, offset: 0 }

  for (let bpm = MIN_BPM; bpm <= MAX_BPM; bpm += 0.5) {
    const beat = 60 / bpm
    let real = 0
    let imaginary = 0

    for (const note of melody) {
      const angle = 2 * Math.PI * note.start / beat
      real += note.amplitude * Math.cos(angle)
      imaginary += note.amplitude * Math.sin(angle)
    }

    const prior = Math.exp(-0.5 * Math.pow(Math.log2(bpm / PREFERRED_BPM) / 0.6, 2))
    const score = Math.hypot(real, imaginary) / totalWeight * prior

    if (score > best.score) {
      const phase = Math.atan2(imaginary, real)
      const offset = ((phase / (2 * Math.PI)) * beat + beat) % beat
      best = { score, bpm, offset }
    }
  }

  return { bpm: Math.round(best.bpm), offset: best.offset }
}

export function melodyToScoreNotes(melody, tempo) {
  const stepSeconds = 60 / tempo.bpm / STEPS_PER_BEAT
  const toStep = seconds => Math.round((seconds - tempo.offset) / stepSeconds)

  if (melody.length === 0) return []

  const firstStep = toStep(melody[0].start)
  const shift = Math.floor(firstStep / STEPS_PER_BEAT) * STEPS_PER_BEAT
  const notes = []

  for (const note of melody) {
    const start = toStep(note.start) - shift
    const end = Math.max(toStep(note.end) - shift, start + 1)
    const previous = notes[notes.length - 1]

    if (previous) {
      if (start <= previous.start) continue
      if (start < previous.start + previous.length) {
        previous.length = start - previous.start
      }
    }

    notes.push({
      pitch: midiToPitchName(note.midi),
      start,
      length: end - start,
      time: note.start,
      confidence: Math.min(1, note.amplitude)
    })
  }

  return notes.reduce((cleaned, note) => {
    if (note.length > 1) {
      cleaned.push(note)
      return cleaned
    }

    const previous = cleaned[cleaned.length - 1]
    if (previous && previous.start + previous.length === note.start) {
      previous.length += note.length
    }
    return cleaned
  }, [])
}

export default {
  extractMelody,
  estimateTempo,
  melodyToScoreNotes
}
