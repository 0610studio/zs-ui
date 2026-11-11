import type { AnimalPhotoKind } from '../../ui/kit/AnimalPhoto';
import type { SurveyAnswers } from './behaviorSurvey';
import type { DiaryCategoryCode } from './categories';
import { FOOTPRINT_PLACES, type FootprintPlace } from './common';
import type { FastingReason, FastingWater } from './feed';
import type { MeasureCondition, MeasureKind } from './measure';
import type { MedicalTest } from './medical';
import type { PoopeeKind } from './poopee';

export type RecordFileKind = 'photo' | 'video' | 'pdf';

export interface RecordFile {
  id: string;
  kind: RecordFileKind;
  photo: AnimalPhotoKind;
}

export interface RecordChart {
  label: string;
  unit: string;
  points: { at: Date; value: number }[];
}

export interface RecordWeather {
  tmp: string | null;
  sky: string;
  pty: string;
}

export interface RecordSurvey {
  answers: SurveyAnswers;
  previousId?: string;
  summary?: { key: string; value: string }[];
  windows: { pet: string; bark?: string; owner: string }[];
  worse?: boolean;
  recheck?: boolean;
}

export interface DiaryRecord {
  id: string;
  category: DiaryCategoryCode;
  at: Date;
  sticker: string;
  price: number;
  memo: string;
  fromHabit?: boolean;
  canEdit: boolean;
  footprint?: { place: FootprintPlace; onWalk?: boolean };
  files: RecordFile[];
  todo?: string[];
  poopee?: Partial<Record<PoopeeKind, string>>;
  abnormal?: { symptom: string; count: number; detail: string | null };
  medical?: { subjects: string[]; tests: Omit<MedicalTest, 'key'>[] };
  feed?: { water: string | null; kcal: string | null; foods: { name: string; gram: number }[] };
  fasting?: { end: Date | null; water: FastingWater; reason: FastingReason };
  charts?: RecordChart[];
  play?: { minutes: number };
  measure?: { kind: MeasureKind; value: string; second?: string; unit: string; name?: string; condition: MeasureCondition | null; partner?: string; legacy?: boolean };
  walk?: { end: Date | null; km: string | null; weather: RecordWeather | null; route: { x: number; y: number }[]; subRecordIds: string[] };
  behavior?: {
    kind: 'EVENT' | 'TRAINING' | 'NONE' | 'SURVEY';
    code: string;
    level?: string;
    minutes?: string;
    catCount?: string;
    situations?: string[];
    places?: string[];
    responses?: string[];
    methods?: string[];
    also?: string[];
    survey?: RecordSurvey;
  };
  petName?: string;
}

