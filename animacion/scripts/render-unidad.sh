#!/usr/bin/env bash
# Renders the unit logo animation → reel landing on Estrategias Tecnológicas into out/unidad-estrategias/.
# Usage (from the animacion folder):  bash scripts/render-unidad.sh
set -u
d="out/unidad-estrategias"; mkdir -p "$d"; base="$d/uifce-unidad-estrategias-tecnologicas"
fail=0
r() { npx remotion render src/index.ts "$@" --overwrite --log=error >/dev/null 2>&1 || { echo "FALLO: $*"; fail=1; }; }
r UnidadEstrategias-lavanda "$base.mp4" --codec h264 --crf 16
r UnidadEstrategias-blanco "$base-fondo-blanco.mp4" --codec h264 --crf 16
r UnidadEstrategias-negro "$base-fondo-negro.mp4" --codec h264 --crf 16
r UnidadEstrategias-transparente "$base-transparente.mov" --codec prores --prores-profile 4444 --image-format png --pixel-format yuva444p10le
r UnidadEstrategias-transparente "$base-transparente.webm" --codec vp9 --image-format png --pixel-format yuva420p
echo "listo"
exit $fail
