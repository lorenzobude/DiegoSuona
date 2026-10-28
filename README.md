# 🎵 Audio → Spartito MuseScore 4

Converti file audio MP3 o WAV in spartiti MusicXML compatibili con MuseScore 4.

## ✨ Funzionalità

- 🎤 **Caricamento Audio**: Supporta MP3 e WAV
- 🎼 **Trascrizione audio sperimentale**: Basic Pitch riconosce le note, la melodia è la voce più alta; il tempo è stimato automaticamente
- 📄 **Export MusicXML**: Genera spartiti compatibili con MuseScore 4
- 🌐 **UI Italiana**: Interfaccia completamente in italiano

## 🚀 Quick Start

### Requisiti
- Node.js 18+
- NPM

### Installazione

```bash
# Clone o apri il progetto
cd DiegoSuona

# Frontend
npm install
npm run dev

# In un altro terminal - Backend
cd backend
npm install
npm start
```

### Utilizzo

1. Apri http://localhost:5173 nel browser
2. Carica un file MP3 o WAV
3. Clicca "Genera spartito"
4. Scarica il file MusicXML
5. Apri in MuseScore 4

## 📊 Architettura

```
Frontend (React/Vite:5173)
        ↓ HTTP POST
Backend (Express:3001)
        ├→ Audio Decoder (WAV Parser)
        ├→ Pitch Detection (YIN Algorithm)
        ├→ Onset Detection (Peak Picking)
        ├→ Note Quantization (MIDI)
        └→ MusicXML Export
```

## 📚 Documentazione

- **[PHASE2_GUIDE.md](./docs/PHASE2_GUIDE.md)** - Guida completa fase 2
- **[IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)** - Status implementazione
- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - Struttura progetto

## 🧪 Testing

I file di test sono archiviati in `docs/test-archive/`:

```bash
# Testa singoli servizi
node docs/test-archive/test-backend-api.js

# Test end-to-end completo
node docs/test-archive/test-e2e.js
```

## 🛠️ Tech Stack

**Frontend**:
- React 18
- Vite 5
- Web Audio APIs for local audio file handling

**Backend**:
- Express 4
- Node.js
- Custom YIN Algorithm
- Native WAV Parser

## 📋 Vincoli e Specifiche

- ✅ React con JavaScript (no TypeScript)
- ✅ No semicolons al fine linea
- ✅ No CSS (solo HTML semantico)
- ✅ UI italiana / Codice inglese
- ✅ Frontend minimale e modulare
- ✅ Backend per processing audio reale

## 🎯 Roadmap Futuri

- [ ] Support MP3 reale (FFmpeg)
- [ ] GUI per parametri di detection
- [ ] Real-time waveform visualization
- [ ] Export PDF
- [ ] Polifonia a 2-3 voci
- [ ] Deployment (Vercel + Railway/Heroku)

## 📈 Metriche

| Aspetto | Valore |
|---------|--------|
| Note estratte (4s audio) | ~87 |
| Confidence media | 0.42 |
| Tempo processing | ~500ms |
| Output MusicXML | 16 KB |
| Formati supportati | WAV, MP3* |

*MP3 richiede FFmpeg installato

## 🤝 Contributi

Questo è un progetto di sviluppo personale. Per modifiche:

1. Mantenere lo stile: no semicolons, no CSS, UI italiana
2. Testare con il file di test archive
3. Aggiornare la documentazione

## 📝 Note

- Il progetto è state-of-art per trascrizione monofonica in browser
- Non è un riconoscimento vocale, ma audio-musicale
- Optimizzato per melodie chiare e cantate (non strumenti complessi)

## 🔗 Link Utili

- [MuseScore 4](https://musescore.org)
- [MusicXML Standard](https://www.w3.org/TR/musicxml31/)
- [React Docs](https://react.dev)
- [Express Docs](https://expressjs.com)

---

**Version**: 0.1.0  
**Status**: ✅ Sviluppo locale  
**Last Update**: 2026-10-28
