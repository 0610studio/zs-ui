/** 컴포넌트 공통 곡률 스케일 */
export const RADIUS = {
  /** 체크박스 등 소형 요소 */
  xs: 4,
  /** 소형 버튼 */
  sm: 6,
  /** 중형 버튼 (Alert 버튼 등) */
  md: 12,
  /** 입력 필드 · 카드 */
  lg: 14,
  /** 스낵바 · pressed 배경 */
  xl: 16,
  /** 다이얼로그 컨테이너 */
  xxl: 22,
  /** 바텀시트 */
  sheet: 26,
  /** 완전한 pill/원형 */
  pill: 9999,
} as const;

/** 애니메이션 duration 공통 스케일 (ms) */
export const DURATION = {
  /** press in/out · 오버레이 퇴장 */
  press: 100,
  /** 입력 필드 포커스 등 빠른 전환 */
  fast: 150,
  /** 상태 전환 기본값 (칩 선택, 스위치 등) */
  base: 200,
  /** 이동 애니메이션 (세그먼트 thumb, 스낵바 등) */
  slow: 250,
  /** 오버레이 진입 */
  enter: 300,
} as const;

/** disabled 상태 공통 투명도 */
export const DISABLED_OPACITY = 0.5;
