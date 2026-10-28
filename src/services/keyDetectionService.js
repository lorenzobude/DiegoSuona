const MAJOR_KEYS = [
  'Do Maggiore', 'Do# Maggiore', 'Re Maggiore', 'Mib Maggiore', 'Mi Maggiore',
  'Fa Maggiore', 'Fa# Maggiore', 'Sol Maggiore', 'Sol# Maggiore', 'La Maggiore',
  'Sib Maggiore', 'Si Maggiore'
]

const MINOR_KEYS = [
  'La Minore', 'La# Minore', 'Si Minore', 'Do Minore', 'Do# Minore',
  'Re Minore', 'Mib Minore', 'Mi Minore', 'Fa Minore', 'Fa# Minore',
  'Sol Minore', 'Sol# Minore'
]

export const ALL_KEYS = [...MAJOR_KEYS, ...MINOR_KEYS]

let essentiaModule = null

async function loadEssentia() {
  if (essentiaModule) {
    return essentiaModule
  }

  try {
    const module = await import('essentia.js')
    const Essentia = module.default || module.Essentia
    essentiaModule = new Essentia(Essentia.EssentiaMode.ONLINE)
    return essentiaModule
  } catch (error) {
    console.warn('Essentia.js non disponibile, modalità manuale abilitata:', error.message)
    return null
  }
}

async function extractAudioFeatures(arrayBuffer) {
  const essentia = await loadEssentia()

  if (!essentia) {
    throw new Error('Essentia.js non disponibile')
  }

  const audioContext = new (window.AudioContext || window.webkitAudioContext)()

  try {
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0))
    const signal = audioBuffer.getChannelData(0)

    if (!essentia.KeyExtractor) {
      throw new Error('KeyExtractor non disponibile in Essentia.js')
    }

    const keyExtractor = essentia.KeyExtractor
    const keyResult = keyExtractor(signal)

    return {
      key: keyResult.key,
      scale: keyResult.scale,
      strength: keyResult.strength
    }
  } catch (error) {
    console.error('Errore nell\'estrazione delle features:', error)
    throw error
  }
}

function mapEssentiaKeyToItalian(essentiaKey, scale) {
  const keys = {
    'C': 0, 'C#': 1, 'D': 2, 'Eb': 3, 'E': 4, 'F': 5,
    'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'Bb': 10, 'B': 11
  }

  const keyIndex = keys[essentiaKey]
  if (keyIndex === undefined) {
    return null
  }

  if (scale && scale.toLowerCase() === 'minor') {
    return MINOR_KEYS[keyIndex]
  } else {
    return MAJOR_KEYS[keyIndex]
  }
}

export async function detectKey(arrayBuffer) {
  try {
    const features = await extractAudioFeatures(arrayBuffer)
    const detectedKey = mapEssentiaKeyToItalian(features.key, features.scale)

    return {
      success: true,
      key: detectedKey,
      confidence: Math.round(features.strength * 100),
      raw: features
    }
  } catch (error) {
    console.warn('Rilevamento della tonalità fallito, modalità manuale:', error.message)
    return {
      success: false,
      key: null,
      confidence: 0,
      error: error.message
    }
  }
}

export function getKeyOptions() {
  return ALL_KEYS
}
