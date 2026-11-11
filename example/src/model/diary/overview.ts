import type { AnimalPhotoKind } from '../../ui/kit/AnimalPhoto';
import type { DiaryCategoryCode } from './categories';
import { ABNORMAL_SYMPTOMS } from './abnormal';
import { BEHAVIOR_CODES } from './behavior';
import { josa } from './detail';
import { MEASURE_KIND_LABEL, MEASURE_UNIT, type MeasureKind } from './measure';
import type { RecordChart } from './records';

export type OverviewPeriod = 'day' | 'week' | 'month';

export const OVERVIEW_PERIODS: { value: OverviewPeriod; label: string }[] = [
  { value: 'day', label: '일간 보기' },
  { value: 'week', label: '주간 보기' },
  { value: 'month', label: '월간 보기' },
];

/** 넓은 창 모아보기 오른쪽 칸 기간 전환 — 짧은 이름 */
export const OVERVIEW_PERIOD_SEGMENTS: { value: OverviewPeriod; label: string }[] = [
  { value: 'day', label: '일간' },
  { value: 'week', label: '주간' },
  { value: 'month', label: '월간' },
];

export const PERIOD_COUNT = 5;

export const OVERVIEW_TEXT = {
  title: '모아보기',
  changePet: '변경',
  album: '사진첩',
  export: '내보내기',
  search: '검색',
  petSheetTitle: '반려동물 변경',
  weightTitle: (name: string) => `${name}의 몸무게 변화`,
  sections: {
    todo: '할일 진행률',
    behavior: '행동·버릇',
    walk: '산책 기록',
    play: '놀이 기록',
    food: '식사량',
    water: '물 섭취량',
    abnormal: '이상 증상',
    poopee: '대소변',
    measure: '측정 값',
    price: '소비금액',
  },
  pieDescription: { day: '5일간의 기록이에요', week: '5주간의 기록이에요', month: '5개월간의 기록이에요' } as Record<OverviewPeriod, string>,
  labels: { duration: '시간', distance: '거리', calories: '칼로리', feces: '대변', fecesShape: '대변모양', urine: '소변' },
  fasting: '금식',
  sectionA11y: (title: string) => `${title} 기록 목록 보기`,
  todo: { goal: '목표', achieved: '달성', noGoal: '목표 없음', assignee: '담당' },
  empty: { recordAction: '기록하기' },
  weightGoal: {
    remaining: (target: string, left: string) => `목표 ${target}kg까지 ${left}kg 남았어요`,
    reached: (target: string) => `목표 ${target}kg에 닿았어요`,
    speedGood: (kg: string) => `최근 몇 주 동안 일주일에 ${kg}kg씩 줄었어요. 알맞은 속도예요.`,
    goodPace: (min: string, max: string) => `알맞은 속도는 일주일에 ${min}~${max}kg(몸무게의 1~2%)이에요.`,
  },
  behavior: {
    period: (weeks: number) => `최근 ${weeks}주`,
    thisWeek: '이번 주',
    recentLegend: (weeks: number) => `지난 ${weeks}주`,
    thisWeekLegend: '이번 주(오늘까지)',
    trainingLegend: '연습한 주',
    othersMore: (count: number) => `외 ${count}개 행동`,
    cardA11y: '우리 아이 행동 관리 열기',
  },
};

export type OverviewEmptyKind = 'weight' | 'todo' | 'activity' | 'food' | 'water' | 'abnormal' | 'feces';

export const OVERVIEW_EMPTY: Record<OverviewEmptyKind, { category: DiaryCategoryCode; title: string }> = {
  weight: { category: 'weight', title: '단 1g도\n소중하니까' },
  todo: { category: 'todo', title: '할일을 추가하고\n매주 잊지 말고 관리해요.' },
  activity: { category: 'walk', title: '오늘도 반려동물과\n신나게 놀았다면' },
  food: { category: 'feed', title: '오늘은 어떤 걸\n먹었나요?' },
  water: { category: 'feed', title: '하루동안 얼마나\n마시는지 궁금하다면?' },
  abnormal: { category: 'abnormal', title: '작은 변화라도\n놓치면 안돼요!' },
  feces: { category: 'poopee', title: '장 건강 빠르게\n알아보려면?' },
};

