#!/usr/bin/env bash
set -euo pipefail

POSTURE="$1"
DEVICE="${2:-emulator-5554}"
DIR="$(cd "$(dirname "$0")/.." && pwd)"
MAESTRO="${MAESTRO:-$HOME/.maestro/bin/maestro}"

case "$POSTURE" in
  open)
    adb -s "$DEVICE" emu unfold >/dev/null
    SHEET=(--width 1680 --left 144) ;;
  folded)
    adb -s "$DEVICE" emu fold >/dev/null
    SHEET=(--width 1080 --left 0) ;;
  *) echo "usage: $0 <open | folded> [device]" >&2; exit 2 ;;
esac
sleep 4

fail=0
for target in alert sheet menu snackbar; do
  if ! "$MAESTRO" --device "$DEVICE" test -e ORIENTATION=PORTRAIT -e TARGET="$target" -e LABEL="$POSTURE" "$DIR/.maestro/lab/overlay-placement.yaml" >/dev/null; then
    echo "FAIL $target: overlay-placement flow"
    fail=1
    continue
  fi
  if [[ "$target" == sheet ]]; then
    python3 "$DIR/scripts/assert-frame.py" "$DEVICE" zs-bottom-sheet "${SHEET[@]}" --tolerance 2 || fail=1
  else
    echo "PASS $target: shown"
  fi
done
exit $fail
