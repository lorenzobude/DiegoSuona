import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from 'ffmpeg-static'
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath)
}

const unlink = promisify(fs.unlink)

export async function convertMP3toWAV(mp3FilePath, sampleRate = 44100) {
  return new Promise((resolve, reject) => {
    const outputDir = path.dirname(mp3FilePath)
    const outputPath = path.join(outputDir, `${Date.now()}_converted.wav`)

    console.log(`[MP3Converter] Converting: ${mp3FilePath} → ${outputPath}`)

    ffmpeg(mp3FilePath)
      .toFormat('wav')
      .audioCodec('pcm_s16le')
      .audioFrequency(sampleRate)
      .audioChannels(1)
      .on('end', () => {
        console.log(`[MP3Converter] Conversion successful: ${outputPath}`)
        resolve(outputPath)
      })
      .on('error', (err) => {
        console.error(`[MP3Converter] Conversion error: ${err.message}`)
        reject(new Error(`MP3 conversion failed: ${err.message}`))
      })
      .save(outputPath)
  })
}

export async function cleanupWAV(wavFilePath) {
  try {
    if (fs.existsSync(wavFilePath)) {
      await unlink(wavFilePath)
      console.log(`[MP3Converter] Cleaned up: ${wavFilePath}`)
    }
  } catch (error) {
    console.warn(`[MP3Converter] Cleanup warning: ${error.message}`)
  }
}

export default {
  convertMP3toWAV,
  cleanupWAV
}