const at = (days: number, hours: number, minutes: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const hoursAgo = (hours: number): Date => {
  const date = new Date(Date.now() - hours * 60 * 60 * 1000);
  date.setMinutes(Math.floor(date.getMinutes() / 10) * 10, 0, 0);
  return date;
};

const place = (id: string): FootprintPlace => FOOTPRINT_PLACES.find((item) => item.id === id) ?? FOOTPRINT_PLACES[0];

const weekly = (values: number[], last: Date, stepDays = 7) =>
  values.map((value, index) => ({ at: new Date(last.getTime() - (values.length - 1 - index) * stepDays * 24 * 60 * 60 * 1000), value }));

const minutesAgo = (minutes: number): Date => {
  const date = new Date(Date.now() - minutes * 60 * 1000);
  date.setSeconds(0, 0);
  return date;
};

const WALK_START = minutesAgo(46);
const WALK_END = minutesAgo(18);
const WALK_ROUTE = [
  { x: 0.12, y: 0.7 },
  { x: 0.22, y: 0.6 },
  { x: 0.34, y: 0.56 },
  { x: 0.46, y: 0.44 },
  { x: 0.58, y: 0.4 },
  { x: 0.68, y: 0.48 },
  { x: 0.8, y: 0.42 },
  { x: 0.88, y: 0.3 },
];

const RECORDS: DiaryRecord[] = [
  {
    id: 'memo-park',
    category: 'memo',
    at: hoursAgo(1),
    sticker: 'dog',
    price: 0,
    memo: '오늘 공원에서 신나게 뛰었다! 🐶',
    canEdit: true,
    footprint: { place: place('park') },
    files: [
      { id: 'f1', kind: 'photo', photo: 'bori' },
      { id: 'f2', kind: 'photo', photo: 'somi' },
      { id: 'f3', kind: 'video', photo: 'nabi' },
      { id: 'f4', kind: 'photo', photo: 'kkami' },
      { id: 'f5', kind: 'photo', photo: 'bori' },
    ],
  },
  {
    id: 'memo-snack',
    category: 'memo',
    at: at(1, 17, 40),
    sticker: 'money',
    price: 8900,
    memo: '간식 구매',
    canEdit: false,
    files: [],
  },
  {
    id: 'todo-evening',
    category: 'todo',
    at: at(1, 18, 20),
    sticker: 'chek',
    price: 0,
    memo: '',
    fromHabit: true,
    canEdit: true,
    todo: ['산책 가기', '유산균 급여'],
    files: [],
  },
  {
    id: 'poopee-morning',
    category: 'poopee',
    at: hoursAgo(3),
    sticker: 'fec',
    price: 0,
    memo: '',
    canEdit: true,
    poopee: { urine: '투명한 노랑', feces: '초콜릿색', shape: '정상변1' },
    files: [{ id: 'f1', kind: 'photo', photo: 'bori' }],
  },
  {
    id: 'abnormal-cough',
    category: 'abnormal',
    at: at(2, 21, 10),
    sticker: 'abno',
    price: 0,
    memo: '마른 기침 두 번, 지켜보는 중',
    canEdit: true,
    abnormal: { symptom: 'a003', count: 2, detail: 'c001' },
    files: [],
  },
  {
    id: 'medical-checkup',
    category: 'medical',
    at: at(5, 14, 0),
    sticker: 'hosp',
    price: 55000,
    memo: '정기 검진',
    canEdit: true,
    footprint: { place: place('vet') },
    medical: {
      subjects: ['종합 백신', '심장사상충 예방'],
      tests: [
        { name: 'BUN', value: '27.6', unit: 'mg/dL', min: '9.2', max: '29.2' },
        { name: 'ALT', value: '120', unit: 'U/L', min: '10', max: '100' },
        { name: 'PT', value: '3.523', unit: 's', min: '2', max: '3.7' },
        { name: 'HbA1c', value: '5.4', unit: '%', min: '', max: '' },
      ],
    },
    files: [
      { id: 'f1', kind: 'photo', photo: 'bori' },
      { id: 'f2', kind: 'pdf', photo: 'bori' },
    ],
  },
  {
    id: 'feed-breakfast',
    category: 'feed',
    at: hoursAgo(4),
    sticker: 'fod',
    price: 0,
    memo: '',
    canEdit: true,
    feed: { water: '150', kcal: '220', foods: [{ name: '연어 & 고구마 어덜트', gram: 60 }] },
    files: [],
  },
  {
    id: 'feed-fasting',
    category: 'feed',
    at: at(1, 20, 0),
    sticker: 'n',
    price: 0,
    memo: '내일 아침 스케일링 예정',
    canEdit: true,
    fasting: { end: at(0, 9, 0), water: 'BLOCK', reason: 'PRE_PROC' },
    files: [],
  },
  {
    id: 'weight-weekly',
    category: 'weight',
    at: at(0, 9, 10),
    sticker: 'wei',
    price: 0,
    memo: '',
    canEdit: true,
    charts: [{ label: '체중', unit: 'kg', points: weekly([5.0, 4.9, 5.0, 4.9, 5.1], at(0, 9, 10)) }],
    files: [],
  },
  {
    id: 'weight-first',
    category: 'weight',
    at: at(60, 10, 0),
    sticker: 'wei',
    price: 0,
    memo: '처음 데려온 날 잰 몸무게',
    canEdit: true,
    charts: [{ label: '체중', unit: 'kg', points: weekly([5.1], at(60, 10, 0)) }],
    files: [],
  },
  {
    id: 'play-ball',
    category: 'play',
    at: hoursAgo(2),
    sticker: 'ply',
    price: 0,
    memo: '공 던지기 놀이',
    canEdit: true,
    play: { minutes: 25 },
    charts: [{ label: '놀이', unit: '분', points: weekly([10, 30, 20, 15, 25], hoursAgo(2), 1) }],
    files: [],
  },
  {
    id: 'play-habit',
    category: 'play',
    at: at(2, 19, 0),
    sticker: 'ball',
    price: 0,
    memo: '',
    fromHabit: true,
    canEdit: true,
    play: { minutes: 30 },
    charts: [{ label: '놀이', unit: '분', points: weekly([20, 15, 40, 25, 30], at(2, 19, 0), 1) }],
    files: [],
  },
  {
    id: 'measure-glucose',
    category: 'measure',
    at: at(3, 8, 0),
    sticker: 'syringe',
    price: 0,
    memo: '',
    canEdit: true,
    measure: { kind: 'GLUCOSE', value: '180', unit: 'mg/dL', condition: 'FASTING' },
    charts: [{ label: '혈당', unit: 'mg/dL', points: weekly([120, 135, 150, 165, 180], at(3, 8, 0)) }],
    files: [],
  },
  {
    id: 'measure-bp',
    category: 'measure',
    at: at(4, 15, 30),
    sticker: 'hosp',
    price: 0,
    memo: '병원에서 잰 값이에요.',
    canEdit: true,
    measure: { kind: 'BP', value: '130', second: '85', unit: 'mmHg', condition: 'RESTING' },
    charts: [
      { label: '수축기 혈압', unit: 'mmHg', points: weekly([125, 128, 132, 127, 130], at(4, 15, 30)) },
      { label: '이완기 혈압', unit: 'mmHg', points: weekly([82, 80, 86, 88, 85], at(4, 15, 30)) },
    ],
    files: [],
  },
  {
    id: 'measure-other',
    category: 'measure',
    at: at(6, 7, 40),
    sticker: 'n',
    price: 0,
    memo: '',
    canEdit: true,
    measure: { kind: 'OTHER', name: '소변량', value: '320', unit: 'mL', condition: null },
    charts: [{ label: '소변량', unit: 'mL', points: weekly([300, 320, 320], at(6, 7, 40)) }],
    files: [],
  },
  {
    id: 'measure-hr',
    category: 'measure',
    at: at(1, 18, 50),
    sticker: 'heart',
    price: 0,
    memo: '산책 직후에 쟀어요.',
    canEdit: true,
    measure: { kind: 'HR', value: '132', unit: 'bpm', condition: 'AFTER_ACTIVITY' },
    charts: [{ label: '심박', unit: 'bpm', points: weekly([132], at(1, 18, 50)) }],
    files: [],
  },
  {
    id: 'measure-partner',
    category: 'measure',
    at: at(7, 11, 20),
    sticker: 'hosp',
    price: 0,
    memo: '',
    canEdit: true,
    measure: { kind: 'TEMP', value: '39.2', unit: '°C', condition: 'RECTAL', partner: '우리동물병원' },
    charts: [{ label: '체온', unit: '°C', points: weekly([38.4, 38.7, 38.5, 38.9, 39.2], at(7, 11, 20)) }],
    files: [],
  },
  {
    id: 'measure-legacy',
    category: 'measure',
    at: at(120, 21, 0),
    sticker: 'n',
    price: 0,
    memo: '자기 전에 잰 호흡·심박',
    canEdit: true,
    measure: { kind: 'RR', value: '', unit: '회/분', condition: null, legacy: true },
    charts: [
      { label: '호흡수', unit: '회/분', points: weekly([30, 34, 36], at(120, 21, 0)) },
      { label: '심박수', unit: '회/분', points: weekly([150, 140, 144], at(120, 21, 0)) },
    ],
    files: [],
  },
  {
    id: 'walk-park',
    category: 'walk',
    at: WALK_START,
    sticker: 'walk',
    price: 0,
    memo: '집 앞 공원을 한 바퀴 걸었다.',
    canEdit: true,
    walk: { end: WALK_END, km: '1.20', weather: { tmp: '10', sky: '1', pty: '0' }, route: WALK_ROUTE, subRecordIds: ['walk-water', 'walk-poopee'] },
    files: [{ id: 'f1', kind: 'photo', photo: 'bori' }],
  },
  {
    id: 'walk-water',
    category: 'memo',
    at: minutesAgo(36),
    sticker: 'n',
    price: 0,
    memo: '물 마심',
    canEdit: true,
    footprint: { place: { id: 'walk-water', name: '산책로 쉼터', detail: '', x: WALK_ROUTE[2].x, y: WALK_ROUTE[2].y }, onWalk: true },
    files: [],
  },
  {
    id: 'walk-poopee',
    category: 'poopee',
    at: minutesAgo(28),
    sticker: 'fec',
    price: 0,
    memo: '',
    canEdit: true,
    footprint: { place: { id: 'walk-poopee', name: '산책로 풀밭', detail: '', x: WALK_ROUTE[5].x, y: WALK_ROUTE[5].y }, onWalk: true },
    poopee: { feces: '초콜릿색', shape: '정상변2' },
    files: [],
  },
  {
    id: 'walk-rain',
    category: 'walk',
    at: at(3, 7, 0),
    sticker: 'walk',
    price: 0,
    memo: '비가 와서 짧게 돌았다.',
    canEdit: true,
    walk: { end: at(3, 7, 15), km: null, weather: { tmp: '7', sky: '4', pty: '1' }, route: [], subRecordIds: [] },
    files: [],
  },
  {
    id: 'behavior-bark',
    category: 'behavior',
    at: hoursAgo(6),
    sticker: 'n',
    price: 0,
    memo: '택배 기사님 오셨을 때',
    canEdit: true,
    behavior: { kind: 'EVENT', code: 'd01', level: '2', minutes: '10', situations: ['s02', 's03', 's01'], responses: ['r04'] },
    files: [],
  },
  {
    id: 'behavior-potty',
    category: 'behavior',
    at: at(1, 14, 0),
    sticker: 'n',
    price: 0,
    memo: '',
    canEdit: true,
    behavior: { kind: 'EVENT', code: 'd08', level: '2', situations: ['s01'], responses: ['r06'], places: ['p02'] },
    files: [],
  },
  {
    id: 'behavior-cat',
    category: 'behavior',
    at: at(2, 22, 0),
    sticker: 'cat',
    price: 0,
    memo: '',
    canEdit: true,
    petName: '나비',
    behavior: { kind: 'EVENT', code: 'c05', level: '3', catCount: '4', situations: ['s06'], responses: ['r06'] },
    files: [],
  },
  {
    id: 'behavior-training',
    category: 'behavior',
    at: at(1, 20, 30),
    sticker: 'n',
    price: 0,
    memo: '',
    canEdit: true,
    behavior: { kind: 'TRAINING', code: 'd01', level: '3', minutes: '15', methods: ['m01', 'm05'] },
    files: [],
  },
  {
    id: 'behavior-training-also',
    category: 'behavior',
    at: at(3, 18, 0),
    sticker: 'n',
    price: 12000,
    memo: '앞고리 하네스 새로 샀다',
    canEdit: true,
    behavior: { kind: 'TRAINING', code: 'd16', level: '1', minutes: '10', methods: ['m02', 'm03'], also: ['d15'] },
    files: [],
  },
  {
    id: 'behavior-none',
    category: 'behavior',
    at: at(4, 21, 0),
    sticker: 'n',
    price: 0,
    memo: '',
    canEdit: true,
    behavior: { kind: 'NONE', code: 'd10', level: '0' },
    files: [],
  },
  {
    id: 'behavior-survey',
    category: 'behavior',
    at: at(20, 10, 30),
    sticker: 'n',
    price: 0,
    memo: '',
    canEdit: true,
    behavior: {
      kind: 'SURVEY',
      code: 'd01',
      survey: {
        answers: { health: ['no'], response: ['hug', 'scold'], family: ['diff'], alone: ['3to6'], walk: ['ge30'], trigger: ['door'] },
        previousId: 'behavior-survey-old',
        windows: [
          { pet: '4번 · 평균 강도 2.0(보통) · 없었던 날 6일', bark: '한 번 평균 12분', owner: '안아 주기·말 걸기 1번 · 연습 4번' },
          { pet: '2번 · 평균 강도 1.5(약함~보통) · 없었던 날 4일', bark: '한 번 평균 10분', owner: '바꿔 볼 반응 0번 · 연습 3번' },
        ],
        recheck: true,
      },
    },
    files: [],
  },
  {
    id: 'behavior-survey-old',
    category: 'behavior',
    at: at(45, 10, 30),
    sticker: 'n',
    price: 0,
    memo: '',
    canEdit: true,
    behavior: {
      kind: 'SURVEY',
      code: 'd01',
      survey: {
        answers: { health: ['no'], response: ['hug', 'scold'], family: ['same'], alone: ['3to6'], walk: ['lt30'], trigger: ['door'] },
        summary: [
          { key: '있었던 횟수', value: '6번 → 6번 (그대로예요)' },
          { key: '짖은 시간', value: '30분 → 20분 (33% 줄었어요)' },
        ],
        windows: [
          { pet: '6번 · 평균 강도 2.5(보통~심함) · 없었던 날 4일', bark: '한 번 평균 30분', owner: '안아 주기·말 걸기 4번, 혼내기 2번 · 연습 0번' },
          { pet: '7번 · 평균 강도 2.3(보통~심함) · 없었던 날 3일', bark: '한 번 평균 25분', owner: '안아 주기·말 걸기 3번, 혼내기 1번 · 연습 2번' },
          { pet: '6번 · 평균 강도 2.0(보통) · 없었던 날 5일', bark: '한 번 평균 20분', owner: '안아 주기·말 걸기 2번 · 연습 3번' },
          { pet: '1번 · 평균 강도 2.0(보통)', owner: '바꿔 볼 반응 0번 · 연습 1번' },
        ],
        worse: true,
      },
    },
    files: [],
  },
];

const removed = new Set<string>();

export const listRecords = (): DiaryRecord[] => RECORDS.filter((record) => !removed.has(record.id)).sort((a, b) => b.at.getTime() - a.at.getTime());

export const findRecord = (id: string): DiaryRecord | undefined => RECORDS.find((record) => record.id === id && !removed.has(record.id));

export async function removeRecord(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 800));
  removed.add(id);
}
