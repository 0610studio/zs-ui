import { formatRecordDateTimeFrom } from './common';

export type FoodRegister = 'BASIC' | 'OWNER' | 'SHARED';

export interface FoodItem {
  uid: number;
  brand: string | null;
  name: string;
  register: FoodRegister;
  manufacturer: string | null;
  protein: number | null;
  fat: number | null;
  fiber: number | null;
  ash: number | null;
  water: number | null;
  phosphorus: number | null;
  calcium: number | null;
  kcal: number | null;
}

export const FOODS: FoodItem[] = [
  { uid: 1, brand: '숲속식탁', name: '연어 & 고구마 어덜트', register: 'BASIC', manufacturer: '숲속펫푸드', protein: 26, fat: 15, fiber: 3.5, ash: 7.5, water: 10, phosphorus: 0.9, calcium: 1.2, kcal: 372 },
  { uid: 2, brand: '숲속식탁', name: '오리 & 감자 그레인프리', register: 'BASIC', manufacturer: '숲속펫푸드', protein: 30, fat: 16, fiber: 4, ash: 8, water: 9, phosphorus: 1, calcium: 1.3, kcal: null },
  { uid: 3, brand: '해피테일', name: '퍼피 치킨 스타터', register: 'BASIC', manufacturer: '해피테일랩', protein: 32, fat: 20, fiber: 2.5, ash: 7, water: 10, phosphorus: 1.1, calcium: 1.4, kcal: 405 },
  { uid: 4, brand: '해피테일', name: '시니어 라이트 칠면조', register: 'BASIC', manufacturer: '해피테일랩', protein: 24, fat: 9, fiber: 6, ash: 6.5, water: 10, phosphorus: 0.7, calcium: 0.9, kcal: 330 },
  { uid: 5, brand: '바다정원', name: '흰살생선 습식 파우치', register: 'BASIC', manufacturer: '바다정원', protein: 10, fat: 4, fiber: 0.5, ash: 2, water: 80, phosphorus: 0.3, calcium: 0.4, kcal: 85 },
  { uid: 6, brand: '바다정원', name: '참치 & 단호박 캔', register: 'SHARED', manufacturer: null, protein: 11, fat: 3, fiber: 0.8, ash: 2.2, water: 79, phosphorus: null, calcium: null, kcal: null },
  { uid: 7, brand: null, name: '보리네 닭가슴살 화식', register: 'OWNER', manufacturer: null, protein: null, fat: null, fiber: null, ash: null, water: null, phosphorus: null, calcium: null, kcal: null },
];

export const RECENT_FOOD_UIDS = [1];

const normalize = (text: string) => text.replace(/\s/g, '').toLowerCase();
export const searchFoods = (query: string): FoodItem[] => {
  const keyword = normalize(query);
  return keyword ? FOODS.filter((food) => normalize(`${food.brand ?? ''}${food.name}`).includes(keyword)) : FOODS;
};

export const kcalPer100g = (food: FoodItem): number | null => {
  if (food.kcal) return food.kcal;
  const { protein, fat, fiber, water } = food;
  if (!protein || !fat || !fiber || !water) return null;
  const carb = 100 - (protein + fat + fiber + (food.ash ?? 6) + water);
  return protein * 3.5 + fat * 8.5 + carb * 3.5;
};

export const kcalPer10g = (food: FoodItem): number | null => {
  const kcal = kcalPer100g(food);
  return kcal === null ? null : Math.round(kcal) / 10;
};

export const nutritionTags = (food: FoodItem): string[] =>
  [
    food.manufacturer,
    food.protein ? `조단백질 ${food.protein}%` : null,
    food.fat ? `조지방 ${food.fat}%` : null,
    food.fiber ? `조섬유 ${food.fiber}%` : null,
    food.ash ? `조회분 ${food.ash}%` : null,
    food.water ? `수분 ${food.water}%` : null,
    food.phosphorus ? `인 ${food.phosphorus}%` : null,
    food.calcium ? `칼슘 ${food.calcium}%` : null,
  ].filter((tag): tag is string => !!tag);

export interface FeedEntry {
  key: string;
  food: FoodItem;
  gram: number;
  kcal: number | null;
}

