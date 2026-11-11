#!/usr/bin/env bash
set -uo pipefail

DEVICE="$1"
DIR="$(cd "$(dirname "$0")/.." && pwd)"
MAESTRO="${MAESTRO:-$HOME/.maestro/bin/maestro}"
LOG_DIR="${LOG_DIR:-$DIR/.maestro/artifacts/logs/ios-$(date +%Y%m%d_%H%M%S)}"
mkdir -p "$LOG_DIR"

# bar-axis 는 세로 바로 끝나므로 맨 앞에 둬 저장된 barAxis 설정과 상관없이 시작한다
FLOWS=(
  "lab/bar-axis.yaml -e INSETS_V=116/0/83/0 -e INSETS_H=116/0/83/0 -e LABEL=ios"
  "zscalendar.yaml" "zscalendar-week.yaml" "zscalendar-month-context.yaml" "zscalendar-datepicker.yaml"
  "zscalendar-responsive.yaml" "zscalendar-fps.yaml"
  "lab/environment.yaml" "lab/foldable-lab.yaml" "lab/sdk58-smoke.yaml" "lab/safe-area.yaml" "lab/keyboard.yaml" "lab/header-toolbar.yaml"
  "lab/overlay-container-smoke.yaml" "lab/bottomsheet-dismissible.yaml" "lab/bottomsheet-bottom.yaml" "lab/calendar-gestures.yaml"
  "lab/appearance-sync.yaml -e SYSTEM=light -e LABEL=ios" "lab/zs-tab-navigator.yaml"
  "lab/window-layout.yaml -e WIDTH_CLASS_PORTRAIT=compact -e WIDTH_CLASS_LANDSCAPE=compact"
  "lab/readable-content.yaml -e READABLE_PORTRAIT=402 -e READABLE_LANDSCAPE=750 -e FIXED_LANDSCAPE=750 -e NONE_LANDSCAPE=750 -e LABEL=ios"
  "lab/pane-layout.yaml -e SPLIT_PORTRAIT=false -e PRIMARY_PORTRAIT=402 -e PRIMARY_ROLE=single -e PRIMARY_PORTRAIT_CLASS=compact -e SPLIT_LANDSCAPE=false -e PRIMARY_LANDSCAPE=750 -e LANDSCAPE_ROLE=single -e PRIMARY_LANDSCAPE_CLASS=compact -e LABEL=ios"
  "lab/tabs-stack.yaml -e MODE=bar -e LABEL=ios"
  "zscalendar-foldable.yaml -e PLACEMENT=inline -e MODE=bar -e LABEL=ios"
)

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
echo "ios: $pass passed, $fail failed ${failed[*]:-}"
[[ $fail -eq 0 ]]
