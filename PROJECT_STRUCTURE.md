# 📦 Struttura Progetto – MP3 → Spartito MuseScore (Fase 1)

## 🗂️ Albero Completo

```
C:\Users\loren\Documents\Dev\DiegoSuona\
│
├── 📄 package.json                 ← Dipendenze e script
├── 📄 package-lock.json            ← Lock file
├── 📄 vite.config.js               ← Config Vite
├── 📄 .npmrc                        ← Config npm
├── 📄 .gitignore                   ← Git ignore rules
│
├── 📚 Documentazione
│   ├── 📄 README.md                ← Overview progetto
│   ├── 📄 QUICK_START.md           ← Guida rapida
│   ├── 📄 IMPLEMENTATION_STATUS.md ← Stato implementazione
│   ├── 📄 DEPLOYMENT.md            ← Note deployment
│   └── 📄 TEST_STATUS.html         ← Status page HTML
│
├── 📁 public/
│   └── 📄 index.html               ← Entry point HTML
│
├── 📁 src/
│   ├── 📄 index.jsx                ← React mount
│   ├── 📄 App.jsx                  ← Componente principale
│   ├── 📄 test.js                  ← Test utilities
│   │
│   ├── 📁 components/              ← Componenti React (UI)
│   │   ├── 📄 FileUpload.jsx       ← Fase A: Upload MP3
│   │   ├── 📄 PitchDetection.jsx   ← Fase B: Rilevamento tonalità
│   │   ├── 📄 KeyConfirmation.jsx  ← Fase C: Conferma tonalità
│   │   ├── 📄 TranscriptionStart.jsx ← Fase D: Trascrizione
│   │   └── 📄 ScoreExport.jsx      ← Fase E: Export MusicXML
│   │
│   ├── 📁 services/                ← Logica pura (indipendente da React)
│   │   ├── 📄 fileValidator.js     ← Validazione file MP3
│   │   ├── 📄 keyDetectionService.js ← Essentia.js wrapper
│   │   ├── 📄 transcriptionService.js ← Simulazione trascrizione
│   │   └── 📄 musicXmlGenerator.js ← Generazione MusicXML 4.0
│   │
│   └── 📁 hooks/                   ← Custom React hooks
│       └── 📄 useAppState.js       ← State management centralizzato
│
├── 📁 node_modules/                ← Dipendenze installate
│   ├── react@18.2.0
│   ├── react-dom@18.2.0
│   ├── essentia.js@0.1.3           ← Audio analysis WASM
│   ├── vite@5.0.12
│   └── @vitejs/plugin-react@4.2.1
│
├── 📄 test-musicxml.js             ← Test generazione MusicXML
│
└── 📁 dist/ (creato da `npm run build`)
    ├── index.html
    ├── js/
    └── assets/
```

---

## 📊 Dipendenze

### Production
```json
{
  "react": "^18.2.0",           // UI framework
  "react-dom": "^18.2.0",       // Rendering DOM
  "essentia.js": "^0.1.3"       // Audio analysis (WASM, 10 MB)
}
```

### Development
```json
{
  "vite": "^5.0.12",                      // Build tool
  "@vitejs/plugin-react": "^4.2.1"        // React Vite plugin
}
```

**Totale pacchetti**: 66  
**Dimensione node_modules**: ~500 MB (include Essentia.js WASM e dipendenze Vite)

---

## 🔄 Flusso di Codice

### Startup (npm run dev)
```
vite.config.js
  ↓
public/index.html (#root)
  ↓
src/index.jsx (React.mount)
  ↓
src/App.jsx (Root component)
  ↓
Rendering componenti UI
```

### Fase A: Upload
```
FileUpload.jsx
  ↓ [File scelto]
  ↓
fileValidator.js (validazione)
  ↓
useAppState.js (setAudioFile)
  ↓
setState → re-render UI
```

### Fase B: Analisi Tonalità
```
PitchDetection.jsx
  ↓ [Pulsante Analizza]
  ↓
keyDetectionService.js (Essentia.js)
  ↓
useAppState.js (setDetectedKey)
  ↓
KeyConfirmation.jsx (mostra select)
```

### Fase C: Conferma
```
KeyConfirmation.jsx
  ↓ [Conferma premuto]
  ↓
useAppState.js (setConfirmedKey)
  ↓
TranscriptionStart.jsx (attivo)
```

### Fase D: Trascrizione
```
TranscriptionStart.jsx
  ↓ [Genera Trascrizione]
  ↓
transcriptionService.js (simulazione)
  ↓
useAppState.js (setTranscription)
  ↓
musicXmlGenerator.js
  ↓
useAppState.js (setMusicXmlData)
```

### Fase E: Export
```
ScoreExport.jsx
  ↓ [Scarica Spartito]
  ↓
musicXmlGenerator.js (downloadMusicXml)
  ↓
Browser download: file.musicxml
```

---

## 🏗️ Architettura Layers

