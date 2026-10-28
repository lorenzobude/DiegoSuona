import fs from 'fs'

function generateTestTone() {
  const sampleRate = 44100
  const duration = 4
  const samples = sampleRate * duration

  const frequencies = [262, 294, 330, 349, 392, 440, 392]
  const noteDuration = duration / frequencies.length

  const buffer = Buffer.alloc(samples * 2)
  let index = 0

  for (let freqIdx = 0; freqIdx < frequencies.length; freqIdx++) {
    const freq = frequencies[freqIdx]
    const samplesPerNote = Math.floor(sampleRate * noteDuration)

    for (let i = 0; i < samplesPerNote; i++) {
      const t = i / sampleRate
      const value = Math.sin(2 * Math.PI * freq * t) * 0.3 * 32767

      buffer.writeInt16LE(Math.round(value), index)
      index += 2
    }
  }

  const wav = createWavFile(buffer, sampleRate, 1, 16)
  fs.writeFileSync('./test-audio.wav', wav)
  console.log('✓ Test audio WAV created: test-audio.wav')
}

function createWavFile(audioBuffer, sampleRate, channels, bitDepth) {
  const byteRate = sampleRate * channels * (bitDepth / 8)
  const blockAlign = channels * (bitDepth / 8)
  const subChunk2Size = audioBuffer.length

  const header = Buffer.alloc(44)

  header.write('RIFF', 0)
  header.writeUInt32LE(36 + subChunk2Size, 4)
  header.write('WAVE', 8)

  header.write('fmt ', 12)
  header.writeUInt32LE(16, 16)
  header.writeUInt16LE(1, 20)
  header.writeUInt16LE(channels, 22)
  header.writeUInt32LE(sampleRate, 24)
  header.writeUInt32LE(byteRate, 28)
  header.writeUInt16LE(blockAlign, 32)
  header.writeUInt16LE(bitDepth, 34)

  header.write('data', 36)
  header.writeUInt32LE(subChunk2Size, 40)

  return Buffer.concat([header, audioBuffer])
}

generateTestTone()
