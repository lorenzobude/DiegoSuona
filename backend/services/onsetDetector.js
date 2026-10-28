import FFT from 'fft.js'

function calculateSpectralFlux(audioBuffer, sampleRate, windowSize, hopSize) {
  const fft = new FFT(windowSize)
  const spectrum = fft.createComplexArray()
  const frame = new Float64Array(windowSize)
  const fluxValues = []
  let previousMagnitudes = null

  for (let offset = 0; offset + windowSize <= audioBuffer.length; offset += hopSize) {
    for (let i = 0; i < windowSize; i++) {
      const window = 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (windowSize - 1))
      frame[i] = audioBuffer[offset + i] * window
    }

    fft.realTransform(spectrum, frame)
    fft.completeSpectrum(spectrum)

    const magnitudes = new Float64Array(windowSize / 2)
    for (let bin = 0; bin < magnitudes.length; bin++) {
      const real = spectrum[bin * 2]
      const imaginary = spectrum[bin * 2 + 1]
      magnitudes[bin] = Math.sqrt(real * real + imaginary * imaginary)
    }

    let flux = 0
    if (previousMagnitudes) {
      for (let bin = 0; bin < magnitudes.length; bin++) {
        flux += Math.max(0, magnitudes[bin] - previousMagnitudes[bin])
      }
    }

    fluxValues.push({
      time: offset / sampleRate,
      flux
    })
    previousMagnitudes = magnitudes
  }

  return fluxValues
}

function pickFluxPeaks(fluxValues, thresholdRatio, minimumDistance) {
  if (fluxValues.length < 3) return []

  const maximumFlux = Math.max(...fluxValues.map(frame => frame.flux))
  if (maximumFlux <= 0) return []

  const threshold = maximumFlux * thresholdRatio
  const candidates = []

  for (let i = 1; i < fluxValues.length - 1; i++) {
    const current = fluxValues[i].flux
    if (
      current >= threshold &&
      current > fluxValues[i - 1].flux &&
      current >= fluxValues[i + 1].flux
    ) {
      candidates.push({ index: i, flux: current })
    }
  }

  const selected = []
  candidates
    .sort((a, b) => b.flux - a.flux)
    .forEach(candidate => {
      if (selected.every(peak => Math.abs(peak.index - candidate.index) >= minimumDistance)) {
        selected.push(candidate)
      }
    })

  return selected.sort((a, b) => a.index - b.index)
}

export function detectOnsets(audioBuffer, sampleRate, windowSize = 2048) {
  const hopSize = Math.floor(sampleRate * 0.01)
  const fluxValues = calculateSpectralFlux(audioBuffer, sampleRate, windowSize, hopSize)
  const peaks = pickFluxPeaks(fluxValues, 0.2, Math.ceil(sampleRate * 0.08 / hopSize))
  const frameCenterOffset = windowSize / (2 * sampleRate)
  const onsetTimes = [
    0,
    ...peaks.map(peak => fluxValues[peak.index].time + frameCenterOffset)
  ]

  return {
    onsetTimes,
    envelope: fluxValues.map(frame => frame.flux),
    peaks
  }
}

export function extractNoteDurations(audioBuffer, sampleRate, pitches, onsetTimes) {
  if (onsetTimes.length === 0) return []

  const totalDuration = audioBuffer.length / sampleRate

  return onsetTimes.map((onsetTime, index) => ({
    onsetTime,
    duration: (onsetTimes[index + 1] || totalDuration) - onsetTime,
    confidence: pitches[index]?.confidence || 0
  })).filter(note => note.duration > 0.05)
}

export default {
  detectOnsets,
  extractNoteDurations
}
