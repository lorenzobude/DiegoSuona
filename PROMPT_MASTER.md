# Progetto: web app React per convertire MP3 in spartiti MuseScore 4

Agisci come uno sviluppatore senior specializzato in React, JavaScript, elaborazione audio e applicazioni musicali.

Voglio sviluppare una web app che permetta di caricare un file MP3, riconoscere la tonalità, confermarla manualmente e generare uno spartito contenente la sola melodia principale, scaricabile e compatibile con MuseScore 4.

L'obiettivo iniziale è realizzare un frontend React minimale, mantenendo aperta la possibilità di integrare successivamente un servizio AI o un sistema di trascrizione musicale.

## 1. Vincoli di sviluppo

- Utilizzare React con JavaScript.
- Non utilizzare TypeScript.
- Interfaccia interamente in italiano.
- Nomi di variabili, funzioni, componenti e file in inglese.
- Non inserire commenti nel codice.
- Evitare i punti e virgola nel codice JavaScript.
- Utilizzare markup HTML semantico e minimale.
- Non utilizzare CSS per il momento.
- Non introdurre framework grafici, librerie UI o dipendenze non necessarie.
- Preferire codice semplice, leggibile e modulare.
- Non implementare funzionalità non richieste.
- Non introdurre un backend nella prima fase.

## 2. Flusso dell'applicazione

L'applicazione deve seguire queste fasi.

### Fase A — Caricamento MP3

L'utente deve poter selezionare un file MP3 dal proprio dispositivo.

Requisiti:
- Accettare file MP3.
- Verificare il file selezionato e applicare un limite di dimensione configurabile.
- Mostrare il nome del file.
- Consentire la sostituzione del file selezionato.
- Impedire l'avvio dell'analisi se il file non è valido.
- Mostrare gli errori in italiano.

Il file deve essere gestito localmente finché non viene avviata un'operazione che richiede un servizio esterno.

### Fase B — Riconoscimento della tonalità

Aggiungere un pulsante per avviare l'analisi del brano.

Il sistema dovrà utilizzare un provider da scegliere dopo aver valutato fattibilità tecnica, costi, limiti e sicurezza.

Gemini è un candidato per la stima della tonalità, ma non deve essere considerato automaticamente adatto alla trascrizione musicale completa.

Prima di integrare un provider:
- Verificare il supporto effettivo per i file MP3.
- Verificare la qualità del riconoscimento della tonalità musicale.
- Valutare limiti di dimensione e durata dei file.
- Verificare prezzi, quote gratuite e condizioni d'uso aggiornate.
- Distinguere l'analisi della tonalità dalla trascrizione delle singole note.

La risposta attesa per questa fase deve contenere almeno una tonalità musicale riconosciuta, se disponibile.

Se il servizio restituisce dati non validi o non riesce a identificare la tonalità, consentire la selezione manuale.

Non inventare risultati e non dichiarare completata un'analisi che non è stata realmente eseguita.

### Fase C — Conferma della tonalità

Quando è disponibile un risultato, mostrare:
- Un campo select con le tonalità maggiori e minori.
- La tonalità riconosciuta preselezionata, se disponibile.
- Un pulsante di conferma.

L'utente deve poter scegliere una tonalità diversa.

Dopo la conferma, conservare la tonalità nello stato React e renderla disponibile alla fase di generazione dello spartito.

Se la tonalità non è stata riconosciuta automaticamente, il campo select deve comunque consentire di proseguire dopo una selezione manuale.

### Fase D — Trascrizione della melodia principale

Dopo la conferma della tonalità, mostrare un pulsante per generare lo spartito.

L'obiettivo è trascrivere esclusivamente la melodia principale del brano, senza ricostruire tutte le parti strumentali.

Il sistema di trascrizione dovrà identificare, per quanto possibile:
- Altezze delle note.
- Durate e valori ritmici.
- Posizione delle note nel tempo.
- Eventuali pause.
- Organizzazione delle note in battute.

Non presumere che un modello AI generico possa eseguire correttamente questa operazione.

