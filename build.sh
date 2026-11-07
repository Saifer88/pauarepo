#!/usr/bin/env bash
# build.sh — Minifica CSS e JS per la produzione e aggiorna il cache-busting
# Uso: ./build.sh
#
# Filename di output STABILI: styles.min.css e script.min.js (mai cambiano).
# Il cache-busting ?v= è un hash del contenuto: cambia SOLO quando il file
# minificato cambia davvero. Così non devi mai modificare index.html a mano
# e la cache del browser resta corretta dopo ogni deploy.

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

# ==> Cache-busting basato sull'hash del contenuto (primi 10 char dello sha256).
# Stesso contenuto => stesso ?v= => index.html non cambia.
hash_of() {
    if command -v shasum >/dev/null 2>&1; then
        shasum -a 256 "$1" | cut -c1-10
    else
        sha256sum "$1" | cut -c1-10
    fi
}

CSS_VER="$(hash_of styles.min.css)"
JS_VER="$(hash_of script.min.js)"
echo "==> Cache-busting: css v=$CSS_VER, js v=$JS_VER ..."

# macOS (BSD sed) richiede l'argomento vuoto dopo -i
SED_INPLACE=(-i '')
# Su Linux (GNU sed) usa -i senza argomento
if sed --version >/dev/null 2>&1; then
    SED_INPLACE=(-i)
fi

# Tutte le pagine che usano gli asset minificati
PAGES=(index.html fitness-aziendale/index.html)
for page in "${PAGES[@]}"; do
    [ -f "$page" ] || continue
    sed "${SED_INPLACE[@]}" -E "s#(styles\.min\.css\?v=)[^\"']*#\1${CSS_VER}#g" "$page"
    sed "${SED_INPLACE[@]}" -E "s#(script\.min\.js\?v=)[^\"']*#\1${JS_VER}#g" "$page"
done

echo "==> Build completata. (css v=$CSS_VER, js v=$JS_VER)"
