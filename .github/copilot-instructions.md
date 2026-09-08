# Contesto del progetto

Adattato dai file di [steering Kiro](../.kiro/steering/). Mantenerli invariati salvo richiesta esplicita. In caso di informazioni obsolete, verificare i sorgenti prima di intervenire.

## Prodotto e identita

- Sito professionale di Paola Mincuzzi, personal trainer e chinesiologa a Bari. Pubblico principale: adulti italiani di 35-60 anni interessati ad allenamento, postura e recupero funzionale; la pagina fitness aziendale si rivolge alle aziende locali.
- Preservare presentazione di servizi, qualifiche e metodo, galleria, testimonianze, pacchetti con checkout Stripe, contatti WhatsApp e consenso cookie.
- Contenuti in italiano, documenti HTML con `lang="it"`. Identita: `#teammincuzzi`, accento `#d4a574`, Playfair Display per i titoli e Inter per il testo. Seguire il design esistente.

## Struttura e tecnologie

- Sito statico HTML5, CSS3 e JavaScript vanilla ES6+. Non introdurre framework, bundler o backend senza richiesta.
- Bootstrap 5.3.3, Bootstrap Icons 1.11.3 e Google Fonts sono caricati via CDN. Usare i componenti e le icone gia presenti.
- `index.html`: pagina principale con navigazione per sezioni. Mantenere coerenti ID e ancore (`chi-sono`, `servizi`, `metodo`, `galleria`, `risultati`, `pacchetti`, `contatti`).
- `fitness-aziendale/index.html`: pagina aziendale pubblica, URL canonico `/fitness-aziendale/`. `fitness-aziendale.html`: redirect legacy, non una seconda pagina da sviluppare.
- `cookie-policy.html` e `grazie.html`: pagine di servizio. `sitemap.xml`, `robots.txt` e `CNAME`: metadati di pubblicazione e indicizzazione.
- `styles.css` e `script.js`: sorgenti condivisi; CSS organizzato per sezione con custom properties, JS per funzionalita. Preservare i controlli sull'esistenza degli elementi per le pagine che condividono gli script.
- Le recensioni attuali sono nel markup di `index.html`; non presumere l'esistenza di `reviews.json` o di un caricamento via `fetch`, citati nel vecchio contesto Kiro.
- Risorse in `images/`, con struttura piatta. Verificare i file effettivamente disponibili prima di aggiungere riferimenti.

## Build e verifiche

- Modificare i sorgenti, non direttamente `styles.min.css` e `script.min.js`.
- Dopo modifiche a `styles.css` o `script.js`, eseguire `./build.sh` dalla root e includere i minificati aggiornati. Le pagine pubbliche caricano questi file.
- La build richiede Node.js/npm ed esegue `npx clean-css-cli styles.css -o styles.min.css` e `npx terser script.js -o script.min.js --compress --mangle`.
- Solo modifiche HTML o documentali non richiedono minificazione. Prima di commit/deploy verificare che i minificati siano allineati ai sorgenti.
- Nessuna suite di test, lint o transpilation configurata nel contesto Kiro. Non dichiarare verifiche non eseguite.
- Per verificare percorsi assoluti, redirect e pagine secondarie usare un server statico dalla root, ad esempio `python3 -m http.server 8000` oppure `npx serve .`.
- Per modifiche visive o interattive verificare le pagine interessate su desktop e mobile, inclusi navigazione, console e caricamento risorse. Non effettuare acquisti o inviare contatti reali durante le prove.

## Comunicazione

- Preferenza ereditata da [caveman.md](../.kiro/steering/caveman.md): risposte molto concise, senza convenevoli o ripetizioni; abbreviazioni tecniche e frasi brevi quando comprensibili.
- Conservare dettagli tecnici, errori esatti, incertezze rilevanti e risultati delle verifiche. Esplicitare avvisi di sicurezza e conferme per azioni irreversibili.
- Codice, documentazione, commit e PR mantengono stile normale. Tornare allo stile normale anche nelle risposte quando l'utente lo richiede, incluso con `stop caveman` o `normal mode`.

## Fonti

- [Prodotto](../.kiro/steering/product.md), [tecnologie](../.kiro/steering/tech.md), [struttura](../.kiro/steering/structure.md).
- Per contenuti, immagini e indicizzazione applicare le [istruzioni SEO](instructions/seo.instructions.md), adattate dal [contesto SEO Kiro](../.kiro/steering/seo.md).