Valutare sistemi specializzati di trascrizione audio-musicale e soluzioni in grado di generare MIDI o MusicXML.

La tonalità confermata deve essere utilizzata come riferimento per la notazione, senza modificare arbitrariamente le altezze riconosciute.

Se il sistema non è ancora stato integrato, predisporre un punto di integrazione sostituibile e dichiarare chiaramente che la trascrizione reale non è disponibile.

### Fase E — Esportazione dello spartito

Il formato di esportazione iniziale deve essere MusicXML, compatibile con MuseScore 4.

Il sistema deve:
- Produrre MusicXML valido a partire da una trascrizione reale.
- Consentire il download del file.
- Utilizzare un nome di file appropriato.
- Mostrare un messaggio di errore se la generazione fallisce.

Non generare un file fittizio presentandolo come trascrizione del brano caricato.

Non è necessario generare PDF o file MuseScore nativi in questa prima versione.

## 3. Architettura iniziale: solo frontend

Utilizzare React senza backend nella prima fase.

Organizzare il codice in modo da separare:
- Interfaccia utente.
- Stato e gestione del flusso di elaborazione.
- Validazione del file.
- Servizio di analisi della tonalità.
- Servizio di trascrizione musicale.
- Generazione e download del file MusicXML.

Le integrazioni esterne devono essere sostituibili senza dover riscrivere i componenti React.

Non inserire chiamate API direttamente nei componenti dell'interfaccia.

Per la prima versione, implementare soltanto le funzionalità realmente disponibili in locale.

Se il provider non è stato scelto, utilizzare un servizio simulato esclusivamente per verificare il flusso dell'interfaccia, identificandolo chiaramente come modalità dimostrativa.

Non simulare una trascrizione musicale reale.

## 4. Sicurezza e integrazioni esterne

Non inserire chiavi API segrete nel codice React, nelle variabili d'ambiente esposte al frontend o nei file distribuiti al browser.

Prima di integrare un servizio cloud, verificare se esiste una modalità di accesso compatibile con un'applicazione frontend senza esporre credenziali privilegiate.

Valutare, in ordine:
1. Elaborazione locale nel browser, se tecnicamente adeguata.
2. Un servizio frontend con autenticazione e accesso sicuro ufficialmente supportati dal provider.
3. Un backend minimale, da introdurre soltanto quando necessario.

Se nessuna soluzione sicura è disponibile senza backend, spiegare il motivo e proporre l'architettura minima necessaria. Non aggirare le protezioni inserendo una chiave segreta nel frontend.

## 5. Interfaccia e stati React

Mantenere l'interfaccia minimale, senza CSS.

Prevedere almeno questi stati:
- Nessun file selezionato.
- File selezionato.
- Analisi in corso.
- Tonalità disponibile.
- Tonalità da confermare.
- Trascrizione in corso.
- File MusicXML pronto.
- Errore.

Disabilitare i pulsanti quando l'operazione corrispondente non può essere eseguita.

Gestire gli errori senza interrompere l'intera applicazione.

Utilizzare lo stato React per coordinare le diverse fasi. Evitare variabili globali e duplicazioni inutili dello stato.

## 6. Modalità di lavoro

Procedere per fasi e attendere la mia conferma prima di passare alla fase successiva.

Prima fase:
- Analizzare i requisiti.
- Proporre una struttura minima dei file.
- Identificare le dipendenze indispensabili.
- Valutare le opzioni per il riconoscimento della tonalità e la trascrizione della melodia.
- Distinguere chiaramente ciò che può funzionare nel solo browser da ciò che richiede servizi esterni o un backend.
- Non scrivere ancora il codice dell'applicazione.

Dopo la mia conferma, realizzare il frontend di base e verificare che il flusso dell'interfaccia funzioni.

Successivamente integrare le funzionalità reali una alla volta.

Fornire codice completo e funzionante, evitando pseudocodice non dichiarato come tale. Segnalare esplicitamente ogni funzionalità ancora simulata o non implementata.

L'obiettivo è una base React minimale, chiara e facilmente estendibile, senza anticipare decisioni tecniche non necessarie.