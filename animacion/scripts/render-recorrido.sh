#!/usr/bin/env bash
# Renders the unit logo animation → reel visiting all 7 areas (long version) into out/unidad-recorrido/.
# Usage (from the animacion folder):  bash scripts/render-recorrido.sh
set -u
d="out/unidad-recorrido"; mkdir -p "$d"; base="$d/uifce-unidad-recorrido-areas"
fail=0
r() { npx remotion render src/index.ts "$@" --overwrite --log=error >/dev/null 2>&1 || { echo "FALLO: $*"; fail=1; }; }
r UnidadRecorrido-lavanda "$base.mp4" --codec h264 --crf 16
r UnidadRecorrido-blanco "$base-fondo-blanco.mp4" --codec h264 --crf 16
r UnidadRecorrido-negro "$base-fondo-negro.mp4" --codec h264 --crf 16
r UnidadRecorrido-transparente "$base-transparente.mov" --codec prores --prores-profile 4444 --image-format png --pixel-format yuva444p10le
r UnidadRecorrido-transparente "$base-transparente.webm" --codec vp9 --image-format png --pixel-format yuva420p
echo "listo"
exit $fail
