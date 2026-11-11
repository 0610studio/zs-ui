import type { DiaryOption } from './abnormal';

export const MEDICAL_CUSTOM_CODE = '9999';
export const MEDICAL_SUBJECTS: DiaryOption[] = [
  { code: MEDICAL_CUSTOM_CODE, label: '기타 (직접입력)' },
  { code: '13', label: '중성화' },
  { code: '14', label: '내장칩 삽입' },
  { code: '1', label: '1차 접종' },
  { code: '2', label: '2차 접종' },
  { code: '3', label: '3차 접종' },
  { code: '4', label: '4차 접종' },
  { code: '5', label: '5차 접종' },
  { code: '6', label: '6차 접종' },
  { code: '18', label: '종합백신 추가접종' },
  { code: '9', label: '스케일링' },
  { code: '8', label: '심장 사상충' },
  { code: '11', label: '외부 기생충(진드기, 벼룩 등)' },
  { code: '12', label: '광견병' },
  { code: '15', label: '코로나 장염' },
  { code: '16', label: '켄넬코프' },
  { code: '17', label: '신종플루(독감)' },
  { code: '19', label: '내과 진료' },
  { code: '20', label: '외과 진료' },
  { code: '21', label: '피부과 진료' },
  { code: '22', label: '안과 진료' },
  { code: '23', label: '호흡과 진료' },
  { code: '24', label: '소변 검사' },
  { code: '25', label: '분변 검사' },
  { code: '26', label: '혈압 측정' },
  { code: '27', label: '항체가 검사' },
  { code: '28', label: '혈구 검사' },
  { code: '29', label: '혈액생화학 검사' },
  { code: '30', label: '전해질 검사' },
  { code: '31', label: 'X-ray/초음파 검사' },
  { code: '32', label: '심전도 검사' },
  { code: '33', label: '혈액응고 검사' },
  { code: '34', label: '호르몬 검사' },
  { code: '35', label: '알러지 검사' },
];

export interface MedicalSubject {
  key: string;
  code: string;
  name: string;
}

export const MEDICAL_TEXT = {
  subject: '진료 과목',
  subjectAdd: '진료 과목 추가',
  test: '검사',
  testAdd: '검사 결과 추가',
  customHint: '입력하지 않으면 기타 (모름)으로 입력돼요.',
  customFallback: '기타 (모름)',
};

export const customSubjectName = (text: string): string => text.trim() || MEDICAL_TEXT.customFallback;

export interface MedicalTest {
  key: string;
  name: string;
  value: string;
  unit: string;
  min: string;
  max: string;
}

export const MEDICAL_TEST_TEXT = {
  info: '검사 정보',
  name: '검사 이름',
  value: '측정 값',
  unit: '단위',
  range: '정상 범위',
  min: '최소 값',
  max: '최대 값',
  unitSearch: '단위 검색',
  recent: '최근 검색',
  list: '목록',
  unitEmptyTitle: '등록된 단위가 없어요.',
  unitEmptyDescription: '단위를 직접 등록할 수 있어요.',
  unitRegister: (value: string) => (value ? `${value} 등록` : '단위 등록'),
  unitRequired: '단위를 선택해주세요.',
};

export function validateMedicalTest(test: Omit<MedicalTest, 'key'>): string | null {
  const isNumber = (text: string) => /^[0-9.]+$/.test(text);
  if (!test.name.trim()) return '검사 이름을 추가해주세요.';
  if (!test.value) return '측정값을 추가해주세요.';
  if (!test.unit) return '측정 단위를 추가해주세요.';
  if (!isNumber(test.value)) return '측정값은 숫자만 입력해주세요.';
  if (test.min && !isNumber(test.min)) return '최소값은 숫자만 입력해주세요.';
  if (test.max && !isNumber(test.max)) return '최대값은 숫자만 입력해주세요.';
  return null;
}

export const MEDICAL_UNITS = [
  'mg', 'g', 'kg', 'mL', 'L', 'μL', 'cc', 'mg/dL', 'g/dL', 'μg/dL', 'mmol/L', 'μmol/L', 'IU/L', 'IU/mL', 'ng/mL', 'pg/mL', 'g/L', 'mg/L', 'μg/L', 'mEq/L',
  'U/L', 'fL', 'bpm', 'mmHg', 'cmH2O', 'L/min', 'mL/min', '°C', '°F', 's', 'min', 'h', 'pH', 'SG', 'cells/μL', 'cells/mL', 'cells/mm³', 'CFU/mL', 'logCFU/mL', '% SpO2',
];

export type TestLevel = 'low' | 'normal' | 'high';
export const TEST_LEVEL_LABEL: Record<TestLevel, string> = { low: '낮음', normal: '표준', high: '높음' };

export function testRange(test: Pick<MedicalTest, 'value' | 'min' | 'max'>): { level: TestLevel; showBar: boolean; percent: number } {
  const value = Number(test.value);
  const min = Number(test.min || 0);
  const max = Number(test.max || 0);
  const level: TestLevel = value < min ? 'low' : max && value > max ? 'high' : 'normal';
  const range = max - min;
  const percent = range > 0 ? Math.min(100, Math.max(0, ((value - (min - range)) * 100) / (3 * range))) : 50;
  return { level, showBar: min !== 0 || max !== 0, percent };
}
