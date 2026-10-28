# Avvio rapido

L'applicazione consente di caricare un file MP3 o WAV, inviarlo al backend per la trascrizione monofonica e scaricare il risultato in MusicXML. Non include il riconoscimento o la selezione della tonalità: le altezze rilevate restano invariate e il MusicXML non specifica un'armatura di chiave.

## Avvio in locale

Avvia il frontend dalla cartella principale:

```bash
npm install
npm run dev
```

In un secondo terminale, avvia il backend:

```bash
cd backend
npm install
npm start
```

Apri `http://localhost:5173`, seleziona un file audio e premi **Genera spartito**. Il file scaricato è compatibile con MuseScore 4.

I file WAV sono decodificati dal backend senza dipendenze esterne. Per i file MP3, FFmpeg deve essere disponibile sul sistema che esegue il backend.

Per ulteriori dettagli, consulta [README.md](./README.md), [QUICK_START.md](./QUICK_START.md) e [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md).
