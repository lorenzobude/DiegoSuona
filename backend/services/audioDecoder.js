import fs from 'fs/promises'
import { convertToWav } from './audioConverter.js'

export async function decodeAudioFile(filePath, sampleRate) {
  const wavPath = await convertToWav(filePath, sampleRate)

  try {
    return parseWav(await fs.readFile(wavPath))
  } finally {
    await removeFile(wavPath)
  }
}

export async function removeFile(filePath) {
  try {
    await fs.unlink(filePath)
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.warn(`Cleanup warning: ${error.message}`)
    }
  }
}

function parseWav(buffer) {
  let offset = 12
  let sampleRate = 0

  while (offset + 8 <= buffer.length) {
    const chunkId = buffer.toString('ascii', offset, offset + 4)
    const chunkSize = buffer.readUInt32LE(offset + 4)
    const chunkStart = offset + 8

    if (chunkId === 'fmt ') {
      sampleRate = buffer.readUInt32LE(chunkStart + 4)
    } else if (chunkId === 'data') {
      const dataSize = Math.min(chunkSize, buffer.length - chunkStart)
      const audioBuffer = new Float32Array(Math.floor(dataSize / 2))

      for (let i = 0; i < audioBuffer.length; i++) {
        audioBuffer[i] = buffer.readInt16LE(chunkStart + i * 2) / 32768
      }

      return { audioBuffer, sampleRate }
    }

    offset = chunkStart + chunkSize + (chunkSize % 2)  }

  throw new Error('No audio data found in converted WAV file')
}
