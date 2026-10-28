function durationToMusicXmlType(duration) {
  const typeMap = {
    'whole': 'whole',
    'half': 'half',
    'quarter': 'quarter',
    'eighth': 'eighth',
    'sixteenth': 'sixteenth'
  }
  return typeMap[duration] || 'quarter'
}

function pitchToMusicXml(pitchString) {
  const noteName = pitchString.charAt(0).toUpperCase()
  const octave = parseInt(pitchString.slice(1))

  const noteNameMap = {
    'C': 'C', 'D': 'D', 'E': 'E', 'F': 'F',
    'G': 'G', 'A': 'A', 'B': 'B'
  }

  return {
    step: noteNameMap[noteName] || 'C',
    octave: octave,
    alter: 0
  }
}

export function generateMusicXml(notes, key, title = 'Trascrizione MP3') {
  const measureNotes = []

  notes.forEach((note, index) => {
    const xmlPitch = pitchToMusicXml(note.pitch)
    const noteType = durationToMusicXmlType(note.duration)

    const durationMap = {
      'whole': 4,
      'half': 2,
      'quarter': 1,
      'eighth': 0.5,
      'sixteenth': 0.25
    }
    const duration = durationMap[note.duration] || 1

    measureNotes.push({
      pitch: xmlPitch,
      duration: duration,
      type: noteType
    })
  })

  const divisions = 4
  const measureLength = 4

  const measures = []
  let currentMeasure = []
  let measureDuration = 0

  measureNotes.forEach(note => {
    const noteDuration = (note.duration * divisions)

    if (measureDuration + noteDuration > measureLength * divisions) {
      if (currentMeasure.length > 0) {
        measures.push([...currentMeasure])
      }
      currentMeasure = [note]
      measureDuration = noteDuration
    } else {
      currentMeasure.push(note)
      measureDuration += noteDuration
    }
  })

  if (currentMeasure.length > 0) {
    measures.push(currentMeasure)
  }

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/schemas/musicxml.xsd">\n'
  xml += '<score-partwise version="4.0">\n'
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

  const keyMap = {
    'Do Maggiore': { fifths: 0, mode: 'major' },
    'Do# Maggiore': { fifths: 7, mode: 'major' },
    'Re Maggiore': { fifths: 2, mode: 'major' },
    'Mib Maggiore': { fifths: -5, mode: 'major' },
    'Mi Maggiore': { fifths: 4, mode: 'major' },
    'Fa Maggiore': { fifths: -1, mode: 'major' },
    'Fa# Maggiore': { fifths: 6, mode: 'major' },
    'Sol Maggiore': { fifths: 1, mode: 'major' },
    'Sol# Maggiore': { fifths: 8, mode: 'major' },
    'La Maggiore': { fifths: 3, mode: 'major' },
    'Sib Maggiore': { fifths: -2, mode: 'major' },
    'Si Maggiore': { fifths: 5, mode: 'major' },
    'La Minore': { fifths: 0, mode: 'minor' },
    'La# Minore': { fifths: 7, mode: 'minor' },
    'Si Minore': { fifths: 2, mode: 'minor' },
    'Do Minore': { fifths: -3, mode: 'minor' },
    'Do# Minore': { fifths: 4, mode: 'minor' },
    'Re Minore': { fifths: -1, mode: 'minor' },
    'Mib Minore': { fifths: -6, mode: 'minor' },
    'Mi Minore': { fifths: 1, mode: 'minor' },
    'Fa Minore': { fifths: -4, mode: 'minor' },
    'Fa# Minore': { fifths: 3, mode: 'minor' },
    'Sol Minore': { fifths: -2, mode: 'minor' },
    'Sol# Minore': { fifths: 5, mode: 'minor' }
  }

  const keyInfo = keyMap[key] || { fifths: 0, mode: 'major' }

  measures.forEach((measure, measureIndex) => {
    xml += `    <measure number="${measureIndex + 1}">\n`

    if (measureIndex === 0) {
      xml += '      <attributes>\n'
      xml += `        <divisions>${divisions}</divisions>\n`
      xml += '        <key>\n'
      xml += `          <fifths>${keyInfo.fifths}</fifths>\n`
      xml += `          <mode>${keyInfo.mode}</mode>\n`
      xml += '        </key>\n'
      xml += '        <time>\n'
      xml += '          <beats>4</beats>\n'
      xml += '          <beat-type>4</beat-type>\n'
      xml += '        </time>\n'
      xml += '        <clef>\n'
      xml += '          <sign>G</sign>\n'
      xml += '          <line>2</line>\n'
      xml += '        </clef>\n'
      xml += '      </attributes>\n'
    }

    measure.forEach(note => {
      xml += '      <note>\n'
      xml += '        <pitch>\n'
      xml += `          <step>${note.pitch.step}</step>\n`
      xml += `          <octave>${note.pitch.octave}</octave>\n`
      xml += '        </pitch>\n'
      xml += `        <duration>${note.duration * divisions}</duration>\n`
      xml += `        <type>${note.type}</type>\n`
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
