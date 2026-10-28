# Audio → Spartito MuseScore 4

Web app che converte un file audio MP3 o WAV in uno spartito MusicXML con la melodia principale, compatibile con MuseScore 4.

La trascrizione è sperimentale: le note sono riconosciute con Basic Pitch e la melodia è la voce più alta tra quelle più forti. Non separa gli strumenti e non garantisce di isolare la melodia principale. Il tempo è stimato automaticamente, la misura è sempre 4/4 e non viene scritta l'armatura di chiave.

## Requisiti

- Node.js 18 o superiore

## Avvio in locale

```bash
npm install
npm run dev
```

In un secondo terminale:

```bash
cd backend
npm install
npm start
```

Apri `http://localhost:5173`, seleziona un file MP3 o WAV (massimo 50 MB), premi **Genera spartito** e scarica il file MusicXML. L'analisi di un brano di circa tre minuti richiede circa un minuto.

Il binario FFmpeg usato per la conversione viene scaricato da `ffmpeg-static`. Se dopo `npm install` risulta assente, esegui `node install.js` nella cartella `backend/node_modules/ffmpeg-static`.

## Architettura

```text
Frontend (React + Vite, porta 5173)
        ↓ POST /api/transcribe
Backend (Express, porta 3001)
        ├─ conversione audio con FFmpeg
        ├─ riconoscimento note con Basic Pitch
        └─ estrazione melodia e stima del tempo
        ↓ note
Frontend: generazione e download del MusicXML
```

Vedi [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) e [docs/BACKEND_SETUP.md](./docs/BACKEND_SETUP.md).

## Verifiche

```bash
npm run build
node test-musicxml.js
cd backend
npm test
```

## Convenzioni

React con JavaScript, interfaccia in italiano, identificatori in inglese, nessun commento, nessun punto e virgola, nessun CSS.
