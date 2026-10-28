import { useAppState } from './hooks/useAppState'
import FileUpload from './components/FileUpload'
import ScoreExport from './components/ScoreExport'
import { transcribeAudio } from './services/transcriptionService'
import { generateMusicXml } from './services/musicXmlGenerator'

export default function App() {
  const appState = useAppState()

  const handleFileSelected = (file, error) => {
    if (error) {
      appState.setError({ message: error })
    } else {
      appState.setAudioFile(file)
    }
  }

  const handleTranscriptionStart = async () => {
    if (!appState.state.audioFile || appState.state.loading) return

    appState.setPhase('transcribing')
    appState.setLoading(true)

    try {
      const transcriptionResult = await transcribeAudio(appState.state.audioFile)

      if (transcriptionResult.success) {
        appState.setPhase('exporting')

        const title = appState.state.fileName.replace(/\.[^.]+$/, '')
        const musicXml = generateMusicXml(transcriptionResult.notes, title, transcriptionResult.metadata?.tempo)

        appState.setMusicXmlData(musicXml)
      } else {
        appState.setError({
          message: transcriptionResult.error || 'Errore durante la trascrizione'
        })
      }
    } catch (error) {
      appState.setError({
        message: `Errore durante la trascrizione: ${error.message}`
      })
    } finally {
      appState.setLoading(false)
    }
  }

  const handleReset = () => {
    appState.reset()
  }

  const isPhaseActive = (phase) => {
    const phases = ['upload', 'transcribing', 'exporting', 'done']
    const currentIndex = phases.indexOf(appState.state.currentPhase)
    const phaseIndex = phases.indexOf(phase)
    return currentIndex >= phaseIndex
  }

  if (appState.state.currentPhase === 'error') {
    return (
      <main>
        <h1>Audio → Spartito MuseScore</h1>
        <section style={{ color: 'red' }}>
          <h2>Errore</h2>
          <p>{appState.state.error?.message}</p>
          <button onClick={handleReset}>
            ← Torna all'inizio
          </button>
        </section>
      </main>
    )
  }

  return (
    <main>
      <h1>Audio → Spartito MuseScore</h1>

      <FileUpload
        state={appState.state}
        onFileSelected={handleFileSelected}
        onTranscriptionStart={handleTranscriptionStart}
      />

      <ScoreExport
        state={appState.state}
        isActive={isPhaseActive('exporting')}
        onReset={handleReset}
      />
    </main>
  )
}
