# 🚀 Quick Start – MP3 → Spartito MuseScore

## ⏱️ 3 Step per Iniziare

### 1. Avviare il server di sviluppo
```bash
cd "C:\Users\loren\Documents\Dev\DiegoSuona"
npm run dev
```

**Output atteso:**
```
  VITE v5.4.21 ready in XXX ms
  ➜  Local:   http://localhost:5173/
```

### 2. Aprire il browser
Il browser si apre automaticamente su `http://localhost:5173`

Se non si apre, accedi manualmente:
```
http://localhost:5173
```

### 3. Testare l'applicazione

#### Test Scenario 1: Flusso Completo
1. Carica un file MP3 dal tuo dispositivo (< 50 MB)
2. Clicca "Analizza" → Attendi rilevamento tonalità
3. Select una tonalità dal dropdown (se non automatica)
4. Clicca "Conferma Tonalità"
5. Clicca "Genera Trascrizione" → Attendi simulazione
6. Clicca "📥 Scarica Spartito"
7. Apri il file `.musicxml` in MuseScore 4

#### Test Scenario 2: Validazione File
- Prova a caricare un file non-MP3 → Errore in italiano
- Prova file > 50 MB → Errore in italiano
- Prova file vuoto → Errore in italiano

#### Test Scenario 3: Selezione Manuale Tonalità
- Se Essentia.js non rileva automatica → Select dropdown attivo
- Scegli una tonalità qualsiasi da 24 opzioni
- Conferma e continua

---

## 📁 File Principali

| File | Funzione |
|---|---|
| `src/App.jsx` | Orchestrazione flusso principale |
| `src/components/*` | 5 componenti UI per 5 fasi |
| `src/services/*` | 4 servizi di logica pura |
| `src/hooks/useAppState.js` | Stato centralizzato React |
| `vite.config.js` | Configurazione Vite |
| `package.json` | Dipendenze (React, Essentia.js, Vite) |

---

## 🎯 Cosa Aspettarsi

### ✅ Funzionante
- [x] Upload e validazione MP3
- [x] Rilevamento tonalità (Essentia.js)
- [x] Selezione tonalità manuale
- [x] Trascrizione simulata (chiaramente identificata)
- [x] Download MusicXML

### ⚠️ In Fase 1 (Demo)
- [⚠️] Trascrizione = sequenza do-re-mi fittizia (NON reale del file MP3)
- [⚠️] Niente CSS styling (markup semantico nudo)

### ❌ Non Implementato
- [ ] Trascrizione reale (pianificato Fase 2 con backend)
- [ ] Separazione strumenti
- [ ] Polifonia
- [ ] Backend API

---

## 🔍 Verificare il Funzionamento

### Nel Browser
1. Apri DevTools: `F12` o `Ctrl+Shift+I`
2. Vai a "Console"
3. Non dovrebbero esserci errori rossi
4. Dovresti vedere il titolo "MP3 → Spartito MuseScore"

### Generazione MusicXML (test automatico)
```bash
cd "C:\Users\loren\Documents\Dev\DiegoSuona"
node test-musicxml.js
```

**Output atteso:**
```
✓ XML length: 2656 characters
✓ Contains score-partwise: true
✓ Contains notes: 10 notes found
✓ MusicXML 4.0 valid structure: YES
```

---

## 🛠️ Comandi Disponibili

```bash
npm run dev      # Avviare dev server (hot reload)
npm run build    # Build per produzione
npm run preview  # Anteprima build produzione
```

---

## 📱 Interfaccia (Fase 1)

```
┌────────────────────────────────────┐
│ MP3 → Spartito MuseScore           │
├────────────────────────────────────┤
│ FASE A: Caricamento MP3            │
│ 📁 [Carica file]                   │
├────────────────────────────────────┤
│ FASE B: Riconoscimento Tonalità    │
│ ⏳ Analizza...                     │
├────────────────────────────────────┤
│ FASE C: Conferma Tonalità          │
│ Tonalità: [Do Maggiore ▼]          │
│ [Conferma]                         │
├────────────────────────────────────┤
│ FASE D: Trascrizione Melodia       │
│ [Genera Trascrizione]              │
├────────────────────────────────────┤
│ FASE E: Esportazione Spartito      │
│ [📥 Scarica Spartito]              │
│ [↻ Ricomincia]                     │
└────────────────────────────────────┘
```

---

## 🐛 Troubleshooting

### Problema: Pagina bianca
**Soluzione**: Apri DevTools (F12) → Console. Se errori, controlla che:
- `npm install` sia stato eseguito
- `npm run dev` sia in esecuzione
- Porta 5173 sia libera

### Problema: Essentia.js non carica
**Soluzione**: Normale in sviluppo. L'app fallback a selezione manuale tonalità.

### Problema: MusicXML non apre in MuseScore
**Soluzione**: 
- Verifica MuseScore 4.0+
- Prova ad aprire file scaricato con MuseScore `File → Open`
- MusicXML è valido XML (il problema è spesso locale)

### Problema: Niente accade dopo "Genera Trascrizione"
**Soluzione**: Attendere 2-3 secondi. App mostra "Elaborazione in corso...".

---

## 📊 Architettura

```
Browser
  ↓
React App (Vite dev server)
  ├── FileUpload (MP3 validation)
  ├── PitchDetection (Essentia.js)
  ├── KeyConfirmation (UI select)
  ├── TranscriptionStart (Demo sim)
  └── ScoreExport (MusicXML + download)
```

---

## 📚 Documentazione Completa

Vedi:
- [`README.md`](./README.md) — Panoramica progetto
- [`IMPLEMENTATION_STATUS.md`](./IMPLEMENTATION_STATUS.md) — Stato implementazione
- [`DEPLOYMENT.md`](./DEPLOYMENT.md) — Note deployment

---

## ✨ Pronto!

Tutto è configurato. Avvia il server e inizia a testare!

```bash
npm run dev
```

💡 **Suggerimento**: Se la finestra del browser non si apre, accedi manualmente a `http://localhost:5173`

---

**Data Setup**: 27 Ottobre 2026  
**Status**: ✅ Pronto per test utente
