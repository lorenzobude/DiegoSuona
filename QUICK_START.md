# Avvio rapido — Audio → Spartito MuseScore

## Avviare l'applicazione

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

Apri `http://localhost:5173`, seleziona un file MP3 o WAV (massimo 50 MB) e premi **Genera spartito**. Al termine, scarica il MusicXML e aprilo in MuseScore 4.

Il riconoscimento automatico e la selezione della tonalità non fanno parte del flusso. Il MusicXML non specifica un'armatura di chiave e le note non vengono trasposte.

La trascrizione è sperimentale e monofonica: in un brano con più strumenti non isola automaticamente la fisarmonica o la melodia principale.

I file WAV vengono decodificati dal backend senza dipendenze esterne. Per i file MP3 è necessario che FFmpeg sia disponibile sul sistema che esegue il backend.

## Verifiche

```bash
npm run build
node test-musicxml.js
```

`npm run build` verifica il frontend; `test-musicxml.js` verifica la struttura generata e l'assenza dell'armatura di chiave.
