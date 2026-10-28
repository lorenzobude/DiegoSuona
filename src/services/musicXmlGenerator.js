function escapeXml(text) {
  if (!text) return ''
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function pitchToMusicXml(pitchString) {
  const pitchMap = {
    C: { step: 'C', alter: 0 },
    'C#': { step: 'C', alter: 1 },
    Db: { step: 'D', alter: -1 },
    D: { step: 'D', alter: 0 },
    'D#': { step: 'D', alter: 1 },
    Eb: { step: 'E', alter: -1 },
    E: { step: 'E', alter: 0 },
    'E#': { step: 'E', alter: 1 },
    F: { step: 'F', alter: 0 },
    'F#': { step: 'F', alter: 1 },
    Gb: { step: 'G', alter: -1 },
    G: { step: 'G', alter: 0 },
    'G#': { step: 'G', alter: 1 },
    Ab: { step: 'A', alter: -1 },
    A: { step: 'A', alter: 0 },
    'A#': { step: 'A', alter: 1 },
    Bb: { step: 'B', alter: -1 },
    B: { step: 'B', alter: 0 },
    'B#': { step: 'B', alter: 1 },
    Do: { step: 'C', alter: 0 },
    'Do#': { step: 'C', alter: 1 },
    Dob: { step: 'C', alter: -1 },
    Re: { step: 'D', alter: 0 },
    'Re#': { step: 'D', alter: 1 },
    Reb: { step: 'D', alter: -1 },
    Mi: { step: 'E', alter: 0 },
    'Mi#': { step: 'E', alter: 1 },
    Mib: { step: 'E', alter: -1 },
    Fa: { step: 'F', alter: 0 },
    'Fa#': { step: 'F', alter: 1 },
    Fab: { step: 'F', alter: -1 },
    Sol: { step: 'G', alter: 0 },
    'Sol#': { step: 'G', alter: 1 },
    Solb: { step: 'G', alter: -1 },
    La: { step: 'A', alter: 0 },
    'La#': { step: 'A', alter: 1 },
    Lab: { step: 'A', alter: -1 },
    Si: { step: 'B', alter: 0 },
    'Si#': { step: 'B', alter: 1 },
    Sib: { step: 'B', alter: -1 }
  }

  const match = String(pitchString).match(/^([A-G](?:#|b)?|Do[#b]?|Re[#b]?|Mi[#b]?|Fa[#b]?|Sol[#b]?|La[#b]?|Si[#b]?)(-?\d+)?$/)
  if (!match) {
    throw new Error(`Altezza della nota non valida: ${pitchString}`)
  }

  const pitch = pitchMap[match[1]]
  if (!pitch) {
    throw new Error(`Altezza della nota non supportata: ${pitchString}`)
  }

  return {
    ...pitch,
    octave: match[2] ? Number(match[2]) : 4
  }
}

const LENGTH_TYPES = [
  { length: 16, type: 'whole', dots: 0 },
  { length: 12, type: 'half', dots: 1 },
  { length: 8, type: 'half', dots: 0 },
  { length: 6, type: 'quarter', dots: 1 },
  { length: 4, type: 'quarter', dots: 0 },
  { length: 3, type: 'eighth', dots: 1 },
  { length: 2, type: 'eighth', dots: 0 },
  { length: 1, type: '16th', dots: 0 }
]

const STEPS_PER_MEASURE = 16

function splitLength(length) {
  const pieces = []
  let remaining = length

  while (remaining > 0) {
    const piece = LENGTH_TYPES.find(candidate => candidate.length <= remaining)
    pieces.push(piece)
    remaining -= piece.length
  }

  return pieces
}

function buildMeasures(notes) {
  const measures = []
  let nextNoteId = 0

  const addEvent = (position, length, pitch) => {
    const noteId = nextNoteId++
    let cursor = position
    let remaining = length

    while (remaining > 0) {
      const measureIndex = Math.floor(cursor / STEPS_PER_MEASURE)
      const room = (measureIndex + 1) * STEPS_PER_MEASURE - cursor
      const chunk = Math.min(remaining, room)

      while (measures.length <= measureIndex) measures.push([])

      splitLength(chunk).forEach(piece => {
        measures[measureIndex].push({ pitch, piece, noteId })
      })

      cursor += chunk
      remaining -= chunk
    }
  }

  let position = 0

  notes.forEach(note => {
    if (note.start > position) {
      addEvent(position, note.start - position, null)
    }
    addEvent(note.start, note.length, pitchToMusicXml(note.pitch))
    position = note.start + note.length
  })

  const tail = position % STEPS_PER_MEASURE
  if (tail > 0) addEvent(position, STEPS_PER_MEASURE - tail, null)

  return measures
}

function markTies(measures) {
  const events = measures.flat()

  events.forEach((event, index) => {
    const next = events[index + 1]
    event.tieStart = Boolean(event.pitch && next && next.noteId === event.noteId)
    event.tieStop = Boolean(event.pitch && index > 0 && events[index - 1].noteId === event.noteId)
  })
}

export function generateMusicXml(notes, title = 'Trascrizione audio', tempo = 100) {
  if (!Array.isArray(notes) || notes.length === 0) {
    throw new Error('Nessuna nota da esportare')
  }

  const measures = buildMeasures(notes)
  markTies(measures)
  const divisions = 4

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">\n'
  xml += '<score-partwise version="4.0">\n'
  xml += '  <work>\n'
  xml += `    <work-title>${escapeXml(title)}</work-title>\n`
  xml += '  </work>\n'
  xml += '  <identification>\n'
  xml += '    <encoding>\n'
  xml += '      <software>MP3 to Score Converter</software>\n'
  xml += '    </encoding>\n'
  xml += '  </identification>\n'
  xml += '  <part-list>\n'
  xml += '    <score-part id="P1">\n'
  xml += '      <part-name>Melodia</part-name>\n'
  xml += '    </score-part>\n'
  xml += '  </part-list>\n'
  xml += '  <part id="P1">\n'

  measures.forEach((measure, measureIndex) => {
    xml += `    <measure number="${measureIndex + 1}">\n`

    if (measureIndex === 0) {
      xml += '      <attributes>\n'
      xml += `        <divisions>${divisions}</divisions>\n`
      xml += '        <time>\n'
      xml += '          <beats>4</beats>\n'
      xml += '          <beat-type>4</beat-type>\n'
      xml += '        </time>\n'
      xml += '        <clef>\n'
      xml += '          <sign>G</sign>\n'
      xml += '          <line>2</line>\n'
      xml += '        </clef>\n'
      xml += '      </attributes>\n'
      xml += '      <direction placement="above">\n'
      xml += '        <direction-type>\n'
      xml += '          <metronome>\n'
      xml += '            <beat-unit>quarter</beat-unit>\n'
      xml += `            <per-minute>${Math.round(tempo)}</per-minute>\n`
      xml += '          </metronome>\n'
      xml += '        </direction-type>\n'
      xml += `        <sound tempo="${Math.round(tempo)}"/>\n`
      xml += '      </direction>\n'
    }

    measure.forEach(event => {
      const { piece, pitch } = event
      xml += '      <note>\n'
      if (pitch) {
        xml += '        <pitch>\n'
        xml += `          <step>${pitch.step}</step>\n`
        if (pitch.alter !== 0) {
          xml += `          <alter>${pitch.alter}</alter>\n`
        }
        xml += `          <octave>${pitch.octave}</octave>\n`
        xml += '        </pitch>\n'
      } else {
        xml += '        <rest/>\n'
      }
      xml += `        <duration>${piece.length}</duration>\n`
      if (event.tieStop) xml += '        <tie type="stop"/>\n'
      if (event.tieStart) xml += '        <tie type="start"/>\n'
      xml += `        <type>${piece.type}</type>\n`
      if (piece.dots) xml += '        <dot/>\n'
      if (event.tieStop || event.tieStart) {
        xml += '        <notations>\n'
        if (event.tieStop) xml += '          <tied type="stop"/>\n'
        if (event.tieStart) xml += '          <tied type="start"/>\n'
        xml += '        </notations>\n'
      }
      xml += '      </note>\n'
    })

    xml += '    </measure>\n'
  })

  xml += '  </part>\n'
  xml += '</score-partwise>'

  return xml
}

export function downloadMusicXml(xmlContent, fileName = 'spartito.musicxml') {
  const blob = new Blob([xmlContent], { type: 'application/xml' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
