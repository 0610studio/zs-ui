import { ABNORMAL_SYMPTOMS } from './abnormal';
import { behaviorLabel, intensityLevelsFor } from './behavior';
import { BARK_SURVEY } from './behaviorSurvey';
import { getCategory, type DiaryCategoryCode } from './categories';
import { formatRecordDate, formatRecordTime } from './common';
import { FASTING_REASONS } from './feed';
import { MEASURE_CONDITION_LABEL, MEASURE_KIND_LABEL } from './measure';
import type { DiaryRecord, RecordChart, RecordWeather } from './records';

export type RecordMenuAction = 'delete' | 'hide' | 'modify' | 'quickRecord' | 'careHabit';

export const MENU_LABEL: Record<RecordMenuAction, string> = {
  delete: '삭제하기',
  hide: '숨기기',
  modify: '수정하기',
  quickRecord: '간편기록 등록',
  careHabit: '돌봄 습관으로 만들기',
};

const NO_QUICK_RECORD: DiaryCategoryCode[] = ['measure', 'walk', 'behavior'];
const CARE_HABIT: DiaryCategoryCode[] = ['memo', 'todo', 'play', 'feed', 'walk'];

export const menuFor = (record: Pick<DiaryRecord, 'category'> & { partner?: boolean; legacy?: boolean }): RecordMenuAction[] => {
  if (record.partner) return ['hide'];
  if (record.legacy) return ['delete'];
  const actions: RecordMenuAction[] = ['delete', 'modify'];
  if (!NO_QUICK_RECORD.includes(record.category)) actions.push('quickRecord');
  if (CARE_HABIT.includes(record.category)) actions.push('careHabit');
  return actions;
};

export const recordLabel = (record: DiaryRecord): string => {
  if (record.fasting) return '금식';
  if (record.behavior?.kind === 'TRAINING') return '행동 교정 연습';
  if (record.behavior?.kind === 'SURVEY') return '행동 자가점검';
  return getCategory(record.category).label;
};

export const recordTitle = (record: DiaryRecord): string => `${recordLabel(record)} 기록`;

export const formatDetailDateTime = (date: Date): string => `${formatRecordDate(date)} ${formatRecordTime(date)}`;

export const formatWon = (price: number): string => `₩${price.toLocaleString('ko-KR')}`;

export const showPrice = (record: DiaryRecord): boolean => (record.category === 'measure' || record.category === 'behavior' ? record.price > 0 : true);

export const DETAIL_TEXT = {
  price: '소비',
  menu: '더보기',
  noPermission: "'보호자'랑 '글쓴이'만 수정/삭제할 수 있어요.",
  noPermissionLabel: '수정·삭제 권한 없음',
  deleteTitle: (label: string) => `${label} 삭제`,
  deleteMessage: (date: string) => `${date} 기록을 정말로 삭제하실건가요?`,
  deleted: '정상적으로 삭제되었어요',
  hideMessage: '이 기록은 병원이 남긴 거예요. 숨기면 내 타임라인에서만 보이지 않아요.',
  hidden: '기록을 숨겼어요.',
  confirm: '확인',
  cancel: '취소',
  habit: '습관으로 기록됐어요.',
  habitAction: '습관 보기',
  footprint: '발자국',
  location: '위치',
  album: '사진첩',
  todo: '할일 기록',
  abnormal: '이상 증상',
  medicalSubjects: '진료 기록',
  medicalTests: '검사 기록',
  water: '음수량',
  kcal: '급여 칼로리',
  foods: '급여 제품',
  fastingReason: '이유',
  fastingEnd: '종료 시간',
  fastingWater: '물',
  fastingEndEmpty: '입력 안 함',
  listTitle: '지난 기록',
  gallery: '사진첩',
  pdfView: 'PDF 보기',
  videoPlay: '동영상 재생',
  measureCondition: '측정 조건',
  bpSys: '수축기 혈압',
  bpDia: '이완기 혈압',
  legacyTitle: '읽기 전용 수첩',
  legacyMessage: '개편 전 측정 건강 수첩은 수정할 수 없고 보거나 삭제만 가능해요.',
  partner: (name: string) => `${name} 작성`,
  walkTime: '산책 시간',
  walkDistance: '산책 거리',
  weather: '날씨',
  walkDiary: '산책 수첩',
  walkRoute: '산책 경로',
  certificate: '산책 인증서',
  certificateHint: '산책 후 30분내에만 저장가능해요.',
  certificateLeft: (minutes: number) => `${minutes}분`,
  certificateLeftSuffix: '이 지나면 사라져요.',
  playTotal: (minutes: number) => `오늘은 총 ${minutes}분 놀았어요.`,
};

export const josa = (word: string, withFinal: string, withoutFinal: string): string => {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  return code >= 0 && code <= 11171 && code % 28 !== 0 ? withFinal : withoutFinal;
};

const trim = (value: number): string => String(Math.round(value * 100) / 100);

const kgOrGram = (kg: number): string => (Math.abs(kg) < 1 ? `${Math.round(Math.abs(kg) * 1000)}g` : `${trim(Math.abs(kg))}kg`);

