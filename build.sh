#!/usr/bin/env bash
# build.sh — Minifica CSS e JS per la produzione
# Uso: ./build.sh

set -e

echo "==> Minificazione CSS..."
npx clean-css-cli styles.css -o styles.min.css

echo "==> Minificazione JS..."
npx terser script.js -o script.min.js --compress --mangle

echo "==> Build completata."
