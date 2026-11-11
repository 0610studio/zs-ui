import type { DateString } from '@0610studio/zs-ui';
import type { AnimalPhotoKind } from '../ui/kit/AnimalPhoto';

export type PetType = 'dog' | 'cat' | 'small' | 'other';
export type PetGender = 'male' | 'female';
export type PetHair = 'long' | 'short';
export type PetNeuter = 'yes' | 'no';
export type CareCondition = 'HEART' | 'KIDNEY' | 'JOINT' | 'SKIN' | 'DIABETES' | 'NONE';
export type WeightUnit = 'kg' | 'g';

export interface PetBreed {
  id: number;
  name: string;
}

export interface PetRegisterForm {
  photo: AnimalPhotoKind | null;
  name: string;
  type: PetType | null;
  gender: PetGender | null;
  registerNo: string;
  birth: DateString | null;
  weightKg: string;
  breed: PetBreed | null;
  careConditions: CareCondition[];
  hair: PetHair | null;
  neuter: PetNeuter | null;
}

export const EMPTY_FORM: PetRegisterForm = {
  photo: null,
  name: '',
  type: null,
  gender: null,
  registerNo: '',
  birth: null,
  weightKg: '',
  breed: null,
  careConditions: [],
  hair: null,
  neuter: null,
};

export const STEPS = ['필수정보', '선택정보', '완료 🎉'] as const;

export const TYPE_OPTIONS: { value: PetType; label: string }[] = [
  { value: 'dog', label: '강아지' },
  { value: 'cat', label: '고양이' },
  { value: 'small', label: '소동물' },
  { value: 'other', label: '기타' },
];
export const GENDER_OPTIONS: { value: PetGender; label: string }[] = [
  { value: 'male', label: '남아' },
  { value: 'female', label: '여아' },
];
export const HAIR_OPTIONS: { value: PetHair; label: string }[] = [
  { value: 'long', label: '장모' },
  { value: 'short', label: '단모' },
];
export const NEUTER_OPTIONS: { value: PetNeuter; label: string }[] = [
  { value: 'yes', label: '완료' },
  { value: 'no', label: '미완료' },
];

export const hasBreed = (type: PetType | null): type is 'dog' | 'cat' => type === 'dog' || type === 'cat';

export const VALIDATION = {
  nameRequired: '반려동물 이름은 필수 항목입니다.',
  nameMinLength: '이름은 최소 2글자 이상이어야 합니다.',
  nameMaxLength: '이름은 최대 6글자 이하여야 합니다.',
  typeRequired: '반려동물 종류는 필수 항목입니다.',
  genderRequired: '반려동물 성별은 필수 항목입니다.',
  weightRange: '체중은 0보다 크고 1000kg보다 작게 입력해 주세요.',
} as const;

export function validateName(name: string): string | undefined {
  const trimmed = name.trim();
  if (!trimmed) return VALIDATION.nameRequired;
  if (trimmed.length < 2) return VALIDATION.nameMinLength;
  if (trimmed.length > 6) return VALIDATION.nameMaxLength;
  return undefined;
}

export const CARE_CONDITIONS: CareCondition[] = ['HEART', 'KIDNEY', 'JOINT', 'SKIN', 'DIABETES', 'NONE'];
export const CARE_CONDITION_LABEL: Record<CareCondition, string> = {
  HEART: '심장',
  KIDNEY: '신장',
  JOINT: '관절',
  SKIN: '피부',
  DIABETES: '당뇨',
  NONE: '없음',
};
export const CARE_CONDITIONS_HINT = '기록을 나눠 보기 위한 표시예요. 여러 개 고를 수 있어요.';

export function toggleCareCondition(current: CareCondition[], code: CareCondition): CareCondition[] {
  if (code === 'NONE') return current.includes('NONE') ? [] : ['NONE'];
  const withoutNone = current.filter((c) => c !== 'NONE');
  return withoutNone.includes(code) ? withoutNone.filter((c) => c !== code) : [...withoutNone, code];
}

export const careConditionsText = (codes: CareCondition[]) =>
  CARE_CONDITIONS.filter((code) => codes.includes(code)).map((code) => CARE_CONDITION_LABEL[code]).join(', ');

export const PET_WEIGHT_KG_LIMIT = 1000;

export function sanitizeDecimal(text: string): string {
  const cleaned = text.replace(/[^0-9.]/g, '');
  const [whole, ...rest] = cleaned.split('.');
  return rest.length > 0 ? `${whole}.${rest.join('')}` : (whole ?? '');
}

const trimDecimal = (text: string) => text.replace(/\.$/, '');

export function toDisplayWeight(kg: string, unit: WeightUnit): string {
  if (!kg || unit === 'kg') return kg;
  const grams = Number(trimDecimal(kg)) * 1000;
  return Number.isFinite(grams) ? String(Math.round(grams * 1000) / 1000) : '';
}

export function toKgWeight(text: string, unit: WeightUnit): string {
  const value = sanitizeDecimal(text);
  if (!value || unit === 'kg') return value;
  const kg = Number(trimDecimal(value)) / 1000;
  return Number.isFinite(kg) ? String(Math.round(kg * 1e6) / 1e6) : '';
}

export function isValidWeightKg(input: string): boolean {
  const trimmed = trimDecimal(sanitizeDecimal(input));
  if (!trimmed) return true;
  const kg = Math.round(Number(trimmed) * 1000) / 1000;
  return Number.isFinite(kg) && kg > 0 && kg < PET_WEIGHT_KG_LIMIT;
}

export const UNKNOWN_BREED: PetBreed = { id: 235, name: '모름' };

const BREEDS: Record<'dog' | 'cat', PetBreed[]> = {
  dog: [
    '말티즈', '푸들', '포메라니안', '시츄', '비숑 프리제', '치와와', '요크셔 테리어', '진돗개', '골든 리트리버', '래브라도 리트리버',
    '웰시 코기', '닥스훈트', '보더 콜리', '시바견', '프렌치 불도그', '비글', '슈나우저', '사모예드', '믹스견',
  ].map((name, index) => ({ id: 100 + index, name })),
  cat: [
    '코리안 숏헤어', '러시안 블루', '페르시안', '브리티시 숏헤어', '스코티시 폴드', '먼치킨', '랙돌', '샴', '아비시니안', '노르웨이 숲',
    '메인쿤', '벵갈', '스핑크스', '터키시 앙고라', '믹스묘',
  ].map((name, index) => ({ id: 200 + index, name })),
};

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function fetchBreeds(type: 'dog' | 'cat'): Promise<PetBreed[]> {
  await wait(400);
  return BREEDS[type];
}

let registeredCount = 0;
export async function registerPet(form: PetRegisterForm): Promise<{ isFirstPet: boolean }> {
  await wait(800);
  if (!form.name) throw new Error('이름이 없어요');
  registeredCount += 1;
  return { isFirstPet: registeredCount === 1 };
}
