#!/usr/bin/env bash
# Renders the slot reel beside the wordmark, landing on each area, into out/slot-reel/<area>/.
# Usage (from the animacion folder):  bash scripts/render-reel.sh [area-slug ...]
set -u
AREAS=("$@")
if [ ${#AREAS[@]} -eq 0 ]; then
  AREAS=(estrategias-tecnologicas apoyos-academicos gestion-del-conocimiento
         desarrollo-automatizaciones-ti virtualizacion-academica cursos-libres coordinacion)
fi
fail=0
for a in "${AREAS[@]}"; do
  d="out/slot-reel/$a"; mkdir -p "$d"; base="$d/uifce-ruleta-$a"
  r() { npx remotion render src/index.ts "$@" --overwrite --log=error >/dev/null 2>&1 || { echo "FALLO: $*"; fail=1; }; }
  r "SlotReelLogo-$a-lavanda" "$base.mp4" --codec h264 --crf 16
  r "SlotReelLogo-$a-blanco" "$base-fondo-blanco.mp4" --codec h264 --crf 16
  r "SlotReelLogo-$a-negro" "$base-fondo-negro.mp4" --codec h264 --crf 16
  r "SlotReelLogo-$a-transparente" "$base-transparente.mov" --codec prores --prores-profile 4444 --image-format png --pixel-format yuva444p10le
  r "SlotReelLogo-$a-transparente" "$base-transparente.webm" --codec vp9 --image-format png --pixel-format yuva420p
  echo "listo: $a"
done
exit $fail
