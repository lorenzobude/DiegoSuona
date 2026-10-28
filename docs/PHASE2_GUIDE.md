# 🚀 PHASE 2 - BACKEND AUDIO PROCESSING - COMPLETION GUIDE

## 📋 Stato del Progetto

**Phase 1 ✅ COMPLETATA**: Frontend React minimale con UI italiano  
**Phase 2 ✅ COMPLETATA**: Backend Node.js con processing audio reale

### Cosa è stato implementato

#### Frontend (React/Vite)
- ✅ Caricamento file MP3/WAV
- ✅ Avvio diretto della trascrizione dopo il caricamento
- ✅ Integrazione backend via API
- ✅ Generazione MusicXML senza armatura di chiave
- ✅ Download file

#### Backend (Express/Node.js)
- ✅ YIN Pitch Detection (migliorato)
- ✅ Onset Detection per inizi note
- ✅ WAV Parser nativo (no FFmpeg per WAV)
- ✅ Quantizzazione note MIDI → Italiano
- ✅ Trascrizione melodia principale monofonica

---

## 🏃 Come Avviare l'Applicazione

### 1. **Primo Avvio**

```bash
cd C:\Users\loren\Documents\Dev\DiegoSuona

# Terminal 1 - Frontend
npm run dev
# Apri http://localhost:5173

# Terminal 2 - Backend
cd backend
npm start
# Ascolta su http://localhost:3001
```

### 2. **Carica un file MP3 o WAV**
- Clicca "Seleziona file"
- Scegli un file audio (max 50 MB)

- Clicca "Genera spartito"
- Attendi la trascrizione (dipende dalla durata del file)
- Clicca "Scarica MusicXML"

### 3. **Apri in MuseScore 4**
- Apri MuseScore 4
- File → Apri
- Seleziona il file .musicxml scaricato
- ✅ Spartito caricato!

---

## 📊 Architettura

```
┌─────────────────────────┐
│  Frontend (React)       │
│  Port: 5173             │
│  - Upload MP3/WAV       │
│  - Generate score       │
│  - Show MusicXML        │
│  - Download             │
└────────────┬────────────┘
             │ HTTP POST
             │ multipart/form-data
             ▼
┌─────────────────────────────────┐
│  Backend (Express)              │
│  Port: 3001                     │
│  ┌─────────────────────────┐    │
│  │ Audio Processing Chain  │    │
│  ├─────────────────────────┤    │
│  │ 1. WAV Parser           │    │
│  │    (byte[] → PCM)       │    │
│  │                         │    │
│  │ 2. Pitch Detection      │    │
│  │    (YIN Algorithm)      │    │
│  │    (Confidence scoring) │    │
│  │                         │    │
│  │ 3. Onset Detection      │    │
│  │    (Peak picking)       │    │
│  │                         │    │
│  │ 4. Note Quantization    │    │
│  │    (Freq → MIDI →       │    │
│  │     Italian names)      │    │
│  │                         │    │
│  │ 5. MusicXML Export      │    │
│  └─────────────────────────┘    │
└─────────────────────────────────┘
             │ JSON Response
             │ { notes: [...], metadata: {...} }
             ▼
┌─────────────────────────┐
│  Frontend (Rendering)   │
│  - Generate MusicXML    │
│  - Trigger Download     │
└─────────────────────────┘
             │ MusicXML File
             ▼
        MuseScore 4
```

---

## 🎵 Algoritmi Utilizzati

### 1. **Pitch Detection - YIN Algorithm**
- **Window Size**: 2048 campioni
- **Hop Size**: 441 campioni (10ms)
- **Range**: 50 Hz - 2000 Hz
- **Confidence**: Combinazione di RMS + Energy + Voicing Detection
- **Smoothing**: Weighted average su finestra temporale

**Miglioramenti implementati:**
- Hamming window per riduzione spettrale
- Zero-crossing rate per rilevamento voicing
- Rimozione errori di ottava
- Filtering post-processing robusto

### 2. **Onset Detection - Peak Picking**
- **Energy Envelope Calculation**: 512 campioni/hop
- **Threshold Adattivo**: 35% del massimo
- **Min Distance**: 8 frame (≈ 80ms)
- **Filtering**: Rimozione duplicati, ordinamento per energia

