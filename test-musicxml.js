import assert from 'node:assert/strict'
import { generateMusicXml } from './src/services/musicXmlGenerator.js'

const testNotes = [
  { pitch: 'C4', start: 0, length: 4 },
  { pitch: 'D4', start: 4, length: 4 },
  { pitch: 'E4', start: 8, length: 4 },
  { pitch: 'F4', start: 12, length: 4 },
  { pitch: 'G4', start: 16, length: 8 },
  { pitch: 'A4', start: 28, length: 4 },
  { pitch: 'G4', start: 30 + 2, length: 12 },
  { pitch: 'F4', start: 44, length: 1 }
]

const xmlOutput = generateMusicXml(testNotes, 'TestScore', 96)

function measureDurations(xml) {
  return Array.from(xml.matchAll(/<measure number="\d+">([\s\S]*?)<\/measure>/g), measure =>
    Array.from(measure[1].matchAll(/<duration>(\d+)<\/duration>/g)).reduce((sum, match) => sum + Number(match[1]), 0)
  )
}

assert.equal(xmlOutput.includes('<key>'), false)
assert.match(xmlOutput, /partwise\.dtd/)
assert.match(xmlOutput, /<sound tempo="96"\/>/)
assert.ok(xmlOutput.includes('<type>16th</type>'))
assert.equal(xmlOutput.includes('sixteenth'), false)
assert.ok(measureDurations(xmlOutput).every(total => total === 16))
assert.equal(measureDurations(xmlOutput).length, 3)
assert.ok(xmlOutput.includes('<rest/>'))
assert.deepEqual(
  Array.from(xmlOutput.matchAll(/<step>([A-G])<\/step>/g), match => match[1]),
  ['C', 'D', 'E', 'F', 'G', 'A', 'G', 'F']
)

const tiedXml = generateMusicXml([{ pitch: 'La4', start: 12, length: 8 }])
assert.equal((tiedXml.match(/<tie type="start"\/>/g) || []).length, 1)
assert.equal((tiedXml.match(/<tie type="stop"\/>/g) || []).length, 1)
assert.ok(measureDurations(tiedXml).every(total => total === 16))

const italianXml = generateMusicXml([
  { pitch: 'La4', start: 0, length: 4 },
  { pitch: 'Do#4', start: 4, length: 4 },
  { pitch: 'Sib4', start: 8, length: 4 }
])

assert.match(italianXml, /<step>A<\/step>\s*<octave>4<\/octave>/)
assert.match(italianXml, /<step>C<\/step>\s*<alter>1<\/alter>\s*<octave>4<\/octave>/)
assert.match(italianXml, /<step>B<\/step>\s*<alter>-1<\/alter>\s*<octave>4<\/octave>/)

assert.throws(() => generateMusicXml([]))

console.log('MusicXML tests passed')
