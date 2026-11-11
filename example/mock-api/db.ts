import type { CalendarEvent } from '@0610studio/zs-ui';
import { addDays, addMonths } from '@0610studio/zs-ui';

export type DiaryCategory =
  | 'memo'
  | 'poopee'
  | 'weight'
  | 'medical'
  | 'feed'
  | 'walk'
  | 'todo'
  | 'play'
  | 'measure'
  | 'alarm'
  | 'abnormal';

export type StickerCode = 'walk' | 'fod' | 'fec' | 'hosp' | 'ply' | 'wei' | 'memo' | 'chek' | 'clock' | 'abno' | 'heart';

export interface DiaryKeyValue {
  key: string;
  value: string;
}

export interface DiaryEntry {
  category: DiaryCategory;
  time: string;
  memo: string;
  writer?: string;
  sticker?: StickerCode;
  keyValues: DiaryKeyValue[];
  price?: number;
  auto?: boolean;
}

export interface DiaryCategoryMeta {
  code: DiaryCategory;
  label: string;
  color: string;
  sticker: StickerCode;
}

export const DIARY_CATEGORIES: readonly DiaryCategoryMeta[] = [
  { code: 'walk', label: '산책', color: '#D7B8FF', sticker: 'walk' },
  { code: 'feed', label: '급여', color: '#A7DBD1', sticker: 'fod' },
  { code: 'poopee', label: '대소변', color: '#FFD164', sticker: 'fec' },
  { code: 'weight', label: '체중', color: '#FFC8C8', sticker: 'wei' },
  { code: 'medical', label: '병원', color: '#FF9761', sticker: 'hosp' },
  { code: 'play', label: '놀이', color: '#d955ba', sticker: 'ply' },
  { code: 'memo', label: '메모', color: '#AFF581', sticker: 'memo' },
  { code: 'todo', label: '할일', color: '#D2E6FF', sticker: 'chek' },
  { code: 'measure', label: '측정', color: '#78eef0', sticker: 'heart' },
  { code: 'alarm', label: '알람', color: '#637381', sticker: 'clock' },
  { code: 'abnormal', label: '이상증상', color: '#CECECE', sticker: 'abno' },
];

export const categoryMeta = (code: DiaryCategory): DiaryCategoryMeta =>
  DIARY_CATEGORIES.find((meta) => meta.code === code) ?? DIARY_CATEGORIES[0];

const MEMOS = [
  '평소보다 컨디션이 좋았다',
  '사료를 절반만 먹음',
  '산책 중에 비를 만남',
  '새 장난감에 관심을 보임',
  '발톱을 정리했다',
  '오늘은 유난히 잠이 많았다. 낮에 두 번이나 깨워도 다시 잠들었고, 저녁 산책은 짧게 다녀왔다. 밥은 평소만큼 먹었고 물도 잘 마셨다. 내일도 비슷하면 병원에 한번 물어봐야겠다.',
  '',
  '',
];

const WRITERS = ['엄마', '아빠', '동생', undefined, undefined, undefined];
const FEEDS = ['로얄캐닌 인도어', '오리젠 오리지널', '힐스 어덜트', '나우 프레시 스몰브리드'];
const MEDICAL_SUBJECTS = ['예방접종', '피부', '치과', '정기검진', '안과'];
const TODOS = ['귀 청소', '발톱 정리', '양치', '빗질', '눈물 자국 닦기'];

function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const seedOfMonth = (year: number, month: number): number => year * 100 + month;

const pick = <T,>(random: () => number, list: readonly T[]): T => list[Math.floor(random() * list.length)];
const between = (random: () => number, min: number, max: number): number => min + Math.floor(random() * (max - min + 1));
const pad2 = (n: number): string => String(n).padStart(2, '0');

