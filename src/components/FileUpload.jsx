import { useRef } from 'react'
import { validateMp3File, formatFileSize } from '../services/fileValidator'

export default function FileUpload({ state, onFileSelected, onTranscriptionStart }) {
  const inputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const validation = validateMp3File(file)
    if (!validation.valid) {
      onFileSelected(null, validation.message)
      inputRef.current.value = ''
      return
    }

    onFileSelected(file, null)
  }

  const handleTranscribeClick = () => {
    if (state.audioFile) {
      onTranscriptionStart()
    }
  }

  return (
    <section>
      <h2>Caricamento audio</h2>
      <p>
        La trascrizione è sperimentale: la melodia è la voce più alta riconosciuta,
        quindi non separa gli strumenti né garantisce di identificare la melodia principale.
      </p>

      <div>
        <label htmlFor="file-input">Seleziona file MP3 o WAV:</label>
        <input
          id="file-input"
          ref={inputRef}
          type="file"
          accept=".mp3,.wav,audio/mpeg,audio/wav"
          onChange={handleFileChange}
          disabled={state.loading}
        />
      </div>

      {state.fileName && (
        <div>
          <p>File selezionato: <strong>{state.fileName}</strong></p>
          <p>Dimensione: {formatFileSize(state.fileSize)}</p>
        </div>
      )}

      {state.error && state.currentPhase === 'upload' && (
        <div style={{ color: 'red' }}>
          <p>Errore: {state.error.message}</p>
        </div>
      )}

      <button
        onClick={handleTranscribeClick}
        disabled={!state.audioFile || state.loading}
      >
        {state.loading ? 'Generazione spartito in corso...' : 'Genera spartito'}
      </button>

      {state.error && state.currentPhase === 'error' && (
        <p role="alert">Errore: {state.error.message}</p>
      )}

      <hr />
    </section>
  )
}