const DAY_MS = 24 * 60 * 60 * 1000;
const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const startOfWeek = (date: Date) => {
  const day = startOfDay(date);
  return new Date(day.getFullYear(), day.getMonth(), day.getDate() - day.getDay());
};

export function periodStarts(period: OverviewPeriod, now: Date): Date[] {
  return Array.from({ length: PERIOD_COUNT }, (_, index) => {
    const back = PERIOD_COUNT - 1 - index;
    if (period === 'week') {
      const week = startOfWeek(now);
      return new Date(week.getFullYear(), week.getMonth(), week.getDate() - back * 7);
    }
    if (period === 'month') return new Date(now.getFullYear(), now.getMonth() - back, 1);
    const day = startOfDay(now);
    return new Date(day.getFullYear(), day.getMonth(), day.getDate() - back);
  });
}

export function periodLabel(date: Date, period: OverviewPeriod): string {
  if (period === 'week') {
    const week = startOfWeek(date);
    const firstWeek = startOfWeek(new Date(week.getFullYear(), week.getMonth(), 1));
    const nth = Math.round((week.getTime() - firstWeek.getTime()) / (7 * DAY_MS)) + 1;
    return `${week.getMonth() + 1}월${nth}주`;
  }
  if (period === 'month') return `${String(date.getFullYear()).slice(2)}년${date.getMonth() + 1}월`;
  // 몸무게·행동 차트와 같은 M/D — 좁은 화면에서 다섯 칸 라벨이 붙지 않게
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

const trim = (value: number): string => String(Math.round(value * 100) / 100);
export const withComma = (value: number): string => Math.round(value).toLocaleString('ko-KR');
export const formatKg = trim;

export type OverviewPetId = 'bori' | 'nabi';

export interface OverviewPet {
  id: OverviewPetId;
  name: string;
  photo: AnimalPhotoKind;
  sex: '남아' | '여아';
  birth: string;
}

export function petSubline(pet: OverviewPet, now: Date): string {
  const [year, month, day] = pet.birth.split('-').map(Number);
  let years = now.getFullYear() - year;
  let months = now.getMonth() + 1 - month;
  if (months < 0 || (months === 0 && now.getDate() < day)) {
    years -= 1;
    months += 12;
  }
  const age = `${years > 0 ? `${years}살 ` : ''}${months}개월`;
  return `${pet.sex} | ${age} (${pet.birth})`;
}

type Series = Record<OverviewPeriod, (number | null)[]>;

export interface OverviewSlice {
  code: string;
  count: number;
}

export interface OverviewTodo {
  id: string;
  name: string;
  actual: number;
  target: number;
  assignee?: string;
  members: { name: string; count: number }[];
  periods?: { rate: number; achieved: boolean }[];
}

export interface OverviewBehavior {
  code: string;
  weeks: number[];
  trainedWeeks: number[];
  barkMinutes?: { before: number; recent: number };
}

export interface OverviewMeasure {
  kind: Exclude<MeasureKind, 'OTHER' | 'BP'>;
  values: (number | null)[];
}

export interface PetOverview {
  pet: OverviewPet;
  weight: { records: { daysAgo: number; kg: number }[]; targetKg: number | null; weeklyLossKg: number | null } | null;
  todos: Record<OverviewPeriod, OverviewTodo[]>;
  behaviors: OverviewBehavior[];
  walk: { minutes: Series; km: Series } | null;
  play: Series | null;
  food: { grams: Series; kcal: Series; fastingDays: number[] } | null;
  water: Series | null;
  abnormal: Record<OverviewPeriod, OverviewSlice[]> | null;
  poopee: Record<OverviewPeriod, { feces: OverviewSlice[]; shape: OverviewSlice[]; urine: OverviewSlice[] }> | null;
  measure: Record<OverviewPeriod, OverviewMeasure[]> | null;
  price: Series | null;
}

const cells = (rates: number[]) => rates.map((rate) => ({ rate, achieved: rate >= 1 }));
const didCells = (done: number[]) => done.map((rate) => ({ rate, achieved: false }));

const BORI: PetOverview = {
  pet: { id: 'bori', name: '보리', photo: 'bori', sex: '남아', birth: '2023-04-12' },
  weight: {
    records: [
      { daysAgo: 35, kg: 7.4 },
      { daysAgo: 28, kg: 7.3 },
      { daysAgo: 21, kg: 7.15 },
      { daysAgo: 14, kg: 7.05 },
      { daysAgo: 7, kg: 6.95 },
      { daysAgo: 1, kg: 6.85 },
    ],
    targetKg: 6.5,
    weeklyLossKg: 0.11,
  },
  todos: {
    day: [
      { id: 'walk', name: '산책 시키기', actual: 2, target: 2, assignee: '아빠', members: [{ name: '아빠', count: 2 }] },
      { id: 'teeth', name: '양치하기', actual: 0, target: 1, members: [] },
      { id: 'brush', name: '빗질', actual: 1, target: 0, members: [{ name: '엄마', count: 1 }] },
    ],
    week: [
      { id: 'walk', name: '산책 시키기', actual: 12, target: 14, assignee: '아빠', members: [{ name: '아빠', count: 9 }, { name: '엄마', count: 3 }], periods: cells([1, 0.86, 1, 0.71, 0.86]) },
      { id: 'teeth', name: '양치하기', actual: 4, target: 7, members: [{ name: '엄마', count: 4 }], periods: cells([0.43, 0.57, 1, 0.29, 0.57]) },
      { id: 'brush', name: '빗질', actual: 3, target: 0, members: [{ name: '엄마', count: 2 }, { name: '아빠', count: 1 }], periods: didCells([1, 0, 1, 1, 1]) },
    ],
    month: [
      { id: 'walk', name: '산책 시키기', actual: 52, target: 60, assignee: '아빠', members: [{ name: '아빠', count: 38 }, { name: '엄마', count: 14 }], periods: cells([0.95, 1, 0.9, 1, 0.87]) },
      { id: 'teeth', name: '양치하기', actual: 18, target: 30, members: [{ name: '엄마', count: 18 }], periods: cells([0.5, 0.63, 0.7, 0.57, 0.6]) },
      { id: 'brush', name: '빗질', actual: 11, target: 0, members: [{ name: '엄마', count: 8 }, { name: '아빠', count: 3 }], periods: didCells([1, 1, 1, 1, 1]) },
    ],
  },
  behaviors: [
    { code: 'd01', weeks: [9, 11, 8, 10, 7, 5, 4, 2], trainedWeeks: [4, 5, 6], barkMinutes: { before: 6, recent: 3 } },
    { code: 'd15', weeks: [4, 3, 5, 4, 3, 4, 3, 1], trainedWeeks: [] },
  ],
  walk: {
    minutes: { day: [35, 48, null, 52, 40], week: [210, 265, 240, 300, 180], month: [980, 1120, 1050, 1210, 640] },
    km: { day: [1.8, 2.4, null, 2.7, 2.1], week: [10.5, 13.2, 12.1, 15.4, 9.2], month: [48.2, 55.1, 51.7, 60.3, 31.5] },
  },
  play: { day: [20, 15, 30, 10, 25], week: [120, 95, 140, 110, 75], month: [480, 520, 455, 600, 310] },
  food: {
    grams: { day: [180, 175, 0, 185, 170], week: [1240, 1210, 1190, 1225, 860], month: [5350, 5280, 5420, 5300, 2650] },
    kcal: { day: [612, 595, null, 629, 578], week: [4216, 4114, 4046, 4165, 2924], month: [18190, 17952, 18428, 18020, 9010] },
    fastingDays: [2],
  },
  water: { day: [420, 380, 450, 400, 360], week: [2850, 2700, 2930, 2800, 1950], month: [12100, 11800, 12500, 12200, 6100] },
  abnormal: {
    day: [{ code: 'a001', count: 2 }, { code: 'a003', count: 1 }],
    week: [{ code: 'a001', count: 4 }, { code: 'a003', count: 3 }, { code: 'a006', count: 2 }],
    month: [{ code: 'a001', count: 7 }, { code: 'a003', count: 5 }, { code: 'a006', count: 4 }, { code: 'a008', count: 2 }],
  },
  poopee: {
    day: {
      feces: [{ code: '초콜릿색', count: 6 }, { code: '노란색', count: 1 }],
      shape: [{ code: '정상변1', count: 5 }, { code: '설사1', count: 2 }],
      urine: [{ code: '투명한 노랑', count: 9 }, { code: '진노란색', count: 2 }],
    },
    week: {
      feces: [{ code: '초콜릿색', count: 28 }, { code: '노란색', count: 4 }, { code: '녹색', count: 2 }],
      shape: [{ code: '정상변1', count: 22 }, { code: '정상변2', count: 8 }, { code: '설사1', count: 4 }],
      urine: [{ code: '투명한 노랑', count: 41 }, { code: '진노란색', count: 9 }],
    },
    month: {
      feces: [{ code: '초콜릿색', count: 120 }, { code: '노란색', count: 14 }, { code: '녹색', count: 6 }],
      shape: [{ code: '정상변1', count: 92 }, { code: '정상변2', count: 30 }, { code: '설사1', count: 12 }, { code: '건조1', count: 6 }],
      urine: [{ code: '투명한 노랑', count: 170 }, { code: '진노란색', count: 35 }, { code: '주황색', count: 5 }],
    },
  },
  measure: {
    day: [
      { kind: 'TEMP', values: [38.6, null, 38.9, null, 38.5] },
      { kind: 'HR', values: [92, 88, null, 96, 90] },
    ],
    week: [
      { kind: 'TEMP', values: [38.7, 38.6, 38.8, 38.6, 38.5] },
      { kind: 'HR', values: [94, 91, 90, 93, 89] },
      { kind: 'GLUCOSE', values: [null, 98, null, 104, null] },
    ],
    month: [
      { kind: 'TEMP', values: [38.6, 38.7, 38.6, 38.7, 38.6] },
      { kind: 'HR', values: [95, 93, 92, 91, 90] },
      { kind: 'GLUCOSE', values: [101, 99, 103, 100, 104] },
    ],
  },
  price: { day: [0, 12000, 0, 35000, 4500], week: [42000, 18500, 76000, 25000, 51500], month: [184000, 152000, 230500, 167000, 98000] },
};

const NABI: PetOverview = {
  pet: { id: 'nabi', name: '나비', photo: 'nabi', sex: '여아', birth: '2021-08-03' },
  weight: {
    records: [
      { daysAgo: 60, kg: 4.1 },
      { daysAgo: 30, kg: 4.2 },
      { daysAgo: 3, kg: 4.2 },
    ],
    targetKg: null,
    weeklyLossKg: null,
  },
  todos: { day: [], week: [], month: [] },
  behaviors: [],
  walk: null,
  play: null,
  food: {
    grams: { day: [62, 60, 65, null, 58], week: [430, 425, 440, 410, 250], month: [1850, 1820, 1900, 1870, 940] },
    kcal: { day: [242, 234, 254, null, 226], week: [1677, 1658, 1716, 1599, 975], month: [7215, 7098, 7410, 7293, 3666] },
    fastingDays: [],
  },
  water: null,
  abnormal: null,
  poopee: null,
  measure: null,
  price: null,
};

export const OVERVIEW_PETS: OverviewPet[] = [BORI.pet, NABI.pet];

export async function fetchOverview(petId: OverviewPetId): Promise<PetOverview> {
  await new Promise((resolve) => setTimeout(resolve, 250));
  return petId === 'nabi' ? NABI : BORI;
}

export const hasValues = (values: (number | null)[] | undefined): values is (number | null)[] => !!values && values.some((value) => (value ?? 0) > 0);

export function weightChart(overview: PetOverview, now: Date): RecordChart | null {
  if (!overview.weight || overview.weight.records.length === 0) return null;
  const today = startOfDay(now).getTime();
  return {
    label: OVERVIEW_TEXT.weightTitle(overview.pet.name),
    unit: 'kg',
    points: overview.weight.records.map((record) => ({ at: new Date(today - record.daysAgo * DAY_MS), value: record.kg })),
  };
}

export function weightGoal(overview: PetOverview): { text: string; progress: number; speed: string | null } | null {
  const weight = overview.weight;
  if (!weight || weight.targetKg === null) return null;
  const first = weight.records[0].kg;
  const latest = weight.records[weight.records.length - 1].kg;
  const left = Math.abs(latest - weight.targetKg);
  const reached = left < 0.05;
  const progress = reached ? 1 : Math.min(1, Math.max(0, (first - latest) / (first - weight.targetKg)));
  const speed =
    weight.weeklyLossKg !== null && weight.targetKg < latest
      ? `${OVERVIEW_TEXT.weightGoal.speedGood(formatKg(weight.weeklyLossKg))} ${OVERVIEW_TEXT.weightGoal.goodPace(formatKg(latest * 0.01), formatKg(latest * 0.02))}`
      : null;
  return {
    text: reached ? OVERVIEW_TEXT.weightGoal.reached(formatKg(weight.targetKg)) : OVERVIEW_TEXT.weightGoal.remaining(formatKg(weight.targetKg), formatKg(left)),
    progress,
    speed,
  };
}

export function todoRows(todos: OverviewTodo[]): (OverviewTodo & { rate: number })[] {
  const progress = (todo: OverviewTodo) => (todo.target > 0 ? Math.min(1, todo.actual / todo.target) : 0);
  return todos
    .filter((todo) => todo.actual > 0 || todo.target > 0)
    .sort((a, b) => progress(b) - progress(a) || Number(b.target > 0) - Number(a.target > 0))
    .map((todo) => ({ ...todo, rate: todo.target > 0 ? progress(todo) : todo.actual > 0 ? 1 : 0 }));
}

export function todoCountText(todo: OverviewTodo, period: OverviewPeriod): { count: string; meta: string } {
  const hasGoal = todo.target > 0;
  const count = hasGoal ? `${todo.actual}/${todo.target}회` : `${todo.actual}회`;
  if (!hasGoal) return { count, meta: OVERVIEW_TEXT.todo.noGoal };
  if (period !== 'day' && todo.periods) return { count, meta: `${OVERVIEW_TEXT.todo.achieved} ${todo.periods.filter((cell) => cell.achieved).length}/${todo.periods.length}` };
  return { count, meta: `${OVERVIEW_TEXT.todo.goal} ${todo.target}회` };
}

export const COMPARE_WEEKS = 2;

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

export function behaviorSummary(behavior: OverviewBehavior) {
  const done = behavior.weeks.slice(0, -1);
  const recent = sum(done.slice(-COMPARE_WEEKS));
  const before = sum(done.slice(-COMPARE_WEEKS * 2, -COMPARE_WEEKS));
  const label = BEHAVIOR_CODES[behavior.code]?.label ?? behavior.code;
  const state = recent < before * 0.8 ? 'down' : recent > before * 1.2 ? 'up' : 'same';
  const headline =
    state === 'same' ? `${label}${josa(label, '은', '는')} 비슷해요` : `${label}${josa(label, '이', '가')} ${state === 'down' ? '줄었어요' : '늘었어요'}`;
  return {
    label,
    headline,
    basis: `지난 ${COMPARE_WEEKS}주 ${recent}회 · 그 앞 ${COMPARE_WEEKS}주 ${before}회`,
    minutes: behavior.barkMinutes ? `짖은 시간 한 번 평균 ${behavior.barkMinutes.before}분 → ${behavior.barkMinutes.recent}분` : null,
  };
}

export const POOPEE_COLOR: Record<string, string> = {
  초콜릿색: '#633535',
  녹색: '#49A559',
  노란색: '#FFE14A',
  '피 섞인 변': '#FF4A4A',
  검은색: '#000000',
  보라색: '#A13681',
  '투명한 노랑': '#FFE9B5',
  진노란색: '#FFFF00',
  주황색: '#FFC94A',
  분홍색: '#FF9A9A',
  붉은색: '#FF4A4A',
  '진한 갈색': '#AB4040',
  푸른색: '#63CCD4',
};

export const symptomLabel = (code: string): string => ABNORMAL_SYMPTOMS.find((symptom) => symptom.code === code)?.label ?? code;

export const measureName = (kind: OverviewMeasure['kind']): string => MEASURE_KIND_LABEL[kind];
export const measureUnit = (kind: OverviewMeasure['kind']): string => MEASURE_UNIT[kind];
