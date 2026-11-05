#!/usr/bin/env bash
# build.sh — Minifica CSS e JS per la produzione e aggiorna il cache-busting
# Uso: ./build.sh

set -e

# Permette di saltare il fetch di npx se i tool sono installati globalmente.
# Se "clean-css" e "terser" esistono nel PATH vengono usati direttamente
# (più veloce); altrimenti si ricade su "npx" che li scarica al volo.
if command -v cleancss >/dev/null 2>&1; then
    CSS_MIN=(cleancss styles.css -o styles.min.css)
else
    CSS_MIN=(npx --yes clean-css-cli styles.css -o styles.min.css)
fi

if command -v terser >/dev/null 2>&1; then
    JS_MIN=(terser script.js -o script.min.js --compress --mangle)
else
    JS_MIN=(npx --yes terser script.js -o script.min.js --compress --mangle)
fi

echo "==> Minificazione CSS..."
"${CSS_MIN[@]}"

echo "==> Minificazione JS..."
"${JS_MIN[@]}"

# ==> Cache-busting automatico: aggiorna ?v= in index.html
# Versione = data+ora (YYYYMMDD-HHMM), univoca a ogni build.
VERSION="$(date +%Y%m%d-%H%M)"
echo "==> Aggiorno cache-busting a v=$VERSION ..."

# macOS (BSD sed) richiede l'argomento vuoto dopo -i
SED_INPLACE=(-i '')
# Su Linux (GNU sed) usa -i senza argomento
if sed --version >/dev/null 2>&1; then
    SED_INPLACE=(-i)
fi

sed "${SED_INPLACE[@]}" -E "s#(styles\.min\.css\?v=)[^\"']*#\1${VERSION}#g" index.html
sed "${SED_INPLACE[@]}" -E "s#(script\.min\.js\?v=)[^\"']*#\1${VERSION}#g" index.html

echo "==> Build completata. (assets v=$VERSION)"
