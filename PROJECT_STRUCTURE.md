# Struttura del progetto

## Frontend

```text
src/
├── App.jsx
├── components/
│   ├── FileUpload.jsx
│   └── ScoreExport.jsx
├── hooks/
│   └── useAppState.js
└── services/
    ├── fileValidator.js
    ├── musicXmlGenerator.js
    └── transcriptionService.js
```

Il frontend valida e carica il file audio, avvia la trascrizione tramite API e genera il MusicXML dai dati ricevuti. Non rileva né chiede di selezionare la tonalità; le altezze riconosciute non vengono trasposte e il MusicXML non definisce un'armatura di chiave.

## Backend

```text
backend/
├── server.js
├── middleware/
│   └── uploadHandler.js
└── services/
    ├── audioDecoder.js
    ├── onsetDetector.js
    ├── pitchDetector.js
    ├── noteQuantizer.js
    └── transcriber.js
```

Il backend riceve il file audio, esegue il rilevamento monofonico di altezze e attacchi, quantizza le note e restituisce i risultati al frontend. I file WAV vengono decodificati localmente; la decodifica MP3 richiede FFmpeg sul sistema.

## Flusso

1. L'utente seleziona un file MP3 o WAV.
2. Il frontend invia il file a `POST /api/transcribe`.
3. Il backend restituisce note e metadati.
4. Il frontend genera e scarica il file MusicXML.
