const A4_FREQUENCY = 440
const A4_MIDI = 69

function freqToMidi(frequency) {
  if (frequency <= 0) return null
  return Math.round(12 * Math.log2(frequency / A4_FREQUENCY) + A4_MIDI)
}

function midiToFreq(midiNote) {
  return A4_FREQUENCY * Math.pow(2, (midiNote - A4_MIDI) / 12)
}

const MIDI_TO_NOTE = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
]

function midiToNoteName(midiNote) {
  const octave = Math.floor(midiNote / 12) - 1
  const noteIndex = midiNote % 12
  return MIDI_TO_NOTE[noteIndex] + octave
}

const ITALIAN_NOTES = {
  'C': 'Do', 'C#': 'Do#', 'D': 'Re', 'D#': 'Re#',
  'E': 'Mi', 'F': 'Fa', 'F#': 'Fa#', 'G': 'Sol',
  'G#': 'Sol#', 'A': 'La', 'A#': 'La#', 'B': 'Si'
}

function noteNameToItalian(noteName) {
  const note = noteName.slice(0, -1)
  const octave = noteName.slice(-1)
  const italian = ITALIAN_NOTES[note]
  return italian ? italian + octave : noteName
}

function quantizeToScale(frequency) {
  if (!frequency || frequency <= 0) return null

  const midiNote = freqToMidi(frequency)
  if (midiNote === null) return null

  const noteName = midiToNoteName(midiNote)
  const italianNote = noteNameToItalian(noteName)

  return {
    frequency,
    midiNote,
    noteName,
    italianNote
  }
}

function durationToDurationString(durationMs) {
  const durationQuarters = (durationMs / 1000) * 4

  if (Math.abs(durationQuarters - 4) < 0.2) return 'whole'
  if (Math.abs(durationQuarters - 2) < 0.2) return 'half'
  if (Math.abs(durationQuarters - 1) < 0.2) return 'quarter'
  if (Math.abs(durationQuarters - 0.5) < 0.2) return 'eighth'
  if (Math.abs(durationQuarters - 0.25) < 0.2) return 'sixteenth'

  return 'quarter'
}

function median(values) {
  const sortedValues = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sortedValues.length / 2)

  if (sortedValues.length % 2 === 0) {
    return (sortedValues[middle - 1] + sortedValues[middle]) / 2
  }

  return sortedValues[middle]
}

export function quantizeNotes(detectedPitches, onsetTimes, audioDuration) {
  const quantizedNotes = []
  const lastPitch = detectedPitches[detectedPitches.length - 1]
  const duration = audioDuration || (lastPitch ? lastPitch.time + 0.01 : 0)
  const noteStarts = [...new Set([0, ...onsetTimes.filter(time => time > 0)])]

  for (let i = 0; i < noteStarts.length; i++) {
    const onset = noteStarts[i]
    const nextOnset = noteStarts[i + 1] || duration
    const noteDuration = nextOnset - onset

    if (noteDuration <= 0) continue

    const margin = Math.min(0.05, noteDuration * 0.2)
    let frames = detectedPitches.filter(pitch =>
      pitch.time >= onset + margin &&
      pitch.time < nextOnset - margin &&
      pitch.frequency > 0
    )

    if (frames.length === 0) {
      const midpoint = onset + noteDuration / 2
      const nearestFrame = detectedPitches.reduce((nearest, pitch) => {
        if (!pitch.frequency || pitch.frequency <= 0) return nearest
        if (!nearest || Math.abs(pitch.time - midpoint) < Math.abs(nearest.time - midpoint)) {
          return pitch
        }
        return nearest
      }, null)
      frames = nearestFrame ? [nearestFrame] : []
    }

    const midiNotes = frames
      .map(pitch => pitch.frequency > 0 ? freqToMidi(pitch.frequency) : null)
      .filter(note => note !== null)
    if (midiNotes.length === 0) continue

    const midiNote = Math.round(median(midiNotes))
    const quantized = quantizeToScale(midiToFreq(midiNote))

    if (quantized) {
      quantizedNotes.push({
        pitch: quantized.italianNote,
        duration: durationToDurationString(noteDuration * 1000),
        time: onset,
        confidence: frames.reduce((sum, pitch) => sum + pitch.confidence, 0) / frames.length
      })
    }
  }

  return quantizedNotes
}

export default {
  freqToMidi,
  midiToFreq,
  midiToNoteName,
  quantizeToScale,
  quantizeNotes,
  durationToDurationString
}
