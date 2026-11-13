#!/usr/bin/env bash
# Renders every area animation in all colour versions into out/areas/<area>/.
# Usage (from the animacion folder):  bash scripts/render-areas.sh [area-slug ...]
set -u
AREAS=("$@")
if [ ${#AREAS[@]} -eq 0 ]; then
  AREAS=(estrategias-tecnologicas apoyos-academicos gestion-del-conocimiento
         desarrollo-automatizaciones-ti virtualizacion-academica cursos-libres coordinacion)
fi
fail=0
for a in "${AREAS[@]}"; do
  d="out/areas/$a"; mkdir -p "$d"; base="$d/uifce-$a-animacion"
  r() { npx remotion render src/index.ts "$@" --overwrite --log=error >/dev/null 2>&1 || { echo "FALLO: $*"; fail=1; }; }
  r "Area-$a-lavanda" "$base.mp4" --codec h264 --crf 16
  r "Area-$a-blanco" "$base-fondo-blanco.mp4" --codec h264 --crf 16
  r "Area-$a-negro" "$base-fondo-negro.mp4" --codec h264 --crf 16
  r "Area-$a-transparente" "$base-transparente.mov" --codec prores --prores-profile 4444 --image-format png --pixel-format yuva444p10le
  r "Area-$a-transparente" "$base-transparente.webm" --codec vp9 --image-format png --pixel-format yuva420p
  echo "listo: $a"
done
exit $fail
