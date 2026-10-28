export async function generateDemoTranscription(key) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const demoNotes = [
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

      resolve({
        success: true,
        notes: demoNotes,
        isDemo: true,
        message: 'Nota: questa è una trascrizione simulata per il testing del flusso. Non è una trascrizione reale del file MP3 caricato.'
      })
    }, 2000)
  })
}

export async function transcribeAudio(arrayBuffer, key) {
  console.log('Modalità demo: generazione trascrizione fittizia per la tonalità', key)

  return generateDemoTranscription(key)
}
