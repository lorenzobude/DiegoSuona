import fs from 'fs'
import { promisify } from 'util'
import { convertMP3toWAV, cleanupWAV } from './mp3Converter.js'

const readFile = promisify(fs.readFile)
const unlink = promisify(fs.unlink)

export async function decodeAudioFile(filePath, sampleRate = 44100, resample = false) {
  try {
    let audioFilePath = filePath
    let isConvertedMP3 = false

    const buffer = await readFile(filePath)

    if (!isWavFile(buffer) || resample) {
      console.log(`[AudioDecoder] Converting with FFmpeg to ${sampleRate}Hz mono`)
      audioFilePath = await convertMP3toWAV(filePath, sampleRate)
      isConvertedMP3 = true
    } else {
      console.log('[AudioDecoder] Detected WAV format, parsing directly')
    }

    const wavBuffer = await readFile(audioFilePath)
    const result = parseWavFile(wavBuffer, sampleRate)
    
    if (isConvertedMP3) {
      await cleanupWAV(audioFilePath)
    }

    return result
  } catch (error) {
    throw error
  }
}

function isWavFile(buffer) {
  if (buffer.length < 12) return false
  return (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x41 &&
    buffer[10] === 0x56 &&
    buffer[11] === 0x45
  )
}

function parseWavFile(buffer, requestedSampleRate = 44100) {
  let offset = 12

  let dataOffset = 0
  let dataSize = 0
  let audioFormat = 0
  let numChannels = 0
  let sampleRate = 0
  let byteRate = 0
  let blockAlign = 0
  let bitsPerSample = 0

  while (offset < buffer.length) {
    const chunkId = buffer.toString('ascii', offset, offset + 4)
    const chunkSize = buffer.readUInt32LE(offset + 4)
    const chunkData = offset + 8

    if (chunkId === 'fmt ') {
      audioFormat = buffer.readUInt16LE(chunkData)
      numChannels = buffer.readUInt16LE(chunkData + 2)
      sampleRate = buffer.readUInt32LE(chunkData + 4)
      byteRate = buffer.readUInt32LE(chunkData + 8)
      blockAlign = buffer.readUInt16LE(chunkData + 12)
      bitsPerSample = buffer.readUInt16LE(chunkData + 14)
    } else if (chunkId === 'data') {
      dataOffset = chunkData
      dataSize = chunkSize
      break
    }

    offset += 8 + chunkSize
  }

  if (dataOffset === 0) {
    throw new Error('No audio data found in WAV file')
  }

  const pcmData = new Float32Array((dataSize / (bitsPerSample / 8)))

  for (let i = 0; i < pcmData.length; i++) {
    const sampleOffset = dataOffset + i * (bitsPerSample / 8)

    if (bitsPerSample === 16) {
      const int16 = buffer.readInt16LE(sampleOffset)
      pcmData[i] = int16 / 32768
    } else if (bitsPerSample === 24) {
      let int24 = buffer[sampleOffset] | (buffer[sampleOffset + 1] << 8) | (buffer[sampleOffset + 2] << 16)
      if (int24 & 0x800000) int24 |= ~0xFFFFFF
      pcmData[i] = int24 / 8388608
    } else if (bitsPerSample === 32) {
      if (audioFormat === 1) {
        const int32 = buffer.readInt32LE(sampleOffset)
        pcmData[i] = int32 / 2147483648
      } else {
        const float32 = buffer.readFloatLE(sampleOffset)
        pcmData[i] = float32
      }
    }
  }

  if (numChannels === 2) {
    const monoData = new Float32Array(pcmData.length / 2)
    for (let i = 0; i < monoData.length; i++) {
      monoData[i] = (pcmData[i * 2] + pcmData[i * 2 + 1]) / 2
    }
    return {
      audioBuffer: monoData,
      sampleRate,
      duration: monoData.length / sampleRate
    }
  }

  return {
    audioBuffer: pcmData,
    sampleRate,
    duration: pcmData.length / sampleRate
  }
}

export async function cleanup(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      await unlink(filePath)
    }
  } catch (error) {
    console.warn(`Cleanup warning: ${error.message}`)
  }
}

export default {
  decodeAudioFile,
  cleanup
}
