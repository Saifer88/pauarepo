---
description: "Usare per modifiche SEO, contenuti HTML, immagini, keyword, FAQ JSON-LD, canonical, sitemap e robots del sito Paola Mincuzzi."
applyTo: "**/*.html, sitemap.xml, robots.txt"
---

# SEO e contenuti

Fonte: [SEO Kiro](../../.kiro/steering/seo.md). Le precisazioni su struttura attuale e indicizzazione sotto evitano di propagare indicazioni obsolete.

## Keyword e metadati

- Preservare o migliorare la rilevanza dei contenuti per le keyword target:
  - personal trainer bari
  - paola mincuzzi personal trainer bari
  - allenamento funzionale bari
  - allenamento posturale bari
  - allenamento dopo i 40 Bari
  - personal trainer over 40
  - rimettersi in forma dopo i 35
- Mantenere keyword pertinenti in title, meta description, meta keywords esistenti e campi testuali JSON-LD. Non inserire forzatamente tutte le keyword in ogni pagina o alterare i valori previsti dagli schemi.
- In heading `h1`-`h3` e testo visibile, integrare servizio e localita naturalmente, senza keyword stuffing. Non rimuovere contenuti utili al posizionamento senza una sostituzione equivalente o migliore.
- Per `/fitness-aziendale/` preservare anche le keyword specifiche gia presenti, come fitness aziendale Bari, corsi fitness in azienda e ginnastica posturale ufficio.
- Aggiornare canonical e Open Graph in modo coerente con l'URL pubblico e il contenuto della pagina. Il dominio canonico attuale e `https://www.paolamincuzzi.it`.

## Pagine e indicizzazione

- Quando si aggiunge, rimuove o rinomina una pagina HTML, aggiornare `sitemap.xml` per gli URL pubblici indicizzabili. Aggiornare il `lastmod` della pagina modificata con la data corrente `YYYY-MM-DD`, non quello delle pagine intatte.
- Non aggiornare sitemap o `lastmod` per sole modifiche ai file di contesto.
- Conservare `/fitness-aziendale/` come URL pubblico e il redirect legacy da `fitness-aziendale.html`.
- Non aggiungere redirect o pagine `noindex` alla sitemap. Una priorita bassa non sostituisce `noindex`.
- Perche un crawler legga `noindex`, la pagina deve essere accessibile al crawler: non aggiungere automaticamente `Disallow` per ogni pagina `noindex`. Il redirect legacy aziendale deve restare scansionabile, come documentato in `robots.txt`.
- `grazie.html` ha gia `noindex, nofollow` e un blocco in `robots.txt`: non modificare questa configurazione incidentalmente; se la richiesta riguarda la sua indicizzazione, valutare esplicitamente l'interazione tra le due direttive.

## Immagini

- Usare nomi descrittivi in minuscolo separati da trattini, con keyword pertinenti; preferire WebP quando adatto.
- Quando si rinomina un'immagine, aggiornare tutti i riferimenti HTML e CSS.
- Alt text descrittivi, con Bari e servizio solo quando appropriati al contenuto. Le immagini decorative mantengono alt vuoto.

## Recupero funzionale e FAQ

Quando cambia una disfunzione trattata nella card Recupero Funzionale:

1. Aggiornare le keyword pertinenti, ad esempio `diastasi addominale Bari`.
2. Sincronizzare la FAQ corrispondente nel JSON-LD `FAQPage` e nella sezione FAQ visibile, anche in caso di rimozione.
3. Aggiornare la meta description se rilevante.
4. Verificare validita del JSON-LD e corrispondenza con i contenuti effettivamente visibili.