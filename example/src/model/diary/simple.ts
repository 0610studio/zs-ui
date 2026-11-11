export const WEIGHT_MESSAGES = {
  required: '몸무게를 입력해주세요.',
  invalid: '몸무게는 숫자와 . 만 입력해주세요.',
};

export function validateWeight(kg: string): string | null {
  if (!kg) return WEIGHT_MESSAGES.required;
  if (!/^[0-9.]+$/.test(kg)) return WEIGHT_MESSAGES.invalid;
  return null;
}

export const PLAY_MESSAGES = {
  required: '놀이 시간을 입력해주세요.',
  invalid: '놀이 시간은 숫자만 입력해주세요.',
};

export function validatePlay(minutes: string): string | null {
  if (!minutes) return PLAY_MESSAGES.required;
  if (!/^[0-9]+$/.test(minutes)) return PLAY_MESSAGES.invalid;
  return null;
}
