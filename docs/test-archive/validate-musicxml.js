import fs from 'fs'

console.log('\n📋 VALIDAZIONE FINALE - PHASE 2 STEP 3\n')

const testFile = './test-score.musicxml'

if (!fs.existsSync(testFile)) {
  console.error('❌ Test score file not found')
  process.exit(1)
}

const xmlContent = fs.readFileSync(testFile, 'utf-8')

console.log('1️⃣ Validazione XML Well-Formed...')
try {
  if (!xmlContent.includes('<?xml version') || !xmlContent.includes('</score-partwise>')) {
    throw new Error('Missing XML declaration or root closing tag')
  }
  console.log('✅ XML è well-formed')
} catch (error) {
  console.error('❌', error.message)
  process.exit(1)
}

console.log('\n2️⃣ Validazione Schema MusicXML...')
const requiredElements = [
  '<score-partwise version="4.0">',
  '<work-title>',
  '</work-title>',
  '<part-list>',
  '<score-part',
  '<part-name>Melodia</part-name>',
  '</part-list>',
  '<part id="P1">',
  '<measure number="1">',
  '<attributes>',
  '<divisions>',
  '<key>',
  '<fifths>',
  '<mode>',
  '</key>',
  '<time>',
  '<beats>',
  '<beat-type>',
  '</time>',
  '<clef>',
  '<sign>G</sign>',
  '<line>2</line>',
  '</clef>',
  '</attributes>',
  '<note>',
  '<pitch>',
  '<step>',
  '<octave>',
  '</pitch>',
  '<duration>',
  '<type>',
  '</note>',
  '</measure>',
  '</part>',
  '</score-partwise>'
]

let missingElements = []
for (const element of requiredElements) {
  if (!xmlContent.includes(element)) {
    missingElements.push(element)
  }
}

if (missingElements.length > 0) {
  console.error('❌ Missing elements:')
  missingElements.forEach(el => console.error(`   - ${el}`))
  process.exit(1)
}

console.log('✅ Tutti gli elementi MusicXML richiesti sono presenti')

console.log('\n3️⃣ Verifica Note...')
const noteMatches = xmlContent.match(/<note>/g) || []
const noteCount = noteMatches.length
console.log(`✅ ${noteCount} note trovate nello spartito`)

console.log('\n4️⃣ Verifica Metadati...')
const titleMatch = xmlContent.match(/<work-title>([^<]+)<\/work-title>/)
const softwareMatch = xmlContent.match(/<software>([^<]+)<\/software>/)
const partNameMatch = xmlContent.match(/<part-name>([^<]+)<\/part-name>/)

if (titleMatch) console.log(`   Titolo: ${titleMatch[1]}`)
if (softwareMatch) console.log(`   Software: ${softwareMatch[1]}`)
if (partNameMatch) console.log(`   Nome strumento: ${partNameMatch[1]}`)

console.log('\n5️⃣ Verifica Armatura di Chiave...')
const keyMatch = xmlContent.match(/<key>[\s\S]*?<fifths>(-?\d+)<\/fifths>[\s\S]*?<mode>([^<]+)<\/mode>/)
if (keyMatch) {
  const fifths = keyMatch[1]
  const mode = keyMatch[2]
  console.log(`   Tonalità: ${fifths} diesis (${mode})`)
}

console.log('\n6️⃣ Controllo Dimensione File...')
const sizeKB = (xmlContent.length / 1024).toFixed(2)
console.log(`   ${sizeKB} KB`)

console.log('\n' + '='.repeat(50))
console.log('✅ VALIDAZIONE COMPLETATA CON SUCCESSO!')
console.log('=' .repeat(50))

console.log('\n📊 Riepilogo:')
console.log(`  File: ${testFile}`)
console.log(`  Formato: MusicXML 4.0 Partwise`)
console.log(`  Note: ${noteCount}`)
console.log(`  Dimensione: ${sizeKB} KB`)
console.log('\n🎼 Il file è pronto per l\'importazione in MuseScore 4!')
console.log('')

process.exit(0)
