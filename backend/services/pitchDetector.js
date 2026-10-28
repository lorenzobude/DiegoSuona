import FFT from 'fft.js'

const DEFAULT_THRESHOLD = 0.15
const MIN_FREQUENCY = 50
const MAX_FREQUENCY = 2000

function applyHammingWindow(buffer) {
  const windowed = new Float32Array(buffer.length)
  for (let i = 0; i < buffer.length; i++) {
    const window = 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (buffer.length - 1))
    windowed[i] = buffer[i] * window
  }
  return windowed
}

function autoCorrelation(buffer, sampleRate) {
  const size = buffer.length
  const minSamples = Math.floor(sampleRate / MAX_FREQUENCY)
  const maxSamples = Math.floor(sampleRate / MIN_FREQUENCY)

  let best_offset = -1
  let best_correlation = 0
  let rms = 0

  for (let i = 0; i < size; i++) {
    const val = buffer[i]
    rms += val * val
  }
  rms = Math.sqrt(rms / size)

  if (rms < 0.01) return -1

  let lastCorrelation = 1
  for (let offset = minSamples; offset < maxSamples; offset++) {
    let correlation = 0
    let normalizer = 0

    for (let i = 0; i + offset < size; i++) {
      const diff = buffer[i] - buffer[i + offset]
      correlation += diff * diff
      normalizer += buffer[i] * buffer[i] + buffer[i + offset] * buffer[i + offset]
    }

    correlation = 1 - (2 * correlation) / (normalizer || 1)

    if (correlation > best_correlation) {
      best_correlation = correlation
      best_offset = offset
    }

    lastCorrelation = correlation
  }

  if (best_correlation > DEFAULT_THRESHOLD) {
    return best_offset
  }

  return -1
}

function calculateRMS(buffer) {
  let sum = 0
  for (let i = 0; i < buffer.length; i++) {
    sum += buffer[i] * buffer[i]
  }
  return Math.sqrt(sum / buffer.length)
}

function calculateZeroCrossingRate(buffer) {
  let crossings = 0
  for (let i = 1; i < buffer.length; i++) {
    if ((buffer[i - 1] < 0 && buffer[i] >= 0) || (buffer[i - 1] >= 0 && buffer[i] < 0)) {
      crossings++
    }
  }
  return crossings / buffer.length
}

export function detectPitch(audioBuffer, sampleRate, windowSize = 2048) {
  const pitches = []
  let hopSize = Math.floor(sampleRate * 0.01)

  for (let i = 0; i + windowSize < audioBuffer.length; i += hopSize) {
    const window = audioBuffer.slice(i, i + windowSize)
    const windowedBuffer = applyHammingWindow(window)

    const offset = autoCorrelation(windowedBuffer, sampleRate)

    if (offset === -1) {
      pitches.push({
        frequency: 0,
        confidence: 0,
        time: i / sampleRate
      })
    } else {
      const frequency = sampleRate / offset

      if (frequency < MIN_FREQUENCY || frequency > MAX_FREQUENCY) {
        pitches.push({
          frequency: 0,
          confidence: 0,
          time: i / sampleRate
        })
        continue
      }

      const rms = calculateRMS(windowedBuffer)
      const zcr = calculateZeroCrossingRate(windowedBuffer)

      const rmsConfidence = Math.min(1, rms * 3)
      const energyConfidence = rms > 0.01 ? 1 : rms * 100
      const voicingConfidence = zcr < 0.3 ? 1 : 0.3 / (zcr + 0.01)

      const confidence = (rmsConfidence * 0.5 + energyConfidence * 0.3 + voicingConfidence * 0.2)

      pitches.push({
        frequency: Math.round(frequency * 10) / 10,
        confidence: Math.min(1, confidence),
        time: i / sampleRate,
        offset
      })
    }
  }

  return pitches
}

export function smoothPitchContour(pitches, minConfidence = 0.15) {
  const smoothed = []
  const window = 3

  for (let i = 0; i < pitches.length; i++) {
    const current = pitches[i]

    if (current.confidence < minConfidence) {
      smoothed.push({
        ...current,
        frequency: 0,
        confidence: 0
      })
      continue
    }

    let sumFreq = 0
    let sumWeight = 0
    let countValid = 0

    for (let j = Math.max(0, i - window); j <= Math.min(pitches.length - 1, i + window); j++) {
      const p = pitches[j]
      if (p.confidence > minConfidence) {
        const weight = Math.exp(-0.5 * Math.abs(i - j))
        sumFreq += p.frequency * weight
        sumWeight += weight
        countValid++
      }
    }

    const smoothedFreq = sumWeight > 0 ? sumFreq / sumWeight : current.frequency
    const smoothedConfidence = current.confidence * (1 + Math.min(0.2, countValid * 0.1))

    smoothed.push({
      ...current,
      frequency: Math.round(smoothedFreq * 10) / 10,
      confidence: Math.min(1, smoothedConfidence)
    })
  }

  return removeOctaveErrors(smoothed, minConfidence)
}

function removeOctaveErrors(pitches, minConfidence) {
  const filtered = []

  for (let i = 0; i < pitches.length; i++) {
    const current = pitches[i]

    if (current.confidence < minConfidence) {
      filtered.push(current)
      continue
    }

    if (i > 0 && i < pitches.length - 1) {
      const prev = pitches[i - 1]
      const next = pitches[i + 1]

      if (prev.frequency > 0 && next.frequency > 0) {
        const ratio1 = current.frequency / prev.frequency
        const ratio2 = next.frequency / current.frequency

        if ((ratio1 > 1.8 && ratio1 < 2.2) || (ratio2 > 1.8 && ratio2 < 2.2)) {
          if (current.frequency < (prev.frequency + next.frequency) / 2 * 0.6) {
            current.frequency *= 2
          }
        }
      }
    }

    filtered.push(current)
  }

  return filtered
}

export default {
  detectPitch,
  smoothPitchContour
}