export const entryKcal = (food: FoodItem, gram: number): number | null => {
  const kcal = kcalPer100g(food);
  return kcal === null ? null : Math.round(((kcal * gram) / 100) * 100) / 100;
};

export const feedSummary = (entries: FeedEntry[]) => ({
  names: entries.map((entry) => entry.food.name).join(', '),
  gram: entries.reduce((sum, entry) => sum + entry.gram, 0),
  kcal: entries.some((entry) => entry.kcal === null) ? 0 : Math.round(entries.reduce((sum, entry) => sum + (entry.kcal ?? 0), 0) * 100) / 100,
});

export const TARGET_WEIGHT_KG = 4.5;

export const dailyKcalRange = (targetKg: number, factor: [number, number] = [1, 1.2]): [number, number] => {
  const base = 70 * targetKg ** 0.75;
  return [Math.round((base * factor[0]) / 10) * 10, Math.round((base * factor[1]) / 10) * 10];
};

export const parseGram = (text: string): number | null => {
  const value = text.trim();
  if (!value) return 0;
  if (!/^[0-9.]+$/.test(value)) return null;
  const gram = Number(value);
  return Number.isFinite(gram) ? gram : null;
};

export type FastingWater = 'BLOCK' | 'ALLOW';
export type FastingReason = 'PRE_PROC' | 'GI' | 'VET' | 'ETC';

export const FASTING_WATER: { code: FastingWater; label: string }[] = [
  { code: 'BLOCK', label: '물도 금지' },
  { code: 'ALLOW', label: '물은 허용' },
];
export const FASTING_REASONS: { code: FastingReason; label: string }[] = [
  { code: 'PRE_PROC', label: '수술·검사 전' },
  { code: 'GI', label: '구토·설사' },
  { code: 'VET', label: '병원 지시' },
  { code: 'ETC', label: '기타' },
];

export interface FastingForm {
  end: Date | null;
  water: FastingWater;
  reason: FastingReason;
}
export const DEFAULT_FASTING: FastingForm = { end: null, water: 'BLOCK', reason: 'PRE_PROC' };

export const formatFastingEnd = (end: Date, start: Date): string => formatRecordDateTimeFrom(end, start);

export const FEED_TEXT = {
  switchLabel: '금식 기록',
  switchHint: '금식한 시간과 이유를 남겨요',
  fastingTarget: '금식',
  water: '음수량',
  waterPlaceholder: '음수량 입력',
  feed: '급여',
  feedAdd: '급여 제품 추가',
  caloriesTotal: (kcal: number) => `총 급여 칼로리는 ${Math.round(kcal)}kcal이에요.`,
  caloriesReference: (target: number, [min, max]: [number, number]) => `목표 ${target}kg 기준 하루 참고량은 약 ${min}~${max}kcal이에요.`,
  caloriesUnavailable: '칼로리 정보가 없어요!\n(미정보 사료 포함시 칼로리 계산이 되지 않아요.)',
  startTime: '시작 시간',
  endTime: '종료 시간',
  addTime: '시간 추가',
  fastingWater: '물',
  fastingReason: '이유',
};

export const FEED_LIST_TEXT = {
  title: '급여 제품 추가',
  add: '추가',
  searchLabel: '이름, 브랜드 입력',
  recentSearch: '최근 검색',
  listTitle: '사료 목록',
  emptyTitle: '등록된 사료가 없어요.',
  emptyDescription: '급여 정보를 직접 등록할 수 있어요.',
  manageButton: '우리집 급여 관리',
  customRegistered: '직접 등록',
  ownerBadge: '직접등록',
  sharedBadge: '공유',
  kcalPer10g: '10g당 칼로리 : ',
  noKcalInfo: '칼로리 정보 없음',
  weightLabel: '급여 무게 (g)',
  weightRequired: '급여 무게를 입력해주세요!',
  feedKcal: (kcal: number) => `급여 칼로리는 ${kcal}kcal이에요.`,
  noKcalCalculation: '칼로리 정보가 없어요!\n(해당 사료 포함시 칼로리 계산이 되지 않아요.)',
  weightNumberOnly: '급여무게는 숫자만 입력해주세요.',
};
