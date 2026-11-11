export type MeasureKind = 'TEMP' | 'HR' | 'RR' | 'BP' | 'SPO2' | 'GLUCOSE' | 'OTHER';
export type MeasureCondition = 'FASTING' | 'BEFORE_MEAL' | 'AFTER_MEAL' | 'RESTING' | 'SLEEPING' | 'AFTER_ACTIVITY' | 'RECTAL' | 'EAR' | 'SEDATED' | 'UNKNOWN';

export const MEASURE_KIND_LABEL: Record<MeasureKind, string> = {
  TEMP: '체온',
  HR: '심박',
  RR: '호흡',
  BP: '혈압',
  SPO2: '산소포화도',
  GLUCOSE: '혈당',
  OTHER: '기타',
};

export const MEASURE_UNIT: Record<Exclude<MeasureKind, 'OTHER'>, string> = {
  TEMP: '°C',
  HR: 'bpm',
  RR: '회/분',
  BP: 'mmHg',
  SPO2: '%',
  GLUCOSE: 'mg/dL',
};

export const MEASURE_KINDS: MeasureKind[] = (Object.keys(MEASURE_KIND_LABEL) as MeasureKind[]).sort((a, b) => MEASURE_KIND_LABEL[a].localeCompare(MEASURE_KIND_LABEL[b], 'ko'));

export const MEASURE_CONDITION_LABEL: Record<MeasureCondition, string> = {
  FASTING: '공복',
  BEFORE_MEAL: '식전',
  AFTER_MEAL: '식후',
  RESTING: '안정 시',
  SLEEPING: '수면 중',
  AFTER_ACTIVITY: '활동 후',
  RECTAL: '항문',
  EAR: '귀',
  SEDATED: '진정 중',
  UNKNOWN: '모름',
};

export const MEASURE_CONDITIONS: Record<MeasureKind, MeasureCondition[]> = {
  TEMP: ['RECTAL', 'EAR', 'UNKNOWN'],
  HR: ['RESTING', 'SLEEPING', 'AFTER_ACTIVITY', 'UNKNOWN'],
  RR: ['RESTING', 'SLEEPING', 'AFTER_ACTIVITY', 'UNKNOWN'],
  BP: ['RESTING', 'SEDATED', 'UNKNOWN'],
  SPO2: [],
  GLUCOSE: ['FASTING', 'BEFORE_MEAL', 'AFTER_MEAL', 'UNKNOWN'],
  OTHER: [],
};

export interface MeasureForm {
  kind: MeasureKind | null;
  label: string;
  value: string;
  secondValue: string;
  unit: string;
  condition: MeasureCondition | null;
}

export const EMPTY_MEASURE: MeasureForm = { kind: null, label: '', value: '', secondValue: '', unit: '', condition: null };

export const MEASURE_TEXT = {
  kind: '측정 종류',
  value: '측정 값',
  condition: '측정 조건',
  kindPlaceholder: '종류를 골라주세요.',
  kindFirst: '종류를 먼저 골라주세요.',
  valuePlaceholder: '값을 입력해주세요.',
  systolic: '수축기',
  diastolic: '이완기',
  otherName: '측정 이름',
  otherNamePlaceholder: '예) 소변량',
  otherUnitPlaceholder: '예) mL',
  confirm: '확인',
  directInput: '직접 입력',
  startTitle: (name: string) => `${name} 측정을 시작할게요.`,
  startQuestion: '몇 초 동안 측정할까요?',
  touchToStart: '아래 영역을 터치해서 시작해주세요.',
  circleStart: '기록 시작',
  measuring: (name: string) => `${name} 측정 중이에요.`,
  remaining: (seconds: number) => `${seconds}초 남았어요.`,
  stop: '그만할래요',
  stopTitle: '측정을 종료할까요?',
  stopMessage: '방금 전까지 측정한 정보가 분당 호흡수로 계산돼서 저장돼요.',
};

export const COUNT_NAME: Record<'HR' | 'RR', string> = { HR: '심박수', RR: '호흡수' };
export const MEASURE_SECONDS = [15, 30, 60] as const;

export const perMinute = (count: number, seconds: number): number => (seconds > 0 ? Math.round((count / seconds) * 60) : 0);

export function measureValueText(form: MeasureForm): string | undefined {
  if (!form.kind || !form.value) return undefined;
  if (form.kind === 'BP') return form.secondValue ? `${form.value}/${form.secondValue} ${MEASURE_UNIT.BP}` : undefined;
  const unit = form.kind === 'OTHER' ? form.unit : MEASURE_UNIT[form.kind];
  return `${form.value} ${unit}`.trim();
}

export const measureKindText = (form: MeasureForm): string | undefined => (form.kind ? (form.kind === 'OTHER' && form.label ? form.label : MEASURE_KIND_LABEL[form.kind]) : undefined);

const NUMBER = /^[0-9.]+$/;

export function validateMeasureSheet(kind: MeasureKind, draft: Pick<MeasureForm, 'label' | 'value' | 'secondValue' | 'unit'>): string | null {
  if (kind === 'OTHER' && !draft.label.trim()) return '측정 이름을 입력해주세요.';
  if (kind === 'BP') {
    if (!draft.value || !draft.secondValue) return '수축기와 이완기를 모두 입력해주세요.';
    if (!NUMBER.test(draft.value) || !NUMBER.test(draft.secondValue)) return '측정값은 숫자만 입력해주세요.';
    return null;
  }
  if (!draft.value) return '측정 값을 입력해주세요.';
  if (!NUMBER.test(draft.value)) return '측정값은 숫자만 입력해주세요.';
  if (kind === 'OTHER' && !draft.unit.trim()) return '단위를 입력해주세요.';
  return null;
}

export function validateMeasure(form: MeasureForm): string | null {
  if (!form.kind) return '측정 종류를 골라주세요.';
  const sheet = validateMeasureSheet(form.kind, form);
  if (sheet) return sheet;
  if (form.condition && !MEASURE_CONDITIONS[form.kind].includes(form.condition)) return '입력한 값을 다시 확인해주세요.';
  return null;
}
