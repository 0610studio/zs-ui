/** 곡률 스케일 — xs 체크박스 · sm/md 버튼 · lg 입력·카드 · xl 스낵바 · xxl 다이얼로그 · sheet 바텀시트 */
export const RADIUS = {
  xs: 4,
  sm: 6,
  md: 12,
  lg: 14,
  xl: 16,
  xxl: 22,
  sheet: 26,
  pill: 9999,
} as const;

/** duration(ms) — press 눌림·퇴장 · fast 포커스 · base 상태 전환 · slow 이동 · enter 오버레이 진입 */
export const DURATION = {
  press: 100,
  fast: 150,
  base: 200,
  slow: 250,
  enter: 300,
} as const;

export const DISABLED_OPACITY = 0.7;