export interface Trend {
  key: string;
  title: string;
  value: string;
  unit: string;
  delta: { direction: 'up' | 'down'; amount: string } | null;
  sentence: { text: string; strong?: boolean }[];
  series: { label: string; points: RecordChart['points']; shape: 'circle' | 'diamond' }[];
  unitForAxis: string;
  decimals: number;
}

const decimalsIn = (values: number[]): number => Math.min(2, Math.max(0, ...values.map((value) => (String(value).split('.')[1] ?? '').length)));

export const fixedValue = (value: number, decimals: number, unit?: string): string => {
  const text = value.toFixed(decimals);
  if (!unit) return text;
  return unit === 'kg' || unit === '분' ? `${text}${unit}` : `${text} ${unit}`;
};

const SAME_AS_BEFORE = '지난 기록과 같아요.';
const last = (chart: RecordChart) => chart.points[chart.points.length - 1].value;
const previous = (chart: RecordChart) => (chart.points.length > 1 ? chart.points[chart.points.length - 2].value : null);

const diffOf = (chart: RecordChart): number | null => {
  const before = previous(chart);
  if (before === null) return null;
  const diff = last(chart) - before;
  return Math.abs(diff) < 1e-9 ? 0 : diff;
};

const singleTrend = (key: string, chart: RecordChart, words: { up: string; down: string; first: string }, amountOf: (diff: number) => string): Trend => {
  const diff = diffOf(chart);
  const decimals = decimalsIn(chart.points.map((point) => point.value));
  const series = [{ label: chart.label, points: chart.points, shape: 'circle' as const }];
  const base = { key, title: chart.label, value: fixedValue(last(chart), decimals), unit: chart.unit, series, unitForAxis: chart.unit, decimals };
  if (diff === null) return { ...base, delta: null, sentence: [{ text: words.first }] };
  if (diff === 0) return { ...base, delta: null, sentence: [{ text: SAME_AS_BEFORE }] };
  const amount = amountOf(diff);
  return { ...base, delta: { direction: diff > 0 ? 'up' : 'down', amount }, sentence: [{ text: '지난 기록보다 ' }, { text: amount, strong: true }, { text: diff > 0 ? words.up : words.down }] };
};

const bloodPressureTrend = (systolic: RecordChart, diastolic: RecordChart): Trend => {
  const sys = diffOf(systolic);
  const dia = diffOf(diastolic);
  const change = (diff: number, end: boolean): Trend['sentence'] =>
    diff === 0 ? [{ text: end ? '같아요.' : '같고, ' }] : [{ text: `${trim(Math.abs(diff))} ${systolic.unit}`, strong: true }, { text: diff > 0 ? (end ? ' 높아요.' : ' 높고, ') : end ? ' 낮아요.' : ' 낮고, ' }];
  const sentence: Trend['sentence'] =
    sys === null || dia === null
      ? [{ text: '처음 기록한 혈압이에요.' }]
      : sys === 0 && dia === 0
        ? [{ text: SAME_AS_BEFORE }]
        : [{ text: '지난 기록보다 수축기는 ' }, ...change(sys, false), { text: '이완기는 ' }, ...change(dia, true)];
  return {
    key: 'bp',
    title: '혈압',
    value: `${trim(last(systolic))}/${trim(last(diastolic))}`,
    unit: systolic.unit,
    decimals: decimalsIn([...systolic.points, ...diastolic.points].map((point) => point.value)),
    delta: null,
    sentence,
    series: [
      { label: DETAIL_TEXT.bpSys, points: systolic.points, shape: 'circle' },
      { label: DETAIL_TEXT.bpDia, points: diastolic.points, shape: 'diamond' },
    ],
    unitForAxis: systolic.unit,
  };
};

export const weightTrend = (chart: RecordChart): Trend => singleTrend('weight', chart, { up: ' 늘었어요.', down: ' 줄었어요.', first: '처음 기록한 체중이에요.' }, kgOrGram);

export const trendsFor = (record: DiaryRecord): Trend[] => {
  const charts = record.charts ?? [];
  if (charts.length === 0) return [];
  if (record.category === 'weight') return [weightTrend(charts[0])];
  if (record.play) {
    return [singleTrend('play', { ...charts[0], label: '놀이 시간' }, { up: ' 더 놀았어요.', down: ' 덜 놀았어요.', first: '처음 기록한 놀이 시간이에요.' }, (diff) => `${trim(Math.abs(diff))}분`)];
  }
  if (record.measure?.kind === 'BP' && charts.length === 2) return [bloodPressureTrend(charts[0], charts[1])];
  return charts.map((chart, index) =>
    singleTrend(`measure-${index}`, chart, { up: ' 높아요.', down: ' 낮아요.', first: `처음 기록한 ${chart.label}${josa(chart.label, '이에요.', '예요.')}` }, (diff) => chartValue(Math.abs(diff), chart.unit)),
  );
};

export const playFeedback = (minutes: number): string => {
  if (minutes > 120) return '오늘은 활동량이 많아서 많이 지쳤을 수 있어요. 수분과 휴식을 충분히 챙겨주세요.';
  if (minutes >= 30) return '오늘 놀이 시간, 전반적으로 아주 좋아요. 지금처럼 꾸준히 함께해 주세요!';
  return '오늘은 놀이 시간이 조금 짧았어요. 다음에는 조금만 더 함께 놀아주세요!';
};