function buildEntry(random: () => number, meta: DiaryCategoryMeta): DiaryEntry {
  const base: DiaryEntry = {
    category: meta.code,
    time: `${pad2(between(random, 6, 22))}:${pad2(between(random, 0, 11) * 5)}`,
    memo: pick(random, MEMOS),
    writer: pick(random, WRITERS),
    sticker: random() < 0.75 ? meta.sticker : undefined,
    keyValues: [],
  };

  switch (meta.code) {
    case 'walk':
      return {
        ...base,
        keyValues: [
          { key: '시간', value: `${between(random, 15, 70)}분` },
          { key: '거리', value: `${(between(random, 8, 45) / 10).toFixed(1)}km` },
        ],
      };
    case 'feed': {
      const gram = between(random, 30, 90);
      return {
        ...base,
        keyValues: [
          { key: '급여', value: pick(random, FEEDS) },
          { key: '급여량', value: `${gram}g` },
          { key: '칼로리', value: `${(gram * 3.75).toFixed(2)}kcal` },
          { key: '음수량', value: `${between(random, 6, 30) * 10}ml` },
        ],
        price: random() < 0.25 ? between(random, 18, 65) * 1000 : undefined,
      };
    }
    case 'poopee':
      return {
        ...base,
        keyValues: [
          { key: '소변', value: pick(random, ['정상', '연한 노랑', '진한 노랑']) },
          { key: '대변', value: `${pick(random, ['갈색', '황갈색', '짙은 갈색'])}(${pick(random, ['정상', '단단함', '무른 편'])})` },
        ],
      };
    case 'weight':
      return { ...base, keyValues: [{ key: '무게', value: `${(between(random, 32, 68) / 10).toFixed(1)}kg` }] };
    case 'medical':
      return {
        ...base,
        keyValues: [
          { key: '진료 과목', value: pick(random, MEDICAL_SUBJECTS) },
          { key: '검사', value: pick(random, ['혈액 검사', '엑스레이', '초음파', '피부 스크래핑']) },
        ],
        price: between(random, 25, 180) * 1000,
      };
    case 'play':
      return { ...base, keyValues: [{ key: '시간', value: `${between(random, 5, 40)}분` }] };
    case 'memo':
      return { ...base, memo: base.memo || pick(random, MEMOS.slice(0, 6)) };
    case 'todo':
      return {
        ...base,
        keyValues: TODOS.filter(() => random() < 0.5)
          .slice(0, 3)
          .map((name) => ({ key: name, value: '' })),
      };
    case 'measure':
      return {
        ...base,
        keyValues: [
          { key: '호흡수', value: `${between(random, 18, 34)}회/분` },
          { key: '심박수', value: `${between(random, 70, 130)}회/분` },
        ],
      };
    case 'alarm':
      return {
        ...base,
        memo: '',
        keyValues: [{ key: '반복', value: pick(random, ['매일', '매주 월·수·금', '한 번만']) }],
        auto: true,
      };
    case 'abnormal':
      return {
        ...base,
        keyValues: [{ key: pick(random, ['구토', '기침', '설사']), value: `${between(random, 1, 3)}회` }],
      };
    default:
      return base;
  }
}

export function generateMonthEvents(year: number, month: number): CalendarEvent<DiaryEntry>[] {
  const random = createRandom(seedOfMonth(year, month));
  const total = 100 + Math.floor(random() * 61);
  const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = Number(addDays(addMonths(monthStart, 1), -1).slice(8));
  const events: CalendarEvent<DiaryEntry>[] = [];

  for (let i = 0; i < total; i += 1) {
    const day = 1 + Math.floor(random() * lastDay);
    const meta = pick(random, DIARY_CATEGORIES);
    const date = addDays(monthStart, day - 1);
    events.push({
      id: `${date}-${i}`,
      date,
      color: meta.color,
      data: buildEntry(random, meta),
    });
  }

  return events.sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    const ta = a.data?.time ?? '';
    const tb = b.data?.time ?? '';
    return ta < tb ? -1 : ta > tb ? 1 : 0;
  });
}

export function generateRangeEvents(startDate: string, endDate: string): CalendarEvent<DiaryEntry>[] {
  const events: CalendarEvent<DiaryEntry>[] = [];
  let cursor = `${startDate.slice(0, 7)}-01`;
  const guard = `${endDate.slice(0, 7)}-01`;

  for (let i = 0; i < 48; i += 1) {
    const year = Number(cursor.slice(0, 4));
    const month = Number(cursor.slice(5, 7));
    events.push(...generateMonthEvents(year, month).filter((e) => e.date >= startDate && e.date <= endDate));
    if (cursor === guard) break;
    cursor = addMonths(cursor, 1);
  }

  return events;
}
