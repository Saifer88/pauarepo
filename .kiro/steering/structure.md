# Project Structure

```
/
├── index.html          # Single-page website (all sections)
├── styles.css          # All custom styles (CSS custom properties + Bootstrap overrides)
├── script.js           # All interactivity (navbar, lightbox, reviews, scroll, forms)
├── reviews.json        # Client testimonials data (array of {author, comment})
├── images/             # All static assets
│   ├── hero-bg.jpg
│   ├── paola-portrait.jpg
│   ├── paola_personal.jpeg
│   ├── logo.svg / logo.png / logo-white.svg / logo-icon.svg
│   ├── gallery-*.jpg/jpeg/png   # Gallery images (numbered 1-10)
│   ├── map-via-tanzi.jpg
│   └── README.md
├── .github/workflows/  # GitHub Actions (empty, placeholder)
└── README.md
```

## Key Patterns

- **Single-page layout**: All content lives in `index.html` organized by `<section>` elements with IDs matching nav anchors (`#chi-sono`, `#servizi`, `#metodo`, `#galleria`, `#risultati`, `#pacchetti`, `#contatti`)
- **Data separation**: Testimonials are externalized in `reviews.json` and loaded via `fetch()` at runtime
- **CSS organization**: Styles are grouped by comment-delimited sections (navbar, hero, sections, cards, gallery, pricing, responsive breakpoints)
- **JS organization**: Functions grouped by feature (navbar scroll, smooth scroll, lightbox, reviews, scroll reveal, service→package linking, cookie banner, WhatsApp form)
- **Images**: Flat directory, no subdirectories. Gallery images follow `gallery-{n}.{ext}` naming convention
