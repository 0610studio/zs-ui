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

/** 간격 스케일(4pt 격자) — xxs 아이콘·글자 · xs 묶음 안 · sm 칩·목록 항목 사이 · md 카드 안쪽 · lg 카드 사이 · xl 섹션 사이 · xxl·xxxl 큰 구획 · screen 화면 좌우 여백 */
export const SPACING = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  screen: 16,
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