```
┌─────────────────────────────────────┐
│      React Components (UI)          │
│  ┌─ FileUpload                     │
│  ├─ PitchDetection                 │
│  ├─ KeyConfirmation                │
│  ├─ TranscriptionStart             │
│  └─ ScoreExport                    │
└──────────┬──────────────────────────┘
           │
┌──────────▼──────────────────────────┐
│   App.jsx (Orchestration)           │
│   ├─ State management               │
│   ├─ Phase transitions              │
│   └─ Service coordination           │
└──────────┬──────────────────────────┘
           │
┌──────────▼──────────────────────────┐
│  useAppState.js (State Hook)        │
│  ├─ currentPhase                    │
│  ├─ audioFile, fileName             │
│  ├─ detectedKey, confirmedKey       │
│  ├─ transcription, musicXmlData     │
│  └─ error, loading                  │
└──────────┬──────────────────────────┘
           │
┌──────────▼──────────────────────────┐
│      Services (Logic Layer)          │
│  ┌─ fileValidator.js               │
│  ├─ keyDetectionService.js         │
│  ├─ transcriptionService.js        │
│  └─ musicXmlGenerator.js           │
└──────────┬──────────────────────────┘
           │
┌──────────▼──────────────────────────┐
│  External Libraries & APIs           │
│  ├─ Essentia.js (Web Audio)         │
│  ├─ Web Audio API (browser)         │
│  └─ Blob/URL (file download)        │
└─────────────────────────────────────┘
```

---

## 📝 Convenzioni di Codice

### JavaScript
- ✅ No TypeScript
- ✅ No semicolons
- ✅ No comments (self-documenting code)
- ✅ camelCase per funzioni e variabili
- ✅ PascalCase per componenti React

### React
- ✅ Functional components
- ✅ Hooks (useState, useRef, custom hooks)
- ✅ Semantic HTML
- ✅ Minimal prop drilling
- ✅ No global state (only useAppState)

### Markup
- ✅ Semantic HTML5 (`<section>`, `<header>`, `<main>`)
- ✅ No CSS classes (ready for future styling)
- ✅ Accessibility basics (labels, ids)
- ✅ Italianized text in UI

---

## 🚀 Scripts npm

```json
{
  "dev": "vite",                    // Avviare dev server con hot reload
  "build": "vite build",            // Build per produzione
  "preview": "vite preview"         // Preview build produzione
}
```

### Uso
```bash
npm run dev        # Sviluppo (http://localhost:5173)
npm run build      # Produzione (output in dist/)
npm run preview    # Anteprima build (http://localhost:4173)
```

---

## 🧪 File di Test

| File | Scopo |
|---|---|
| `test-musicxml.js` | Verifica generazione MusicXML (node test-musicxml.js) |
| `src/test.js` | Utilities di test (importabile nei componenti) |
| `TEST_STATUS.html` | Status page manuale (apri nel browser) |

---

## 📱 Fasi dell'Applicazione (Stato React)

```javascript
const phases = [
  'upload',        // Seleziona file MP3
  'analyzing',     // Analisi tonalità in corso
  'keySelection',  // Selezione/conferma tonalità
  'transcribing',  // Trascrizione in corso
  'exporting',     // Export MusicXML
  'done',          // Completato, opzione ricomincia
  'error'          // Gestione errori
]
```

---

## 🔐 Sicurezza – Checklist

- ✅ Nessuna chiave API hardcoded
- ✅ Nessun invio file a servizi cloud (Fase 1 local-only)
- ✅ Validazione file lato client
- ✅ Web Audio API (nativo, no plugin)
- ✅ Essentia.js caricamento lazy (non forzato)

---

## 📦 Output Files

Dopo `npm run build`:
```
dist/
├── index.html            (~2 KB)
├── assets/
│   └── index-[hash].js   (~150 KB minificato)
└── (essentia.js WASM caricato al runtime)
```

Deployabile su:
- Vercel
- Netlify
- GitHub Pages
- Qualsiasi static hosting

---

## 🎯 Stato Attuale

| Componente | Status | % Complete |
|---|---|---|
| Struttura Vite | ✅ | 100% |
| Componenti React | ✅ | 100% |
| State Management | ✅ | 100% |
| File Upload | ✅ | 100% |
| Key Detection | ✅ | 100% |
| Transcription Demo | ✅ | 100% |
| MusicXML Export | ✅ | 100% |
| Documentazione | ✅ | 100% |
| **FASE 1 TOTALE** | **✅** | **100%** |

---

## 🔄 Prossimi Step (Fase 2+)

1. **Backend trascrizione** – Node.js + Essentia.js server-side
2. **Integrazione API** – Valutare servizi specializzati
3. **Styling CSS** – Basato su markup semantico attuale
4. **Testing** – Unit tests + E2E tests
5. **Deployment** – CI/CD setup (GitHub Actions, etc.)
6. **Monitoring** – Error tracking, analytics

---

**Generato**: 27 Ottobre 2026  
**Versione Documento**: 1.0  
**Status**: ✅ Fase 1 Completa
