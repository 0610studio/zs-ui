import type { AnimalPhotoKind } from '../../ui/kit/AnimalPhoto';

export const PET_NAME = '보리';

export type StickerValue = string;
export const DEFAULT_STICKER: StickerValue = 'n';

export type StickerTab = 'image' | 'emoji';
export const STICKER_TABS: { value: StickerTab; label: string }[] = [
  { value: 'image', label: '그림' },
  { value: 'emoji', label: '이모지' },
];

export const STICKER_EMOJI_GROUPS = [
  {
    title: '먹기',
    items: [
      { emoji: '🍚', name: '밥' }, { emoji: '🥩', name: '고기' }, { emoji: '🍗', name: '닭고기' }, { emoji: '🐟', name: '생선' }, { emoji: '🥚', name: '달걀' },
      { emoji: '🥕', name: '채소' }, { emoji: '🍎', name: '과일' }, { emoji: '🍠', name: '고구마' }, { emoji: '🍼', name: '분유' }, { emoji: '💧', name: '물' },
    ],
  },
  {
    title: '건강',
    items: [
      { emoji: '🌡️', name: '체온' }, { emoji: '🤒', name: '아파요' }, { emoji: '🤕', name: '다쳤어요' }, { emoji: '🤧', name: '재채기' }, { emoji: '🤮', name: '토했어요' },
      { emoji: '👁️', name: '눈' }, { emoji: '👃', name: '코' }, { emoji: '🐛', name: '구충' }, { emoji: '🧴', name: '바르는 약' },
    ],
  },
  {
    title: '놀기·나들이',
    items: [
      { emoji: '🧸', name: '인형' }, { emoji: '🥏', name: '원반' }, { emoji: '🧶', name: '털실' }, { emoji: '📦', name: '상자' }, { emoji: '🌳', name: '공원' },
      { emoji: '🌸', name: '꽃구경' }, { emoji: '🏖️', name: '바다' }, { emoji: '🏕️', name: '캠핑' }, { emoji: '❄️', name: '눈 온 날' }, { emoji: '☔', name: '비 온 날' },
    ],
  },
  {
    title: '기분·특별한 날',
    items: [
      { emoji: '😊', name: '좋아요' }, { emoji: '😍', name: '사랑해' }, { emoji: '😆', name: '신나요' }, { emoji: '😴', name: '졸려요' }, { emoji: '😢', name: '슬퍼요' },
      { emoji: '😡', name: '화나요' }, { emoji: '😰', name: '무서워요' }, { emoji: '🎂', name: '생일' }, { emoji: '🎉', name: '기념일' }, { emoji: '🎁', name: '선물' },
      { emoji: '⭐', name: '칭찬' },
    ],
  },
] as const;

export const STICKER_EMOJI_MAX_LENGTH = 20;

const PICTOGRAPHIC = (() => {
  try {
    return new RegExp('\\p{Extended_Pictographic}', 'u');
  } catch {
    return null;
  }
})();

export function pickCustomEmoji(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const segments = typeof Intl !== 'undefined' && 'Segmenter' in Intl ? Array.from(new Intl.Segmenter('ko', { granularity: 'grapheme' }).segment(trimmed), (part) => part.segment) : Array.from(trimmed);
  const last = segments[segments.length - 1] ?? '';
  if (!last || last.length > STICKER_EMOJI_MAX_LENGTH) return null;
  if (PICTOGRAPHIC && !PICTOGRAPHIC.test(last)) return null;
  return last;
}

export interface FootprintPlace {
  id: string;
  name: string;
  detail: string;
  x: number;
  y: number;
}

export const FOOTPRINT_PLACES: readonly FootprintPlace[] = [
  { id: 'park', name: '동네 공원 산책로', detail: '집에서 걸어서 5분', x: 0.32, y: 0.42 },
  { id: 'river', name: '강변 잔디밭', detail: '자전거 길 옆 넓은 풀밭', x: 0.68, y: 0.62 },
  { id: 'vet', name: '단골 동물병원 앞', detail: '건널목 건너 두 번째 건물', x: 0.54, y: 0.28 },
  { id: 'yard', name: '우리 집 앞 화단', detail: '현관 오른쪽 작은 화단', x: 0.22, y: 0.7 },
];

export interface MediaItem {
  id: string;
  kind: AnimalPhotoKind;
}

export interface DiaryCommonForm {
  recordedAt: Date;
  sticker: StickerValue;
  memo: string;
  footprint: FootprintPlace | null;
  price: string;
  media: MediaItem[];
}

export const createCommonForm = (now: Date = new Date()): DiaryCommonForm => ({
  recordedAt: now,
  sticker: DEFAULT_STICKER,
  memo: '',
  footprint: null,
  price: '',
  media: [],
});

export const formatRecordDate = (date: Date): string => `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;

export const formatRecordTime = (date: Date): string => {
  const hours = date.getHours();
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hours < 12 ? '오전' : '오후'} ${hour12}시 ${String(date.getMinutes()).padStart(2, '0')}분`;
};

export const formatRecordDateTimeFrom = (date: Date, base: Date): string =>
  date.toDateString() === base.toDateString() ? formatRecordTime(date) : `${date.getMonth() + 1}월${date.getDate()}일 ${formatRecordTime(date)}`;

export const sanitizeDigits = (text: string): string => text.replace(/[^0-9]/g, '').replace(/^0+(?=\d)/, '');

export const sanitizeDecimal = (text: string): string => {
  const cleaned = text.replace(/,/g, '.').replace(/[^0-9.]/g, '');
  const [whole, ...rest] = cleaned.split('.');
  return rest.length ? `${whole}.${rest.join('')}` : whole;
};

export const trimDecimal = (text: string): string => {
  let value = text.trim();
  if (value.endsWith('.')) value = value.slice(0, -1);
  if (value.startsWith('.')) value = `0${value}`;
  return value;
};

export const formatPrice = (digits: string): string => (digits ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '');

export const SAVED_MESSAGE = '정상적으로 저장되었어요';
export const NOT_IN_EXAMPLE_MESSAGE = '예제에는 없는 화면이에요';
export const END_BEFORE_START_MESSAGE = '종료 시간은 시작 시간 이후여야 해요.';

export async function saveDiaryRecord(category: string, at: Date): Promise<{ id: string }> {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return { id: `${category}-${at.getTime()}` };
}
