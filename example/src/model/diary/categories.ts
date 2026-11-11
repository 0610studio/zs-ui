export type DiaryCategoryCode = 'memo' | 'todo' | 'weight' | 'play' | 'poopee' | 'measure' | 'abnormal' | 'medical' | 'feed' | 'walk' | 'behavior';

export interface DiaryCategory {
  code: DiaryCategoryCode;
  label: string;
  color: string;
  summary: string;
  features: string[];
}

export const DIARY_CATEGORIES: readonly DiaryCategory[] = [
  { code: 'memo', label: '메모', color: '#AFF581', summary: '간단한 메모는 쉽고 빠르게', features: ['정해진 형식 없이 자유롭게 적어요', '산책 중에도 지도 위에 메모를 남겨요'] },
  {
    code: 'todo',
    label: '할일',
    color: '#D2E6FF',
    summary: '할일은 분담하고, 알림은 필요한 것만',
    features: ['할일마다 담당할 가족을 정해요', '정한 시간에 푸시 알림으로 알려줘요', '주간 목표를 세우고 달성률을 확인해요'],
  },
  {
    code: 'weight',
    label: '체중',
    color: '#FFC8C8',
    summary: '우리 아이 체중, 차곡차곡 기록해요',
    features: ['kg·g 단위로 편하게 입력해요', '이전보다 얼마나 늘고 줄었는지 알려줘요', '체중 변화를 그래프로 확인해요'],
  },
  {
    code: 'play',
    label: '놀이',
    color: '#d955ba',
    summary: '오늘은 몇 분이나 놀아줬지?',
    features: ['놀이 시간을 분 단위로 기록해요', '하루 동안 논 시간을 그래프로 보여줘요', '놀이 시간에 따라 아이가 한마디 건네요'],
  },
  {
    code: 'poopee',
    label: '대소변',
    color: '#FFD164',
    summary: '색상과 모양으로 꼼꼼하게 체크해요',
    features: ['소변 색·대변 색·대변모양을 그림으로 골라요', '항목마다 건강 상태 설명을 함께 보여줘요'],
  },
  {
    code: 'measure',
    label: '측정',
    color: '#78eef0',
    summary: '체온·심박·혈당으로 컨디션을 확인해요',
    features: ['체온·심박·호흡·혈압·산소포화도·혈당을 기록해요', '공복·식후처럼 측정 조건을 함께 남겨요', '심박·호흡은 화면을 톡톡 눌러 바로 재요'],
  },
  {
    code: 'abnormal',
    label: '이상증상',
    color: '#CECECE',
    summary: '평소와 다른 증상, 놓치지 말고 기록해요',
    features: ['구토·기침 등 15가지 증상과 횟수를 남겨요', '구토 모양, 기침 형태까지 자세히 골라요'],
  },
  {
    code: 'medical',
    label: '병원',
    color: '#FF9761',
    summary: '진료도 검사 결과도, 날짜별로 정리해요',
    features: ['접종·중성화·스케일링 등 진료 과목을 골라요', '검사 수치를 정상 범위와 비교해 보여줘요'],
  },
  { code: 'feed', label: '급여', color: '#A7DBD1', summary: '오늘 뭘 먹었는지, 한눈에', features: ['급여량만 넣으면 칼로리를 자동으로 계산해요', '물을 얼마나 마셨는지도 함께 기록해요'] },
  {
    code: 'walk',
    label: '산책',
    color: '#D7B8FF',
    summary: '이동 경로와 시간을 자동으로 기록해요',
    features: ['실시간 산책 또는 수동 입력으로 기록해요', '산책 중 대소변·음수량·메모를 지도에 남겨요', '산책을 마치면 산책 인증서를 받을 수 있어요'],
  },
  {
    code: 'behavior',
    label: '행동·버릇',
    color: '#8fa8ff',
    summary: '짖음·배변 실수, 기록하고 고쳐 가요',
    features: ['행동·강도·상황·내 반응을 눌러서 남겨요', '더보기의 행동 자가점검으로 바꿔 볼 점을 찾고 모아보기에서 주마다 변화를 확인해요'],
  },
];

export const findCategory = (code: string): DiaryCategory | undefined => DIARY_CATEGORIES.find((category) => category.code === code);

export const getCategory = (code: DiaryCategoryCode): DiaryCategory => findCategory(code) ?? DIARY_CATEGORIES[0];

export const CATEGORY_GROUPS: { title: string; codes: DiaryCategoryCode[] }[] = [
  { title: '일상 챙기기', codes: ['memo', 'todo'] },
  { title: '건강 살피기', codes: ['weight', 'measure', 'abnormal', 'poopee', 'medical', 'behavior'] },
  { title: '먹고 움직이기', codes: ['feed', 'play', 'walk'] },
];

export const CATEGORY_GUIDE = {
  heroTitle: '우리 아이에게 필요한\n수첩을 골라 기록해요',
  heroDescription: '건강수첩마다 기록하는 내용이 달라요.\n어떤 수첩이 있는지 알아볼까요?',
  commonTitle: '모든 건강수첩에서 함께 쓸 수 있어요',
  commonFeatures: ['사진·동영상, 장소, 소비금액을 함께 남겨요', '자주 쓰는 기록은 간편 기록으로 한 번에', '모아보기에서 일간·주간·월간 변화를 확인해요', '공동육아로 가족과 함께 기록해요'],
};

export const SELECT_SHEET_TITLE = '기록할 수첩 선택';
