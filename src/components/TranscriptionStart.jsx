export default function TranscriptionStart({ state, isActive, onTranscriptionStart }) {
  const handleTranscribeClick = () => {
    onTranscriptionStart()
  }

  if (!isActive) {
    return (
      <section style={{ opacity: 0.5 }}>
        <h2>Fase D — Trascrizione Melodia</h2>
        <p>Conferma la tonalità per procedere alla trascrizione.</p>
        <hr />
      </section>
    )
  }

  return (
    <section>
      <h2>Fase D — Trascrizione Melodia</h2>

      <p>Tonalità confermata: <strong>{state.confirmedKey}</strong></p>

      <p>
        <em>Nota: questa versione utilizza una trascrizione simulata per testing del flusso.
        La trascrizione reale del file MP3 sarà disponibile quando sarà integrato un servizio
        di trascrizione musicale specializzato.</em>
      </p>

      <button
        onClick={handleTranscribeClick}
        disabled={state.loading}
      >
        {state.loading ? 'Trascrizione in corso...' : 'Genera Trascrizione'}
      </button>

      <hr />
    </section>
  )
}
