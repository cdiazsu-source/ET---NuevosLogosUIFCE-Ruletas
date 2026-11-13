#!/usr/bin/env bash
# Exporta fichas/<área>.html a fichas/pdf/ con Edge sin interfaz (Windows). Sirve el repo en un puerto local.
set -eu
cd "$(dirname "$0")/.."
EDGE="${EDGE:-/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe}"
python -m http.server 8799 --bind 127.0.0.1 >/dev/null 2>&1 & SRV=$!; trap 'kill $SRV' EXIT; sleep 1
mkdir -p fichas/pdf
for f in fichas/*.html; do
  s=$(basename "$f" .html); [ "$s" = index ] && continue
  "$EDGE" --headless=new --disable-gpu --no-pdf-header-footer --virtual-time-budget=5000 \
    --print-to-pdf="$(cygpath -w "$PWD")\fichas\pdf\ficha-uifce-$s.pdf" "http://127.0.0.1:8799/fichas/$s.html" 2>/dev/null
  echo "pdf: $s"
done
