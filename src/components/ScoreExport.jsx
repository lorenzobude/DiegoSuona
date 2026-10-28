import { downloadMusicXml } from '../services/musicXmlGenerator'

export default function ScoreExport({ state, isActive, onReset }) {
  const handleDownload = () => {
    if (state.musicXmlData) {
      const fileName = `${state.fileName.replace(/\.[^.]+$/, '')}.musicxml`
      downloadMusicXml(state.musicXmlData, fileName)
    }
  }

  if (!isActive) {
    return (
      <section style={{ opacity: 0.5 }}>
        <h2>Esportazione spartito</h2>
        <p>Carica un file audio e genera lo spartito per procedere all'esportazione.</p>
        <hr />
      </section>
    )
  }

  if (state.loading && !state.musicXmlData) {
    return (
      <section>
        <h2>Esportazione spartito</h2>
        <p>⏳ Generazione dello spartito in corso...</p>
        <hr />
      </section>
    )
  }

  return (
    <section>
      <h2>Esportazione spartito</h2>

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
        <p>Desideri convertire un altro file audio?</p>
        <button onClick={onReset}>
          ↻ Ricomincia
        </button>
      </div>
    </section>
  )
}
