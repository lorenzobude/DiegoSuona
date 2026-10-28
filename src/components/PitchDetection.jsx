export default function PitchDetection({ state, isActive }) {
  if (!isActive) {
    return (
      <section style={{ opacity: 0.5 }}>
        <h2>Fase B — Riconoscimento Tonalità</h2>
        <p>Carica un file MP3 e avvia l'analisi per iniziare.</p>
        <hr />
      </section>
    )
  }

  return (
    <section>
      <h2>Fase B — Riconoscimento Tonalità</h2>

      {state.loading && (
        <div>
          <p>⏳ Analisi in corso...</p>
          <p>Attendere alcuni secondi...</p>
        </div>
      )}

      {state.detectedKey && !state.loading && (
        <div>
          <p>✓ Tonalità rilevata: <strong>{state.detectedKey}</strong></p>
          <p>Procedi alla fase successiva per confermare o modificare la tonalità.</p>
        </div>
      )}

      {!state.detectedKey && !state.loading && (
        <div>
          <p>⚠ Impossibile rilevare la tonalità automaticamente.</p>
          <p>Procedi alla fase successiva per selezionare manualmente una tonalità.</p>
        </div>
      )}

      <hr />
    </section>
  )
}
