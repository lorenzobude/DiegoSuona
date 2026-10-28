import { validateMp3File } from '../src/services/fileValidator'
import { generateMusicXml } from '../src/services/musicXmlGenerator'

console.log('=== TEST: Applicazione Audio → Spartito ===\n')

const testNotes = [
  { pitch: 'C4', start: 0, length: 4 },
  { pitch: 'D4', start: 4, length: 4 },
  { pitch: 'E4', start: 8, length: 8 }
]

const xmlOutput = generateMusicXml(testNotes, 'test')
console.log('\n✓ MusicXML generato:', xmlOutput.length, 'caratteri')
console.log('  Contiene <score-partwise>:', xmlOutput.includes('score-partwise'))
console.log('  Contiene <note>:', xmlOutput.includes('note'))
console.log('  Esclude l’armatura di chiave:', !xmlOutput.includes('<key>'))

console.log('\n=== TEST COMPLETATO ===')
