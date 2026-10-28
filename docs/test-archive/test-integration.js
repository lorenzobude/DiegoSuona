import fs from 'fs'
import FormData from 'form-data'
import fetch from 'node-fetch'

const TEST_FILE = './test-audio.wav'
const BACKEND_URL = 'http://localhost:3001'

async function testFrontendBackendIntegration() {
  console.log('\n🧪 TEST INTEGRAZIONE FRONTEND-BACKEND\n')
  console.log('=' .repeat(50))

  if (!fs.existsSync(TEST_FILE)) {
    console.error('❌ File di test non trovato')
    process.exit(1)
  }

  try {
    console.log('📤 Simulazione caricamento file dal browser...\n')

    const fileStream = fs.createReadStream(TEST_FILE)
    const form = new FormData()

    form.append('file', fileStream, { filename: 'test-audio.wav' })
    form.append('key', 'C')

    console.log('   Nome file: test-audio.wav')
    console.log('   Tonalità: C Maggiore')
    console.log('   Destinazione: POST http://localhost:3001/api/transcribe\n')

    const response = await fetch(`${BACKEND_URL}/api/transcribe`, {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Transcription failed')
    }

    console.log('✅ Backend ha processato il file con successo!\n')

    console.log('📊 Risultati Trascrizione:')
    console.log(`   Note estratte: ${result.notes.length}`)
    console.log(`   Durata audio: ${result.metadata.duration}s`)
    console.log(`   Sample rate: ${result.metadata.sampleRate}Hz`)
    console.log(`   Confidence: ${result.metadata.confidence}`)

    console.log('\n🎵 Prime 5 note:')
    result.notes.slice(0, 5).forEach((note, idx) => {
      console.log(`   ${idx + 1}. ${note.pitch} (${note.duration})`)
    })

    console.log('\n' + '='.repeat(50))
    console.log('✅ TEST INTEGRAZIONE PASSATO!\n')
    console.log('Prossimi step:')
    console.log('1. Apri http://localhost:5173 nel browser')
    console.log('2. Carica un file MP3/WAV')
    console.log('3. Seleziona la tonalità')
    console.log('4. Genera lo spartito')
    console.log('5. Scarica il file MusicXML')
    console.log('6. Importa in MuseScore 4\n')

    process.exit(0)
  } catch (error) {
    console.error('❌ Test fallito:', error.message)
    process.exit(1)
  }
}

testFrontendBackendIntegration()
