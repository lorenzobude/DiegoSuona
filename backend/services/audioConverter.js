import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from 'ffmpeg-static'
import path from 'path'

if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath)
}

export function convertToWav(inputPath, sampleRate) {
  const outputPath = path.join(path.dirname(inputPath), `${Date.now()}_converted.wav`)

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .toFormat('wav')
      .audioCodec('pcm_s16le')
      .audioFrequency(sampleRate)
      .audioChannels(1)
      .on('end', () => resolve(outputPath))
      .on('error', error => reject(new Error(`Audio conversion failed: ${error.message}`)))
      .save(outputPath)
  })
}
