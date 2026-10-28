# Backend

Express su `http://localhost:3001`. Configurazione in `backend/.env` (vedi `.env.example`):

```text
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

## Avvio

```bash
cd backend
npm install
npm start
```

Il server non ricarica il codice automaticamente: dopo ogni modifica va riavviato.

## API

- `GET /api/health`: stato del server.
- `POST /api/transcribe`: multipart con il campo `file` (MP3 o WAV, massimo 50 MB).

Risposta in caso di successo:

```json
{
  "success": true,
  "notes": [{ "pitch": "Do4", "start": 0, "length": 4, "time": 0.5, "confidence": 0.7 }],
  "metadata": { "sampleRate": 22050, "duration": 164.5, "tempo": 106, "confidence": 0.57, "totalNotesDetected": 1439 }
}
```

`start` e `length` sono espressi in sedicesimi a partire dall'inizio della prima battuta. In caso di errore la risposta contiene `success: false`, `error` e `code`.

## Elaborazione

1. `audioConverter.js` converte il file in WAV mono a 22050 Hz con FFmpeg (`ffmpeg-static`).
2. `audioDecoder.js` legge il WAV e lo converte in campioni.
3. `polyphonicDetector.js` esegue Basic Pitch con il backend WASM di TensorFlow.js.
4. `melodyExtractor.js` sceglie la voce più alta tra le note più forti, stima il tempo e quantizza su sedicesimi.
5. `transcriber.js` coordina i passaggi ed elimina il file caricato.

## Test

```bash
npm test
```
