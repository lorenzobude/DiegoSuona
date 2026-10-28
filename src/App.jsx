import { useRef } from 'react'
import { useAppState } from './hooks/useAppState'
import FileUpload from './components/FileUpload'
import PitchDetection from './components/PitchDetection'
import KeyConfirmation from './components/KeyConfirmation'
import TranscriptionStart from './components/TranscriptionStart'
import ScoreExport from './components/ScoreExport'
import { detectKey } from './services/keyDetectionService'
import { transcribeAudio } from './services/transcriptionService'
import { generateMusicXml } from './services/musicXmlGenerator'

export default function App() {
  const appState = useAppState()
  const fileReaderRef = useRef(null)

  const handleFileSelected = (file, error) => {
    if (error) {
      appState.setError({ message: error })
    } else {
      appState.setAudioFile(file)
    }
  }

  const handleAnalyzeStart = async () => {
    if (!appState.state.audioFile) return

    appState.setPhase('analyzing')
    appState.setLoading(true)

    try {
      const arrayBuffer = await appState.state.audioFile.arrayBuffer()
      const keyResult = await detectKey(arrayBuffer)

      if (keyResult.success && keyResult.key) {
        appState.setDetectedKey(keyResult.key)
      }

      appState.setPhase('keySelection')
      appState.setLoading(false)
    } catch (error) {
      appState.setError({
        message: `Errore durante l'analisi: ${error.message}`
      })
    }
  }

  const handleKeyConfirmed = async (key) => {
    appState.setConfirmedKey(key)
  }

  const handleTranscriptionStart = async () => {
    if (!appState.state.audioFile || !appState.state.confirmedKey) return

    appState.setPhase('transcribing')
    appState.setLoading(true)

    try {
      const arrayBuffer = await appState.state.audioFile.arrayBuffer()
      const transcriptionResult = await transcribeAudio(arrayBuffer, appState.state.confirmedKey)

      if (transcriptionResult.success) {
        appState.setTranscription(transcriptionResult.notes)
        appState.setPhase('exporting')
        appState.setLoading(true)

        const musicXml = generateMusicXml(
          transcriptionResult.notes,
          appState.state.confirmedKey,
          appState.state.fileName.replace('.mp3', '')
        )

        appState.setMusicXmlData(musicXml)
        appState.setLoading(false)
      } else {
        appState.setError({
          message: 'Errore durante la trascrizione'
        })
      }
    } catch (error) {
      appState.setError({
        message: `Errore durante la trascrizione: ${error.message}`
      })
    }
  }

  const handleReset = () => {
    appState.reset()
  }

  const isPhaseActive = (phase) => {
    const phases = ['upload', 'analyzing', 'keySelection', 'transcribing', 'exporting', 'done']
    const currentIndex = phases.indexOf(appState.state.currentPhase)
    const phaseIndex = phases.indexOf(phase)
    return currentIndex >= phaseIndex
  }

  if (appState.state.currentPhase === 'error') {
    return (
      <main>
        <h1>MP3 → Spartito MuseScore</h1>
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
      <h1>MP3 → Spartito MuseScore</h1>

      <FileUpload
        state={appState.state}
        onFileSelected={handleFileSelected}
        onAnalyzeStart={handleAnalyzeStart}
      />

      <PitchDetection
        state={appState.state}
        isActive={isPhaseActive('analyzing')}
      />

      <KeyConfirmation
        state={appState.state}
        isActive={isPhaseActive('keySelection')}
        onKeyConfirmed={handleKeyConfirmed}
      />

      <TranscriptionStart
        state={appState.state}
        isActive={isPhaseActive('transcribing')}
        onTranscriptionStart={handleTranscriptionStart}
      />

      <ScoreExport
        state={appState.state}
        isActive={isPhaseActive('exporting')}
        onExportStart={() => {}}
        onReset={handleReset}
      />
    </main>
  )
}
