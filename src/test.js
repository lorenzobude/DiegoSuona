import { validateMp3File } from '../src/services/fileValidator'
import { ALL_KEYS, getKeyOptions } from '../src/services/keyDetectionService'
import { generateMusicXml } from '../src/services/musicXmlGenerator'

console.log('=== TEST: Applicazione MP3 → Spartito ===\n')

console.log('✓ Chiavi disponibili:', ALL_KEYS.length)
console.log('  Esempi:', ALL_KEYS.slice(0, 5).join(', '))

const testNotes = [
  { pitch: 'C4', duration: 'quarter', time: 0 },
  { pitch: 'D4', duration: 'quarter', time: 1 },
  { pitch: 'E4', duration: 'half', time: 2 }
]

const xmlOutput = generateMusicXml(testNotes, 'Do Maggiore', 'test')
console.log('\n✓ MusicXML generato:', xmlOutput.length, 'caratteri')
console.log('  Contiene <score-partwise>:', xmlOutput.includes('score-partwise'))
console.log('  Contiene <note>:', xmlOutput.includes('note'))
console.log('  Contiene <key>:', xmlOutput.includes('<key>'))

console.log('\n=== TEST COMPLETATO ===')
