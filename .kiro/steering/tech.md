# Tech Stack

## Architecture
Static single-page website. No build system, bundler, or package manager. All files are served directly.

## Frontend
- **HTML5** — Single `index.html` file, semantic sections
- **CSS3** — Single `styles.css` file with CSS custom properties
- **JavaScript** — Vanilla JS in a single `script.js` file (no framework)

## External Dependencies (CDN)
- **Bootstrap 5.3.3** — Grid, components, utilities, modal, collapse, scrollspy
- **Bootstrap Icons 1.11.3** — Icon font
- **Google Fonts** — Playfair Display, Inter

## Payments
- **Stripe** — Checkout links for package purchases (hosted by Stripe)

## Conventions
- No build step required — open `index.html` directly or serve with any static server
- All JS is vanilla ES6+ (async/await, arrow functions, template literals, optional chaining)
- CSS uses custom properties (`:root` variables) for theming
- Bootstrap is used via CDN, not customized or compiled locally

## Common Commands
```bash
# Serve locally (any static server works)
python3 -m http.server 8000
# or
npx serve .
```

No compilation, transpilation, linting, or testing tooling is configured.
