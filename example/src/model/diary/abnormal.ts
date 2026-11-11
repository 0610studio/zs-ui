export interface DiaryOption {
  code: string;
  label: string;
  description?: string;
}

export const ABNORMAL_SYMPTOMS: DiaryOption[] = [
  { code: 'a001', label: '구토' },
  { code: 'a002', label: '상처' },
  { code: 'a003', label: '기침/재채기' },
  { code: 'a004', label: '경련' },
  { code: 'a005', label: '관절 증상(다리 절뚝거림 등)' },
  { code: 'a006', label: '피부 증상(털빠짐,염증 등)' },
  { code: 'a007', label: '안과 증상' },
  { code: 'a008', label: '귀 증상' },
  { code: 'a009', label: '코 증상(콧물,코골이 등)' },
  { code: 'a0010', label: '호흡 증상' },
  { code: 'a0011', label: '배가 볼록함' },
  { code: 'a0012', label: '소변/대변이 안나옴' },
  { code: 'a0013', label: '열이 높음' },
  { code: 'a0014', label: '식분증(배변을 먹음)' },
  { code: 'a9999', label: '기타 증상' },
];

export const OTHER_SYMPTOM = 'a9999';

export const ABNORMAL_DETAILS: Record<string, { title: string; options: DiaryOption[] }> = {
  a001: {
    title: '구토 모양',
    options: [
      { code: 'v001', label: '노란색', description: '담즙이 섞인 구토일 수 있어요.' },
      { code: 'v003', label: '거품', description: '공복 구토나 위액 구토일 수 있어요.' },
      { code: 'v009', label: '투명', description: '위액 또는 물 위주의 구토일 수 있어요.' },
      { code: 'v002', label: '녹색', description: '담즙 또는 위장 자극 가능성을 살펴보세요.' },
      { code: 'v004', label: '갈색', description: '음식물/소화물 혼합 상태일 수 있어요.' },
      { code: 'v005', label: '붉은색', description: '혈액 가능성이 있어 관찰이 필요해요.' },
      { code: 'v006', label: '미소화물', description: '소화되지 않은 음식물이 섞인 상태예요.' },
      { code: 'v007', label: '헤어볼', description: '털뭉치 토출 증상일 수 있어요.' },
      { code: 'v008', label: '풀', description: '풀 섭취 후 구토 가능성이 있어요.' },
    ],
  },
  a002: {
    title: '상처 상태',
    options: [
      { code: 'w001', label: '얕은 상처', description: '피부 표면 위주의 가벼운 상처예요.' },
      { code: 'w002', label: '깊은 상처', description: '피부 아래까지 손상된 깊은 상처예요.' },
      { code: 'w003', label: '고름', description: '고름/진물이 보여 감염 가능성이 있어요.' },
      { code: 'w004', label: '출혈', description: '지속적인 출혈이 관찰돼요.' },
    ],
  },
  a003: {
    title: '기침 형태',
    options: [
      { code: 'c001', label: '마른 기침', description: '가래 소리 없이 마른 기침이 나와요.' },
      { code: 'c002', label: '젖은 기침', description: '가래/분비물 소리가 섞여 들려요.' },
      { code: 'c003', label: '발작성 기침', description: '연속적으로 발작처럼 기침해요.' },
      { code: 'c004', label: '역재채기 의심', description: '컥컥하며 들이마시는 역재채기 양상이에요.' },
    ],
  },
  a0010: {
    title: '호흡 상태',
    options: [
      { code: 'b001', label: '빠른 호흡', description: '평소보다 호흡수가 빠르게 증가했어요.' },
      { code: 'b002', label: '얕은 호흡', description: '숨이 얕고 짧게 반복돼요.' },
      { code: 'b003', label: '힘들게 호흡', description: '숨쉴 때 배/가슴에 힘이 많이 들어가요.' },
      { code: 'b004', label: '쌕쌕거림', description: '호흡 시 쌕쌕거리는 소리가 들려요.' },
    ],
  },
  a004: {
    title: '경련 상태',
    options: [
      { code: 's001', label: '짧은 경련(1분 미만)', description: '경련이 짧게 끝났어요.' },
      { code: 's002', label: '지속 경련', description: '1~5분 사이로 경련이 지속됐어요.' },
      { code: 's003', label: '장시간 경련', description: '5분 이상 경련이 이어졌어요.' },
      { code: 's004', label: '반복 경련', description: '하루 안에 경련이 반복됐어요.' },
    ],
  },
};

export interface AbnormalValues {
  symptom: string | null;
  count: number;
  detail: string | null;
}

export const EMPTY_ABNORMAL: AbnormalValues = { symptom: null, count: 1, detail: null };

export const ABNORMAL_TEXT = {
  title: '이상 증상',
  add: '증상 추가',
  required: '증상을 추가해주세요.',
};

export const validateAbnormal = (values: AbnormalValues): string | null => (values.symptom ? null : ABNORMAL_TEXT.required);
