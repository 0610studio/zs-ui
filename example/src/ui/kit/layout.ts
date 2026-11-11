import type { TextStyle, ViewStyle } from 'react-native';

/**
 * 예제 화면 간격(pt·dp) — 라이브러리 내부 `SPACE` 와 같은 4pt 격자.
 * `SPACE` 는 공개 토큰이 아니라서 예제는 같은 값을 따로 둔다.
 */
export const GAP = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
} as const;

/** 화면 좌우 여백 — D′ §6 */
export const PAGE_INSET = GAP.xl;

/** 묶음 안 행의 글자 시작 — 구분선도 여기서 시작한다(D′ §6) */
export const ROW_INSET = GAP.lg;

/**
 * 묶음 구분선·정보 띠 선 굵기 — D′ §6 은 1px(= 1pt) 이다.
 * hairlineWidth(3x 화면 0.33pt)는 border / surface2 대비 1.23:1 에서 거의 보이지 않는다.
 */
export const RULE = 1;

/** 묶음 행 높이 — 설정 52 · 폼 56 · 두 줄(일정·예제 목록) 64 (D′ §6) */
export const ROW_HEIGHT = { single: 52, form: 56, double: 64 } as const;

/** 예제 화면 본문(ZSScreen style) — 흰 페이지 위 묶음 사이 24 */
export const PAGE_CONTENT: ViewStyle = {
  paddingHorizontal: PAGE_INSET,
  paddingTop: GAP['2xl'],
  paddingBottom: GAP['3xl'] + GAP.lg,
  gap: GAP['2xl'],
};

/**
 * 넓은 창의 모달 화면(목록·검색·추가 폼) 한 열 최대 폭 — Material 3 시트 최대 폭 640.
 * Android 모달은 창 전체를 덮어 목록·입력칸이 전폭으로 늘어나지 않게 한다(넓은 화면 품질 기준). 좁은 창은 전폭
 */
export const MODAL_MAX_WIDTH = 640;

/** 날짜·시간·몸무게·나이·연락처 숫자 — 고정폭(D′ §4 숫자 규칙) */
export const TABULAR: TextStyle = { fontVariant: ['tabular-nums'] };