export const chartValue = (value: number, unit: string): string => (unit === 'kg' || unit === '분' ? `${trim(value)}${unit}` : `${trim(value)} ${unit}`);

export const measureRows = (measure: NonNullable<DiaryRecord['measure']>): { label: string; value: string }[] => {
  if (measure.legacy) return [];
  const rows =
    measure.kind === 'BP'
      ? [
          { label: DETAIL_TEXT.bpSys, value: `${measure.value} ${measure.unit}` },
          { label: DETAIL_TEXT.bpDia, value: `${measure.second ?? ''} ${measure.unit}` },
        ]
      : [{ label: measure.kind === 'OTHER' ? measure.name || MEASURE_KIND_LABEL.OTHER : MEASURE_KIND_LABEL[measure.kind], value: `${measure.value} ${measure.unit}` }];
  if (measure.condition) rows.push({ label: DETAIL_TEXT.measureCondition, value: MEASURE_CONDITION_LABEL[measure.condition] });
  return rows;
};

export const formatElapsed = (start: Date, end: Date): string => {
  const seconds = Math.max(0, Math.round((end.getTime() - start.getTime()) / 1000));
  if (seconds < 60) return `${seconds}초`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}분`;
  const rest = minutes % 60;
  return rest ? `${Math.floor(minutes / 60)}시간 ${rest}분` : `${Math.floor(minutes / 60)}시간`;
};

export const walkTimeText = (start: Date, end: Date | null): string => (end ? `${formatRecordTime(start)} ~ ${formatRecordTime(end)}` : formatRecordTime(start));

export const walkDistanceText = (km: string, start: Date, end: Date | null): string => (end ? `${km} km (${formatElapsed(start, end)})` : `${km} km`);

export type WeatherIcon = 'sun' | 'partly' | 'overcast' | 'rain' | 'snow';

export const weatherInfo = (weather: RecordWeather): { name: string; icon: WeatherIcon } | null => {
  const pty: Record<string, { name: string; icon: WeatherIcon }> = {
    '1': { name: '비', icon: 'rain' },
    '2': { name: '비/눈', icon: 'snow' },
    '3': { name: '눈', icon: 'snow' },
    '4': { name: '소나기', icon: 'rain' },
    '5': { name: '빗방울', icon: 'rain' },
    '6': { name: '빗방울눈날림', icon: 'snow' },
    '7': { name: '눈날림', icon: 'snow' },
  };
  const sky: Record<string, { name: string; icon: WeatherIcon }> = {
    '1': { name: '맑음', icon: 'sun' },
    '3': { name: '구름많음', icon: 'partly' },
    '4': { name: '흐림', icon: 'overcast' },
  };
  return pty[weather.pty] ?? sky[weather.sky] ?? null;
};

export const certificateMinutesLeft = (walk: NonNullable<DiaryRecord['walk']>, now: Date = new Date()): number | null => {
  if (!walk.end || walk.route.length === 0 || !walk.km || Number(walk.km) <= 0.01) return null;
  const passed = Math.floor((now.getTime() - walk.end.getTime()) / 60000);
  return passed >= 0 && passed < 30 ? 30 - passed : null;
};

export const recordSummary = (record: DiaryRecord): string => {
  if (record.fasting) return FASTING_REASONS.find((reason) => reason.code === record.fasting?.reason)?.label ?? '';
  if (record.behavior) {
    const { kind, code, level } = record.behavior;
    const name = kind === 'SURVEY' ? BARK_SURVEY.name : behaviorLabel(code);
    const detail = kind === 'EVENT' && level ? intensityLevelsFor(code)[Number(level)]?.label : kind === 'NONE' ? '없었어요' : undefined;
    return [record.petName, name, detail].filter(Boolean).join(' · ');
  }
  if (record.todo) return record.todo.join(', ');
  if (record.poopee) return Object.values(record.poopee).filter(Boolean).join(' · ');
  if (record.abnormal) return `${ABNORMAL_SYMPTOMS.find((item) => item.code === record.abnormal?.symptom)?.label ?? ''} ${record.abnormal.count}회`;
  if (record.medical) return record.medical.subjects.join(', ');
  if (record.feed) return record.feed.foods.map((food) => food.name).join(', ');
  if (record.measure) return record.measure.legacy ? '호흡·심박' : measureRows(record.measure)[0].value.trim();
  if (record.walk) return record.walk.km ? `${record.walk.km} km` : walkTimeText(record.at, record.walk.end);
  if (record.play) return `${record.play.minutes}분`;
  if (record.category === 'weight' && record.charts) return chartValue(record.charts[0].points[record.charts[0].points.length - 1].value, 'kg');
  return record.memo;
};

export const formatListTime = (date: Date, now: Date = new Date()): string =>
  date.toDateString() === now.toDateString() ? formatRecordTime(date) : `${date.getMonth() + 1}월 ${date.getDate()}일 ${formatRecordTime(date)}`;
