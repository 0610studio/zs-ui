import type { IntentOptions, TypoColorOptions } from './types';

/**
 * variant 별 텍스트 색상 토큰 (intent 단위 예외값 포함).
 * ZSBlockButton · ZSChip 등 intent 기반 컴포넌트가 공유한다.
 */
export const SOLID_TEXT_COLOR: Record<IntentOptions, TypoColorOptions> = {
  primary: 'white',
  danger: 'white',
  information: 'white',
  success: 'white',
  // 노랑(warning.50) 배경 위 흰 텍스트는 대비가 부족해 검정 사용
  warning: 'black',
  grey: 'white',
};

export const PASTEL_TEXT_COLOR: Record<IntentOptions, TypoColorOptions> = {
  primary: 'primary.60',
  danger: 'danger.60',
  information: 'information.60',
  success: 'success.60',
  warning: 'warning.60',
  grey: 'grey.70',
};

export const STROKE_TEXT_COLOR: Record<IntentOptions, TypoColorOptions> = {
  primary: 'primary.50',
  danger: 'danger.50',
  information: 'information.50',
  success: 'success.50',
  warning: 'warning.60',
  grey: 'grey.60',
};
