import { downloadMusicXml } from '../services/musicXmlGenerator'

export default function ScoreExport({ state, isActive, onExportStart, onReset }) {
  const handleDownload = () => {
    if (state.musicXmlData) {
      const fileName = `${state.fileName.replace('.mp3', '')}.musicxml`
      downloadMusicXml(state.musicXmlData, fileName)
    }
  }

  const handleReset = () => {
    onReset()
  }

  if (!isActive) {
    return (
      <section style={{ opacity: 0.5 }}>
        <h2>Fase E — Esportazione Spartito</h2>
        <p>Completa la trascrizione per procedere all'esportazione.</p>
        <hr />
      </section>
    )
  }

  if (state.loading && !state.musicXmlData) {
    return (
      <section>
        <h2>Fase E — Esportazione Spartito</h2>
        <p>⏳ Generazione dello spartito in corso...</p>
        <hr />
      </section>
    )
  }

  return (
    <section>
      <h2>Fase E — Esportazione Spartito</h2>

      {state.musicXmlData && (
        <div>
          <p>✓ Spartito generato con successo!</p>
          <p>Formato: MusicXML (compatibile con MuseScore 4)</p>
          <button onClick={handleDownload}>
            📥 Scarica Spartito
          </button>
        </div>
      )}

      <hr />

      <div>
        <p>Desideri convertire un altro file MP3?</p>
        <button onClick={handleReset}>
          ↻ Ricomincia
        </button>
      </div>
    </section>
  )
}
