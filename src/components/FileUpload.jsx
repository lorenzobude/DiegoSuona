import { useRef } from 'react'
import { validateMp3File, formatFileSize } from '../services/fileValidator'

export default function FileUpload({ state, onFileSelected, onAnalyzeStart }) {
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

  const handleAnalyzeClick = () => {
    if (state.audioFile) {
      onAnalyzeStart()
    }
  }

  return (
    <section>
      <h2>Fase A — Caricamento MP3</h2>

      <div>
        <label htmlFor="file-input">Seleziona file MP3:</label>
        <input
          id="file-input"
          ref={inputRef}
          type="file"
          accept=".mp3,audio/mpeg"
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
        onClick={handleAnalyzeClick}
        disabled={!state.audioFile || state.loading}
      >
        {state.loading ? 'Analisi in corso...' : 'Analizza'}
      </button>

      <hr />
    </section>
  )
}
