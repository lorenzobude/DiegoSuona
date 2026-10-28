import { useState } from 'react'
import { ALL_KEYS } from '../services/keyDetectionService'

export default function KeyConfirmation({ state, isActive, onKeyConfirmed }) {
  const [selectedKey, setSelectedKey] = useState(state.detectedKey || '')

  const handleConfirm = () => {
    if (selectedKey) {
      onKeyConfirmed(selectedKey)
    }
  }

  if (!isActive) {
    return (
      <section style={{ opacity: 0.5 }}>
        <h2>Fase C — Conferma Tonalità</h2>
        <p>Completa l'analisi della tonalità per procedere.</p>
        <hr />
      </section>
    )
  }

  return (
    <section>
      <h2>Fase C — Conferma Tonalità</h2>

      <div>
        <label htmlFor="key-select">Seleziona tonalità:</label>
        <select
          id="key-select"
          value={selectedKey}
          onChange={(e) => setSelectedKey(e.target.value)}
          disabled={state.loading}
        >
          <option value="">Scegli una tonalità...</option>
          {ALL_KEYS.map(key => (
            <option key={key} value={key}>{key}</option>
          ))}
        </select>
      </div>

      {state.detectedKey && (
        <p>Tonalità rilevata: <strong>{state.detectedKey}</strong></p>
      )}

      <button
        onClick={handleConfirm}
        disabled={!selectedKey || state.loading}
      >
        {state.loading ? 'Elaborazione...' : 'Conferma Tonalità'}
      </button>

      <hr />
    </section>
  )
}
