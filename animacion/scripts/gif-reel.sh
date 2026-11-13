#!/usr/bin/env bash
# GIFs of the slot reel beside the wordmark, landing on each area → out/slot-reel/<area>/.
# Usage (from the animacion folder):  bash scripts/gif-reel.sh [area-slug ...]
set -u
AREAS=("$@")
if [ ${#AREAS[@]} -eq 0 ]; then
  AREAS=(estrategias-tecnologicas apoyos-academicos gestion-del-conocimiento
         desarrollo-automatizaciones-ti virtualizacion-academica cursos-libres coordinacion)
fi
TMP="${TMPDIR:-${TEMP:-/tmp}}/uifce-reel-seq"
fail=0
for a in "${AREAS[@]}"; do
  rm -rf "$TMP/$a"
  for v in lavandaGif blanco negro transparente; do
    npx remotion render src/index.ts "SlotReelLogo-$a-$v" "$TMP/$a/$v" --sequence --image-format png \
      --scale 0.6667 --muted --overwrite --log=error >/dev/null 2>&1 || { echo "FALLO render $a $v"; fail=1; }
  done
  python -I scripts/make_gifs.py "$TMP/$a" "out/slot-reel/$a" "uifce-ruleta-$a" || fail=1
  rm -rf "$TMP/$a"
  echo "listo: $a"
done
exit $fail
