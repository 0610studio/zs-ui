#!/usr/bin/env bash
set -uo pipefail

POSTURE="$1"
DEVICE="${2:-emulator-5554}"
DIR="$(cd "$(dirname "$0")/.." && pwd)"
MAESTRO="${MAESTRO:-$HOME/.maestro/bin/maestro}"
LOG_DIR="${LOG_DIR:-$DIR/.maestro/artifacts/logs/android-$1-$(date +%Y%m%d_%H%M%S)}"
mkdir -p "$LOG_DIR"

COMMON=(
  "zscalendar-datepicker.yaml" "zscalendar-responsive.yaml"
  "lab/environment.yaml" "lab/foldable-lab.yaml" "lab/sdk58-smoke.yaml" "lab/safe-area.yaml" "lab/keyboard.yaml" "lab/header-toolbar.yaml"
  "lab/overlay-container-smoke.yaml" "lab/bottomsheet-dismissible.yaml" "lab/bottomsheet-bottom.yaml"
  "lab/appearance-sync.yaml -e SYSTEM=light -e LABEL=android" "lab/zs-tab-navigator.yaml"
)
# 달력 심화는 넓은 창에서 달력 | 기록 2열(주간 전환 끔)이다 — 한 열 동작은 접힌 화면에서만 본다
SINGLE_PANE_CALENDAR=(
  "zscalendar.yaml" "zscalendar-week.yaml" "zscalendar-month-context.yaml" "zscalendar-fps.yaml" "lab/calendar-gestures.yaml"
)
case "$POSTURE" in
  open)
    adb -s "$DEVICE" emu unfold >/dev/null
    # bar-axis 는 세로 바로 끝나므로 맨 앞에 둬 저장된 barAxis 설정과 상관없이 시작한다
    FLOWS=("lab/bar-axis.yaml -e MODE_V=rail -e MODE_H=bar -e INSETS_V=52/0/32/0 -e INSETS_H=52/0/32/0 -e LABEL=open"
      "${COMMON[@]}" "zscalendar-split.yaml"
      "lab/window-layout.yaml -e WIDTH_CLASS_PORTRAIT=medium -e WIDTH_CLASS_LANDSCAPE=medium"
      "lab/readable-content.yaml -e READABLE_PORTRAIT=640 -e READABLE_LANDSCAPE=640 -e FIXED_LANDSCAPE=600 -e NONE_LANDSCAPE=832 -e LABEL=open"
      "lab/pane-layout.yaml -e SPLIT_PORTRAIT=true -e PRIMARY_PORTRAIT=300 -e SECONDARY_PORTRAIT=426 -e PRIMARY_ROLE=primary -e PRIMARY_PORTRAIT_CLASS=compact -e SECONDARY_PORTRAIT_CLASS=compact -e SPLIT_LANDSCAPE=true -e PRIMARY_LANDSCAPE=323 -e SECONDARY_LANDSCAPE=485 -e LANDSCAPE_ROLE=primary -e PRIMARY_LANDSCAPE_CLASS=compact -e SECONDARY_LANDSCAPE_CLASS=compact -e HALF_PRIMARY=404 -e HALF_SECONDARY=404 -e HALF_CLASS=compact -e LABEL=open"
      "lab/tabs-stack.yaml -e MODE=rail -e LABEL=open"
      "lab/tabs-stack-keyboard.yaml -e MODE=rail"
      "zscalendar-foldable.yaml -e PLACEMENT=side -e MODE=rail -e LABEL=open"
    ) ;;
  folded)
    adb -s "$DEVICE" emu fold >/dev/null
    FLOWS=("lab/bar-axis.yaml -e MODE_V=bar -e MODE_H=bar -e INSETS_V=58/0/24/0 -e INSETS_H=58/0/24/0 -e LABEL=folded"
      "${COMMON[@]}" "${SINGLE_PANE_CALENDAR[@]}"
      "lab/window-layout.yaml -e WIDTH_CLASS_PORTRAIT=compact -e WIDTH_CLASS_LANDSCAPE=expanded"
      "lab/readable-content.yaml -e READABLE_PORTRAIT=411 -e READABLE_LANDSCAPE=640 -e FIXED_LANDSCAPE=600 -e NONE_LANDSCAPE=902 -e LABEL=folded"
      "lab/pane-layout.yaml -e SPLIT_PORTRAIT=false -e PRIMARY_PORTRAIT=411 -e PRIMARY_ROLE=single -e PRIMARY_PORTRAIT_CLASS=compact -e SPLIT_LANDSCAPE=true -e PRIMARY_LANDSCAPE=351 -e SECONDARY_LANDSCAPE=527 -e LANDSCAPE_ROLE=primary -e PRIMARY_LANDSCAPE_CLASS=compact -e SECONDARY_LANDSCAPE_CLASS=compact -e HALF_PRIMARY=439 -e HALF_SECONDARY=439 -e HALF_CLASS=compact -e LABEL=folded"
      "lab/tabs-stack.yaml -e MODE=bar -e LABEL=folded"
      "lab/tabs-stack-keyboard.yaml -e MODE=bar"
      "zscalendar-foldable.yaml -e PLACEMENT=inline -e MODE=bar -e LABEL=folded"
    ) ;;
  *) echo "usage: $0 <open | folded> [device]" >&2; exit 2 ;;
esac
sleep 4

pass=0; fail=0; failed=()
for spec in "${FLOWS[@]}"; do
  read -r flow args <<<"$spec"
  if "$MAESTRO" --device "$DEVICE" test $args "$DIR/.maestro/$flow" >"$LOG_DIR/${flow//\//_}.log" 2>&1; then
    pass=$((pass + 1)); echo "PASS $flow"
  else
    fail=$((fail + 1)); failed+=("$flow"); echo "FAIL $flow"
  fi
  "$MAESTRO" --device "$DEVICE" test "$DIR/.maestro/common/reset-portrait.yaml" >/dev/null 2>&1 || true
done
echo "logs: $LOG_DIR"
echo "$POSTURE: $pass passed, $fail failed ${failed[*]:-}"
[[ $fail -eq 0 ]]
