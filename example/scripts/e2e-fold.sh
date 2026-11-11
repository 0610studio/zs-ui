#!/usr/bin/env bash
set -euo pipefail

FLOW="$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"
shift
STAGES=("${@:-}")
[[ -z "${STAGES[0]}" ]] && STAGES=(open folded reopened)
DEVICE="${DEVICE:-emulator-5554}"
APP=kr.co.studio0610.zsui.example
MAESTRO="${MAESTRO:-$HOME/.maestro/bin/maestro}"

adbs() { adb -s "$DEVICE" "$@"; }
hinge() { adbs emu sensor set hinge-angle0 "$1" >/dev/null; }
rotation() { adbs shell cmd window user-rotation lock "$1"; }

enter() {
  case "$1" in
    open | reopened) adbs emu unfold >/dev/null; hinge 180; rotation 0 ;;
    folded) adbs emu fold >/dev/null ;;
    half) adbs emu unfold >/dev/null; rotation 0; hinge 90 ;;
    tabletop) adbs emu unfold >/dev/null; rotation 1; sleep 2; hinge 90 ;;
    *) echo "unknown stage: $1" >&2; exit 2 ;;
  esac
  sleep 4
  echo "[$1] $(adbs shell cmd device_state state | head -1)"
}

reset() { adbs emu unfold >/dev/null; hinge 180; rotation 0; }
trap reset EXIT

if [[ "$(adbs shell settings get global display_features)" == "null" ]]; then
  echo "WARN: display_features not set — FoldingFeature 가 오지 않는다 (머리 주석의 전제 참고)" >&2
fi

before=""
for stage in "${STAGES[@]}"; do
  enter "$stage"
  flow_step=verify
  [[ -z "$before" ]] && flow_step=setup
  flow_args=(-e STEP="$flow_step" -e POSTURE="$stage")
  [[ -n "${SCENARIO:-}" ]] && flow_args+=(-e SCENARIO="$SCENARIO")
  "$MAESTRO" --device "$DEVICE" test "${flow_args[@]}" "$FLOW"
  if [[ "${SCENARIO:-}" == visual && "$(basename "$FLOW")" == foldable-state.yaml ]]; then
    python3 "$(dirname "$0")/assert-frame.py" "$DEVICE" lab-visual-frame --square --above lab-visual-footer
  fi
  if [[ -z "$before" ]]; then before="$(adbs shell pidof "$APP")"; fi
done

after="$(adbs shell pidof "$APP")"

echo "PID before=$before after=$after"
if [[ "$before" != "$after" ]]; then
  echo "FAIL: app process was recreated" >&2
  exit 1
fi
echo "PASS: $(basename "$FLOW") — ${STAGES[*]}"
