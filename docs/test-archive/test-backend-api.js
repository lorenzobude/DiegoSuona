import fs from 'fs'
import FormData from 'form-data'
import fetch from 'node-fetch'

async function testBackendAPI() {
  const testFilePath = './test-audio.wav'
  const backendURL = 'http://localhost:3001'

  if (!fs.existsSync(testFilePath)) {
    console.error('❌ Test audio file not found:', testFilePath)
    process.exit(1)
  }

  console.log('📋 Test Plan:')
  console.log('1. Health check')
  console.log('2. Upload and transcribe test audio')
  console.log('3. Verify output format\n')

  try {
    console.log('🔍 [1/3] Testing health endpoint...')
    const healthResponse = await fetch(`${backendURL}/api/health`)
    const healthData = await healthResponse.json()
    console.log('✅ Health check passed:', healthData)

    console.log('\n🎵 [2/3] Uploading and transcribing test audio...')
    const fileStream = fs.createReadStream(testFilePath)
    const form = new FormData()
    form.append('file', fileStream)
    form.append('key', 'C')

    const transcribeResponse = await fetch(`${backendURL}/api/transcribe`, {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    })

    if (!transcribeResponse.ok) {
      const errorData = await transcribeResponse.json()
      console.error('❌ Transcription failed:', errorData)
      process.exit(1)
    }

    const result = await transcribeResponse.json()
    console.log('✅ Transcription completed')
    console.log('   Response:', {
      success: result.success,
      notesCount: result.notes?.length,
      metadata: result.metadata
    })

    console.log('\n📊 [3/3] Verifying output format...')

    if (!result.success) {
      console.error('❌ Result marked as failed')
      process.exit(1)
    }

    if (!Array.isArray(result.notes)) {
      console.error('❌ Notes is not an array:', typeof result.notes)
      process.exit(1)
    }

    if (result.notes.length === 0) {
      console.warn('⚠️  No notes extracted (might be silence or low energy)')
    } else {
      const firstNote = result.notes[0]
      console.log('   First note:', firstNote)

      const requiredFields = ['pitch', 'duration', 'time', 'confidence']
      for (const field of requiredFields) {
        if (!(field in firstNote)) {
          console.error(`❌ Missing required field: ${field}`)
          process.exit(1)
        }
      }
      console.log('✅ All required fields present')
    }

    console.log('\n✅ All tests passed!')
    console.log('\nSample notes (first 3):')
    result.notes.slice(0, 3).forEach((note, idx) => {
      console.log(`   ${idx + 1}. ${note.pitch} ${note.duration} @ ${note.time}s (confidence: ${note.confidence})`)
    })

    process.exit(0)
  } catch (error) {
    console.error('❌ Test failed with error:', error.message)
    process.exit(1)
  }
}

testBackendAPI()