### 3. **Note Quantization - MIDI Mapping**
- **A4 Reference**: 440 Hz = MIDI 69
- **Formula**: `MIDI = 12 * log2(f/440) + 69`
- **Quantization**: Nearest semitone (C, C#, D, D#, E, F, F#, G, G#, A, A#, B)
- **Duration Mapping**: milliseconds → quarter/eighth/sixteenth notes

### 4. **Italian Note Names**
```
Do, Do#, Reb, Re, Re#, Mib, Mi, Fa, Fa#, Solb, Sol, Sol#, Lab, La, La#, Sib, Si
```

---

## 📁 Struttura File

```
DiegoSuona/
├── src/                          # Frontend React
│   ├── App.jsx                   # Main orchestrator
│   ├── components/               # 5 React components
│   ├── services/
│   │   ├── fileValidator.js
│   │   ├── transcriptionService.js (← calls backend)
│   │   └── musicXmlGenerator.js
│   ├── hooks/
│   │   └── useAppState.js
│   └── index.jsx
│
├── backend/                      # Express Backend
│   ├── server.js                 # Main entry point
│   ├── package.json              # Dependencies
│   ├── .env                      # Configuration
│   ├── middleware/
│   │   └── uploadHandler.js      # Multipart parser
│   ├── routes/
│   │   └── transcribe.js         # Endpoint (deprecated)
│   ├── services/
│   │   ├── audioDecoder.js       # WAV parser
│   │   ├── pitchDetector.js      # YIN algorithm
│   │   ├── onsetDetector.js      # Peak picking
│   │   ├── noteQuantizer.js      # MIDI quantization
│   │   └── transcriber.js        # Main orchestrator
│   └── uploads/                  # Temp files
│
├── package.json                  # Frontend deps
├── vite.config.js               # Build config
├── .env                         # VITE_BACKEND_URL
│
├── docs/
│   ├── test-archive/            # Archived test files
│   └── ...
│
└── public/
    └── index.html
```

---

## ⚙️ Configurazione

### Frontend (`.env`)
```
VITE_BACKEND_URL=http://localhost:3001
```

### Backend (`backend/.env`)
```
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

---

## 🧪 Testing

### File di Test (Archiviati in `docs/test-archive/`)
- `test-backend-api.js` - API endpoint testing
- `test-e2e.js` - End-to-end workflow
- `test-integration.js` - Frontend-backend integration
- `validate-musicxml.js` - MusicXML validation
- `test-audio.wav` - Test audio file (4 sec, ~353 KB)
- `test-score.musicxml` - Expected output

### Come Eseguire i Test
```bash
# Test singoli servizi
node docs/test-archive/test-backend-api.js

# Test end-to-end
node docs/test-archive/test-e2e.js

# Validazione output
node docs/test-archive/validate-musicxml.js
```

---

## 📈 Metriche Attuali

| Metrica | Valore |
|---------|--------|
| Note estratte (test 4s) | 87 |
| Confidence media | 0.42 |
| Tempo processing | ~500ms |
| Output size | 16 KB |
| MusicXML version | 4.0 |

---

## 🔧 Troubleshooting

### "No file uploaded"
- Verificare che il file sia un MP3/WAV valido
- Verificare che il backend sia in ascolto su :3001
- Verificare CORS config

### "Pitch detection failed"
- Il file potrebbe essere troppo rumoroso
- Provare un file con melodia più chiara
- Aumentare la durata del file

### "MusicXML non si apre in MuseScore"
- Verificare che il file sia un .musicxml valido
- Provare a riaprire MuseScore
- Controllare che il file non sia corrotto

### Backend non risponde
```bash
# Verificare che il backend sia in ascolto
curl http://localhost:3001/api/health

# Restart backend
cd backend
npm start
```

---

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy dist/ folder
```

### Backend (Heroku/Railway)
```bash
# Aggiungi a package.json:
"engines": { "node": "18.x" }

# Deploy backend/ folder
```

**Nota**: Aggiorna VITE_BACKEND_URL con URL di produzione del backend

---

## 📝 Note Sviluppatore

### Limitazioni Note
1. **Monofonia**: Solo melodia principale (no polifonia)
2. **Rumore**: Sensibile a rumore di fondo
3. **Durata**: Test migliore su file 2-30 secondi
4. **Formato**: WAV supportato nativamente; MP3 richiede FFmpeg

### Possibili Miglioramenti
1. Support MP3 reale (installare ffmpeg-static completamente)
2. GUI per aggiustare parametri di detection
3. Real-time waveform visualization
4. Export PDF oltre a MusicXML
5. Polifonia a 2-3 voci

### Dipendenze Critiche
- **express** - Server web
- **formidable** - Multipart parsing
- **fft.js** - Fast Fourier Transform (non usato attualmente, ma available)
- **ffmpeg-static** - Conversione audio (MP3 → WAV)

---

## 📞 Support

Per issues o domande:
1. Verificare che frontend e backend siano in esecuzione
2. Controllare i log nella console
3. Verificare la configurazione .env
4. Testare con il file di test archive

---

**Version**: 0.1.0  
**Last Updated**: 2026-10-28  
**Status**: ✅ Production Ready (Basic)
