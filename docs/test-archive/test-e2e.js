import fs from 'fs'
import FormData from 'form-data'
import fetch from 'node-fetch'
import { generateMusicXml } from './src/services/musicXmlGenerator.js'

const BACKEND_URL = 'http://localhost:3001'
const TEST_FILE = './test-audio.wav'
const TEST_KEY = 'C'

async function testEndToEnd() {
  console.log('\n🎵 PHASE 2 STEP 3 - END-TO-END TEST')
  console.log('=' .repeat(50))

  if (!fs.existsSync(TEST_FILE)) {
    console.error('❌ Test audio file not found:', TEST_FILE)
    process.exit(1)
  }

  try {
    console.log('\n[1/4] Health Check...')
    const healthResponse = await fetch(`${BACKEND_URL}/api/health`)
    if (!healthResponse.ok) {
      throw new Error('Health check failed')
    }
    console.log('✅ Backend is healthy')

    console.log('\n[2/4] Upload & Transcribe Audio...')
    const fileStream = fs.createReadStream(TEST_FILE)
    const form = new FormData()
    form.append('file', fileStream)
    form.append('key', TEST_KEY)

    const transcribeResponse = await fetch(`${BACKEND_URL}/api/transcribe`, {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    })

    if (!transcribeResponse.ok) {
      const errorText = await transcribeResponse.text()
      throw new Error(`Transcription failed: ${errorText}`)
    }

    const transcriptionResult = await transcribeResponse.json()

    if (!transcriptionResult.success) {
      throw new Error(transcriptionResult.error || 'Unknown transcription error')
    }

    const notes = transcriptionResult.notes
    console.log(`✅ Transcription complete: ${notes.length} notes extracted`)
    console.log(`   Duration: ${transcriptionResult.metadata.duration}s`)
    console.log(`   Confidence: ${transcriptionResult.metadata.confidence}`)

    console.log('\n[3/4] Generate MusicXML Score...')
    const fileName = TEST_FILE.split('/').pop().replace('.wav', '')

    const musicXml = generateMusicXml(notes, TEST_KEY, fileName)

    if (!musicXml || musicXml.length === 0) {
      throw new Error('MusicXML generation returned empty result')
    }

    const outputFile = './test-score.musicxml'
    fs.writeFileSync(outputFile, musicXml)
    console.log(`✅ MusicXML generated: ${outputFile}`)
    console.log(`   Size: ${(musicXml.length / 1024).toFixed(2)} KB`)

    console.log('\n[4/4] Validate MusicXML...')
    if (!musicXml.includes('<?xml version') || !musicXml.includes('</score-partwise>')) {
      throw new Error('Invalid MusicXML format')
    }

    if (!musicXml.includes(`<work-title>${fileName}</work-title>`)) {
      throw new Error('MusicXML missing work-title')
    }

    const noteCount = (musicXml.match(/<note>/g) || []).length
    console.log(`✅ MusicXML is valid`)
    console.log(`   Title: ${fileName}`)
    console.log(`   Notes in score: ${noteCount}`)

    console.log('\n' + '='.repeat(50))
    console.log('✅ END-TO-END TEST PASSED!')
    console.log('=' .repeat(50))

    console.log('\n📊 Summary:')
    console.log(`  Input: ${TEST_FILE}`)
    console.log(`  Detected Key: ${TEST_KEY}`)
    console.log(`  Notes Transcribed: ${notes.length}`)
    console.log(`  Output: ${outputFile}`)
    console.log(`\n💾 MusicXML file ready for import into MuseScore 4!\n`)

    process.exit(0)
  } catch (error) {
    console.error('\n❌ Test failed:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

testEndToEnd()
