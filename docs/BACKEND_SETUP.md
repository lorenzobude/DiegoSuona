# Backend Setup & Architecture

## 📦 Dipendenze Installate

```json
{
  "express": "4.18.2",
  "cors": "2.8.5",
  "formidable": "2.1.1",
  "fft.js": "4.0.3",
  "ffmpeg-static": "5.3.0",
  "fluent-ffmpeg": "2.1.3",
  "uuid": "9.0.0"
}
```

## 🗂️ Struttura Directory

```
backend/
├── server.js                    # Express entry point
├── package.json                 # Dependencies
├── .env                         # Configuration
├── middleware/
│   └── uploadHandler.js         # Formidable multipart parser
├── routes/
│   └── transcribe.js           # API routes (legacy)
├── services/
│   ├── audioDecoder.js         # WAV parser (native)
│   ├── pitchDetector.js        # YIN algorithm
│   ├── onsetDetector.js        # Peak picking
│   ├── noteQuantizer.js        # MIDI quantization
│   └── transcriber.js          # Main orchestrator
└── uploads/                    # Temporary audio files
```

## 🚀 Avvio

### Development
```bash
cd backend
npm install
npm start

# Con nodemon (auto-reload)
npm run dev
```

### Health Check
```bash
curl http://localhost:3001/api/health
# Output: { "status": "ok", "version": "0.1.0" }
```

## 🔌 API Endpoints

### POST /api/transcribe
**Descrizione**: Trascrivi file audio

**Request**: 
- Multipart form-data
- `file`: audio file (WAV, MP3)

**Response Success**:
```json
{
  "success": true,
  "notes": [
    {
      "pitch": "Do4",
      "duration": "quarter",
      "time": 0,
      "confidence": 0.85
    },
    ...
  ],
  "metadata": {
    "sampleRate": 44100,
    "duration": 4.2,
    "confidence": 0.42,
    "totalFrames": 420,
    "totalOnsets": 87
  }
}
```

**Response Error**:
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## 🧪 Testing

```bash
# Copia file di test da archive
cp docs/test-archive/test-audio.wav .
cp docs/test-archive/test-backend-api.js .

# Esegui test
npm test  # or: node test-backend-api.js
```

## ⚙️ Configurazione Variabili Ambiente

Crea `backend/.env`:
```
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800
```

### Production
```
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://app.example.com
UPLOAD_DIR=/tmp/uploads
MAX_FILE_SIZE=52428800
```

## 📊 Audio Processing Pipeline

### 1. Audio Decoder
- **Input**: WAV or MP3 file (binary)
- **Process**:
  - Parse WAV header (native)
  - Extract PCM samples
  - Convert to Float32Array
- **Output**: { audioBuffer, sampleRate, duration }

### 2. Pitch Detector (YIN Algorithm)
- **Input**: PCM audioBuffer (44100 Hz)
- **Parameters**:
  - Window size: 2048 samples
  - Hop size: 441 samples (10ms)
  - Frequency range: 50-2000 Hz
- **Process**:
  - Apply Hamming window
  - Autocorrelation calculation
  - Confidence scoring (RMS + Energy + ZCR)
- **Output**: [{ frequency, confidence, time }, ...]

### 3. Onset Detector
- **Input**: PCM audioBuffer
- **Parameters**:
  - Window size: 512 samples
  - Energy threshold: 35% of max
  - Min distance: 8 frames
- **Process**:
  - Calculate energy envelope
  - Peak picking
  - Remove duplicates
- **Output**: [onsetTime, onsetTime, ...]

### 4. Note Quantizer
- **Input**: 
  - pitches array (frequencies)
  - onsetTimes array
- **Process**:
  - Match frequency to MIDI note
  - Convert MIDI to Italian name
  - Quantize duration
  - Apply confidence
- **Output**: [{ pitch, duration, confidence }, ...]

### 5. Transcriber Orchestrator
- **Coordination**: Coordina l'intera pipeline
- **Error Handling**: Try-catch con cleanup
- **Logging**: Debug output
- **Cleanup**: Rimuove file temporanei

## 🔍 Debugging

### Enable Debug Logging
Modifica `transcriber.js`:
```javascript
console.log('[Transcriber] Step name...') // Già implementato
```

### Test Singolo Servizio
```javascript
import { detectPitch } from './services/pitchDetector.js'
import { decodeAudioFile } from './services/audioDecoder.js'

const audio = await decodeAudioFile('test.wav')
const pitches = detectPitch(audio.audioBuffer, audio.sampleRate)
console.log(pitches)
```

## 🚨 Error Handling

### Tipi di Errore
- `NO_FILE`: Nessun file nel request
- `INVALID_FORMAT`: File non è audio
- `UPLOAD_ERROR`: Errore nel parsing multipart
- `TRANSCRIPTION_ERROR`: Errore durante trascrizione
- `SERVER_ERROR`: Errore generico

### Recovery
- Automatico cleanup file temporanei
- Request retry-able
- CORS error visible nel browser console

## 📈 Performance Optimization

### Attuali
- **Memory**: ~50MB per audio 4 sec
- **CPU**: Single thread (event loop)
- **Latency**: ~500ms per 4 sec audio

### Future
- Implementare Web Workers per parallelizzazione
- Caching di risultati
- Streaming upload/download
- Redis caching

## 🔐 Security Considerations

### Current
- ✅ File type validation (MIME type)
- ✅ File size limit (50MB)
- ✅ CORS enabled (configurable)
- ✅ No persistent storage (cleanup)

### Missing (future)
- Input sanitization
- Rate limiting
- JWT authentication
- File encryption at rest
- Audit logging

## 📚 Algoritmi Dettagliati

### YIN Algorithm
- **Autocorrelation**: Misura somiglianza tra signal e lag
- **Difference Function**: `d(tau) = sum((x[n] - x[n+tau])^2)`
- **Normalized ACF**: Peso per energia del segnale
- **Confidence Threshold**: 0.15 (30% dello max)

### Onset Detection
- **Energy Envelope**: RMS per window
- **Peak Picking**: Massimi locali > threshold
- **Debouncing**: Minimum 80ms tra note

### MIDI Quantization
- **Frequency to MIDI**: `M = 12*log2(f/440) + 69`
- **Nearest Semitone**: Round al MIDI intero
- **Duration Mapping**:
  - whole: 4 beat
  - half: 2 beat
  - quarter: 1 beat
  - eighth: 0.5 beat
  - sixteenth: 0.25 beat

## 📞 Troubleshooting

### "EADDRINUSE: Port 3001 already in use"
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :3001
kill -9 <PID>
```

### "Cannot find module 'formidable'"
```bash
npm install
# Or for specific module:
npm install formidable@2.1.1
```

### "FFmpeg not found"
```bash
# Per MP3 support
npm install ffmpeg-static
npx playwright install-deps  # Se su Linux
```

### "CORS error from frontend"
- Verificare CORS_ORIGIN in .env
- Match con frontend URL
- Deve includere schema (http/https)

## 🚀 Deployment

### Heroku
```bash
git push heroku main
heroku config:set CORS_ORIGIN=https://app.herokuapp.com
```

### Railway/Render
- Connect GitHub repo
- Set environment variables
- Auto-deploy

### Docker (future)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
CMD ["npm", "start"]
```

---

**Version**: 0.1.0  
**Last Update**: 2026-10-28  
**Status**: ✅ Production Ready (Basic)
