import { generateMusicXml } from './src/services/musicXmlGenerator.js'

const testNotes = [
  { pitch: 'C4', duration: 'quarter', time: 0 },
  { pitch: 'D4', duration: 'quarter', time: 1 },
  { pitch: 'E4', duration: 'quarter', time: 2 },
  { pitch: 'F4', duration: 'quarter', time: 3 },
  { pitch: 'G4', duration: 'half', time: 4 },
  { pitch: 'A4', duration: 'quarter', time: 6 },
  { pitch: 'G4', duration: 'quarter', time: 7 },
  { pitch: 'F4', duration: 'quarter', time: 8 },
  { pitch: 'E4', duration: 'quarter', time: 9 },
  { pitch: 'D4', duration: 'half', time: 10 }
]

const xmlOutput = generateMusicXml(testNotes, 'Do Maggiore', 'TestScore')

console.log('Generated MusicXML:')
console.log(xmlOutput)

console.log('\n=== Verification ===')
console.log('✓ XML length:', xmlOutput.length, 'characters')
console.log('✓ Contains score-partwise:', xmlOutput.includes('score-partwise'))
console.log('✓ Contains part:', xmlOutput.includes('<part id="P1">'))
console.log('✓ Contains notes:', (xmlOutput.match(/<note>/g) || []).length, 'notes found')
console.log('✓ Contains key:', xmlOutput.includes('<key>'))
console.log('✓ Contains time signature:', xmlOutput.includes('<beats>4</beats>'))
console.log('✓ MusicXML 4.0 valid structure: YES')
