import type { DiaryOption } from './abnormal';

export type BehaviorSpecies = 'dog' | 'cat';
export type BehaviorKind = 'EVENT' | 'TRAINING';

export const BEHAVIOR_CODES: Record<string, { species: BehaviorSpecies; label: string }> = {
  d01: { species: 'dog', label: '짖음' },
  d02: { species: 'dog', label: '하울링·낑낑거림' },
  d03: { species: 'dog', label: '낯선 사람에게 공격(물기·으르렁)' },
  d04: { species: 'dog', label: '가족에게 공격' },
  d05: { species: 'dog', label: '다른 개에게 공격' },
  d06: { species: 'dog', label: '만질 때 공격(발·귀·미용)' },
  d07: { species: 'dog', label: '밥·간식·장난감 지키기' },
  d08: { species: 'dog', label: '배변 실수' },
  d09: { species: 'dog', label: '실내 마킹' },
  d10: { species: 'dog', label: '혼자 있을 때 문제(분리불안)' },
  d11: { species: 'dog', label: '물어뜯기·망가뜨리기' },
  d12: { species: 'dog', label: '소리 공포(천둥·폭죽)' },
  d13: { species: 'dog', label: '사람·낯선 것 겁냄' },
  d14: { species: 'dog', label: '사람에게 뛰어오르기' },
  d15: { species: 'dog', label: '산책 줄 당기기' },
  d16: { species: 'dog', label: '산책 중 짖고 달려들기' },
  d17: { species: 'dog', label: '쫓기(차·자전거·고양이)' },
  d18: { species: 'dog', label: '식분·이상한 것 먹기' },
  d19: { species: 'dog', label: '반복 행동(꼬리 쫓기·과하게 핥기)' },
  d20: { species: 'dog', label: '기타' },
  c01: { species: 'cat', label: '화장실 밖 소변' },
  c02: { species: 'cat', label: '화장실 밖 대변' },
  c03: { species: 'cat', label: '스프레이(소변 마킹)' },
  c04: { species: 'cat', label: '가구·벽 스크래칭' },
  c05: { species: 'cat', label: '놀다가 물기·할퀴기' },
  c06: { species: 'cat', label: '쓰다듬을 때 물기' },
  c07: { species: 'cat', label: '같이 사는 고양이와 싸움' },
  c08: { species: 'cat', label: '사람에게 공격' },
  c09: { species: 'cat', label: '손님·낯선 사람 피해 숨기' },
  c10: { species: 'cat', label: '소리·새로운 것 겁냄' },
  c11: { species: 'cat', label: '밤에 울기·과하게 울기' },
  c12: { species: 'cat', label: '새벽에 깨우기' },
  c13: { species: 'cat', label: '과하게 핥기·털 뽑기' },
  c14: { species: 'cat', label: '천·비닐·식물 씹기(이식증)' },
  c15: { species: 'cat', label: '조리대·식탁 올라가기' },
  c16: { species: 'cat', label: '창밖 보고 흥분해 공격(전가 공격)' },
  c17: { species: 'cat', label: '혼자 있을 때 문제' },
  c18: { species: 'cat', label: '기타' },
};

export const PET_SPECIES: BehaviorSpecies = 'dog';

export const RECENT_BEHAVIORS = ['d15', 'd01'];

export const behaviorCodesFor = (species: BehaviorSpecies): string[] => Object.keys(BEHAVIOR_CODES).filter((code) => BEHAVIOR_CODES[code].species === species);

export const behaviorOptions = (species: BehaviorSpecies = PET_SPECIES): DiaryOption[] => {
  const codes = behaviorCodesFor(species);
  const recent = RECENT_BEHAVIORS.filter((code) => codes.includes(code));
  return [...recent, ...codes.filter((code) => !recent.includes(code))].map((code) => ({ code, label: BEHAVIOR_CODES[code].label }));
};

export const otherBehaviorCode = (species: BehaviorSpecies = PET_SPECIES): string => behaviorCodesFor(species).at(-1) ?? 'd20';

export const behaviorLabel = (code: string | null | undefined): string => (code ? (BEHAVIOR_CODES[code]?.label ?? '') : '');

type Level = { label: string; help: string | null };

export const INTENSITY_LEVELS: Level[] = [
  { label: '없음', help: null },
  { label: '약함', help: '바로 진정했어요' },
  { label: '보통', help: '말리면 멈췄어요' },
  { label: '심함', help: '한참 이어졌어요' },
  { label: '위험', help: '물거나 다치게 했거나 물건을 망가뜨렸어요' },
];

export const CAT_INTENSITY_LEVELS: Level[] = [
  { label: '없음', help: null },
  { label: '가끔', help: '가끔 하고 금방 멈춰요' },
  { label: '하루 한 번', help: '하루 한 번쯤 해요' },
  { label: '하루 여러 번', help: '하루에 여러 번 해요' },
  { label: '다치게 함·망가뜨림', help: '사람이나 다른 동물을 다치게 했거나 물건을 망가뜨렸어요' },
];

export const COUNT_LEVELS: Level[] = [
  { label: '없음', help: null },
  { label: '1회', help: null },
  { label: '2회', help: null },
  { label: '3~4회', help: null },
  { label: '5회 이상', help: null },
];

export const ELIMINATION_BEHAVIORS = ['d08', 'd09', 'c01', 'c02', 'c03'];
export const isEliminationBehavior = (code: string | null): boolean => !!code && ELIMINATION_BEHAVIORS.includes(code);
export const isBarkMinutesBehavior = (code: string | null): boolean => code === 'd01';

export const intensityLevelsFor = (code: string | null): Level[] => {
  if (isEliminationBehavior(code)) return COUNT_LEVELS;
  return code && BEHAVIOR_CODES[code]?.species === 'cat' ? CAT_INTENSITY_LEVELS : INTENSITY_LEVELS;
};
export const isCatFrequencyBehavior = (code: string | null): boolean => intensityLevelsFor(code) === CAT_INTENSITY_LEVELS;
export const isDailyRecordBehavior = (code: string | null): boolean => isEliminationBehavior(code) || isCatFrequencyBehavior(code);
export const CAT_SEVERAL_LEVEL = '3';
export const CAT_SEVERAL_COUNTS = ['2', '3', '4'];

export const SITUATIONS: Record<string, string> = {
  s01: '혼자 있음',
  s02: '초인종·소리',
  s03: '낯선 사람',
  s04: '다른 동물',
  s05: '만짐·미용',
  s06: '밥·간식·장난감',
  s07: '산책 중',
  s08: '화장실 바뀜',
  s09: '모름',
};
export const situationsFor = (behavior: string | null): string[] => {
  const species = behavior ? BEHAVIOR_CODES[behavior]?.species : PET_SPECIES;
  return Object.keys(SITUATIONS).filter((code) => (code !== 's07' || species === 'dog') && (code !== 's08' || isEliminationBehavior(behavior)));
};

export const PLACES: Record<string, string> = { p01: '화장실 옆', p02: '매트', p03: '이불', p04: '소파', p05: '현관', p06: '그 밖' };

export const RESPONSES: Record<string, string> = {
  r01: '모른 척하기',
  r02: '다른 행동 시키기',
  r03: '간식으로 달래기',
  r04: '안아 주기·말 걸기',
  r05: '자리 떼어 놓기',
  r06: '혼내기',
};

export const METHODS: Record<string, string> = {
  m01: '자극 줄이기',
  m02: '조금씩 익숙하게',
  m03: '간식과 짝짓기',
  m04: '대신할 행동 가르치기',
  m05: '조용할 때 칭찬',
  m06: '놀이·운동·먹이 퍼즐',
  m07: '혼자 있기 연습',
  m08: '화장실 청소·늘리기',
  m09: '전문가와 함께',
  m10: '기타',
};

export const TRAINING_RESULTS: Record<string, string> = { '1': '어려웠어요', '2': '보통이었어요', '3': '잘됐어요' };
export const MINUTE_OPTIONS = ['5', '10', '15', '30'];
export const MAX_ALSO_OPTIONS = 6;

export const BEHAVIOR_TEXT = {
  behavior: '행동 종류',
  pickBehavior: '행동 추가',
  kind: '기록 종류',
  kindEvent: '있었던 행동',
  kindTraining: '교정 연습',
  unitEach: '있을 때마다 한 건씩 적어 주세요. 모아보기에서 주별 횟수로 줄었는지 볼 수 있어요.',
  unitDaily: '하루에 한 건, 그날 모아서 적어 주세요. 모아보기에서 주별 횟수로 줄었는지 볼 수 있어요.',
  intensity: '강도',
  count: '횟수',
  catCountHelp: '몇 번쯤이었는지 고르면 주별 횟수에 그만큼 셀게요.',
  barkMinutes: '짖은 시간',
  place: '장소(다중 선택)',
  situation: '상황(다중 선택)',
  response: '내 반응(다중 선택)',
  trainingAlso: '같이 연습한 행동(다중 선택)',
  trainingAlsoHelp: '숙제 하나가 여러 행동에 걸치면 같이 골라 주세요. 고른 행동에도 연습으로 셀게요.',
  method: '연습 방법(다중 선택)',
  result: '연습 결과',
  minutes: '연습 시간',
  minutesUnit: (n: string) => `${n}분`,
  tipsTitle: '조언',
  tip: '이렇게 해 보세요',
  sources: '근거',
  sourcesToggle: (n: number) => `근거 ${n}개`,
  searchEmptyDescription: '검색어를 변경하거나 기타로 등록해주세요.',
  searchFallback: '"기타"로 등록',
};

export const BEHAVIOR_ERRORS = {
  behavior: '행동 종류를 골라 주세요',
  intensity: '강도를 골라 주세요',
  count: '몇 번이었는지 골라 주세요',
  method: '연습 방법을 골라 주세요',
  result: '연습 결과를 골라 주세요',
};

export interface BehaviorForm {
  behavior: string | null;
  kind: BehaviorKind;
  level: string | null;
  minutes: string | null;
  catCount: string | null;
  situations: string[];
  places: string[];
  responses: string[];
  methods: string[];
  also: string[];
}

export const EMPTY_BEHAVIOR: BehaviorForm = { behavior: null, kind: 'EVENT', level: null, minutes: null, catCount: null, situations: [], places: [], responses: [], methods: [], also: [] };

export const pickBehavior = (form: BehaviorForm, code: string): BehaviorForm => {
  const tableChanged = form.kind === 'EVENT' && intensityLevelsFor(code) !== intensityLevelsFor(form.behavior);
  return {
    ...form,
    behavior: code,
    level: tableChanged ? null : form.level,
    minutes: form.kind === 'EVENT' && !isBarkMinutesBehavior(code) ? null : form.minutes,
    places: isEliminationBehavior(code) ? form.places : [],
    catCount: isCatFrequencyBehavior(code) ? form.catCount : null,
    also: form.also.filter((other) => other !== code),
  };
};

export const changeKind = (form: BehaviorForm, kind: BehaviorKind): BehaviorForm => (kind === form.kind ? form : { ...EMPTY_BEHAVIOR, behavior: form.behavior, kind });

export const validateBehavior = (form: BehaviorForm): string | null => {
  if (!form.behavior) return BEHAVIOR_ERRORS.behavior;
  if (form.kind === 'EVENT') return form.level ? null : isEliminationBehavior(form.behavior) ? BEHAVIOR_ERRORS.count : BEHAVIOR_ERRORS.intensity;
  if (form.methods.length === 0) return BEHAVIOR_ERRORS.method;
  return form.level ? null : BEHAVIOR_ERRORS.result;
};

export const toggleCode = (list: string[], code: string): string[] => (list.includes(code) ? list.filter((item) => item !== code) : [...list, code]);

export interface Advice {
  key: string;
  title: string;
  body: string;
  sources: string[];
  status: 'warning' | 'info';
}

const SRC = {
  chung2016: 'Chung et al. 2016, J Vet Behav 11:26–30',
  ziv2017: 'Ziv 2017, J Vet Behav 19:50–60',
  china2020: 'China et al. 2020, Front Vet Sci',
  mills2020: 'Mills et al. 2020, Animals 10(2):318',
  aaha2015: 'AAHA 2015 Canine and Feline Behavior Management Guidelines',
  merckDog: 'Merck Veterinary Manual: Behavior Problems of Dogs',
};

export type IssueId = 'vetFirst' | 'punish' | 'rewardAttention' | 'inconsistent' | 'aloneLong' | 'exerciseLow' | 'doorTrigger';

export const BEHAVIOR_ISSUES: Record<IssueId, Omit<Advice, 'key'>> = {
  vetFirst: {
    title: '병원에서 먼저 확인해 보세요',
    body: '아프거나 불편한 곳이 있으면 문제 행동이 생기거나 늘 수 있어요. 행동 교정 전에 진료로 몸의 원인을 먼저 확인하세요.',
    sources: [SRC.mills2020, SRC.aaha2015],
    status: 'warning',
  },
  punish: {
    title: '혼내기 대신 칭찬으로 바꿔요',
    body: '혼내면 불안과 두려움이 커져 행동이 더 나빠질 수 있어요. 얌전해지거나 원하는 행동을 한 순간에 간식·칭찬을 주세요.',
    sources: [SRC.ziv2017, SRC.china2020],
    status: 'warning',
  },
  rewardAttention: {
    title: '그 행동을 할 때 관심·간식을 주지 않아요',
    body: '짖거나 울 때 달래거나 안아 주면 그렇게 하면 관심을 받는다고 배울 수 있어요. 그동안은 반응하지 말고, 2~3초 조용해진 순간에 칭찬하세요.',
    sources: [SRC.merckDog, SRC.aaha2015],
    status: 'warning',
  },
  inconsistent: {
    title: '가족 모두 같은 규칙으로',
    body: '사람마다 반응이 다르면 반려동물이 헷갈려요. 짖을 때 어떻게 할지 한 가지로 정해 가족이 함께 지켜 주세요.',
    sources: [SRC.aaha2015],
    status: 'info',
  },
  aloneLong: {
    title: '혼자 있는 시간을 줄여요',
    body: '국내 조사에서 하루 3~6시간 이상 혼자 있는 개가 더 많이 짖었어요. 중간에 들여다보거나, 나가기 전 먹이 퍼즐을 주세요.',
    sources: [SRC.chung2016],
    status: 'info',
  },
  exerciseLow: {
    title: '산책·놀이를 늘려요',
    body: '산책이 적을수록 짖음이 많았다는 국내 조사가 있어요. 산책 시간과 냄새 맡기 놀이를 조금씩 늘려 보세요.',
    sources: [SRC.chung2016],
    status: 'info',
  },
  doorTrigger: {
    title: '소리·창밖 자극을 줄이고 익숙하게',
    body: '창문을 가리고, 초인종 소리를 아주 작게 들려주며 간식을 주는 연습을 조금씩 키워 가세요(조금씩 익숙하게·간식과 짝짓기).',
    sources: [SRC.aaha2015],
    status: 'info',
  },
};

export const ATTENTION_BEHAVIORS = ['d01', 'd02', 'd10', 'd14', 'c11', 'c12', 'c17'];

export const BEHAVIOR_TIPS: Record<string, { tip: string; sources: string[]; vetFirst: boolean }> = {
  d01: { tip: '산책을 하루 한 번 더 늘리고, 창밖을 보고 짖으면 커튼을 쳐 주세요. 짖다가 조용해지는 순간 바로 칭찬하고 간식을 주세요.', sources: ['Chung TH et al. 2016, J Vet Behav 11:26–30', 'Hammerle M et al. 2015, J Am Anim Hosp Assoc 51(4):205–221 (2015 AAHA Canine and Feline Behavior Management Guidelines)'], vetFirst: false },
  d02: { tip: '배변·산책·놀이를 먼저 챙겨 주고, 낑낑거림이 멈추고 차분해진 순간에 다가가 칭찬해 주세요. 혼자 있을 때 운다면 영상으로 확인해 보세요.', sources: ['Hammerle M et al. 2015, J Am Anim Hosp Assoc 51(4):205–221 (2015 AAHA Canine and Feline Behavior Management Guidelines)', 'Merck Veterinary Manual – Behavior Problems of Dogs (Borns-Weil, 2025)'], vetFirst: false },
  d03: { tip: '낯선 사람과는 개가 편히 있는 거리를 지키고, 사람이 보일 때마다 간식을 줘 좋은 기억으로 바꿔 주세요. 인사는 개가 원할 때만 하게 해 주세요.', sources: ['Haug LI 2008, Vet Clin North Am Small Anim Pract 38(5):1023–1041', 'Hammerle M et al. 2015, J Am Anim Hosp Assoc 51(4):205–221 (2015 AAHA Canine and Feline Behavior Management Guidelines)'], vetFirst: false },
  d04: { tip: '으르렁거림은 \'싫다\'는 경고예요. 그 순간엔 한 걸음 물러나고, 언제 그랬는지 기록해 그 상황을 피해 주세요. 통증 때문일 수 있으니 진료도 받아 보세요.', sources: ['Mills DS et al. 2020, Animals 10(2):318', 'Hammerle M et al. 2015, J Am Anim Hosp Assoc 51(4):205–221 (2015 AAHA Canine and Feline Behavior Management Guidelines)'], vetFirst: true },
  d05: { tip: '다른 개는 우리 개가 차분할 수 있는 거리에서만 만나게 하고, 상대를 보고도 차분하면 간식을 주세요. 가까워지면 방향을 돌려 거리를 벌려 주세요.', sources: ['Haug LI 2008, Vet Clin North Am Small Anim Pract 38(5):1023–1041', 'Hammerle M et al. 2015, J Am Anim Hosp Assoc 51(4):205–221 (2015 AAHA Canine and Feline Behavior Management Guidelines)'], vetFirst: false },
  d06: { tip: '아픈 곳이 없는지 먼저 진료를 받아 주세요. 그다음 발·귀를 1초만 만지고 바로 간식 주기부터 시작해, 편해하면 조금씩 늘려 주세요.', sources: ['Mills DS et al. 2020, Animals 10(2):318', 'Hammerle M et al. 2015, J Am Anim Hosp Assoc 51(4):205–221 (2015 AAHA Canine and Feline Behavior Management Guidelines)'], vetFirst: true },
  d07: { tip: '먹거나 물고 있을 땐 그대로 두고, 지나가며 더 맛있는 간식을 그릇에 넣어 주세요. 평소에 간식과 바꾸는 \'놔\' 연습을 해 두세요.', sources: ['Jacobs JA et al. 2018, Prev Vet Med 161:143–153', 'Hammerle M et al. 2015, J Am Anim Hosp Assoc 51(4):205–221 (2015 AAHA Canine and Feline Behavior Management Guidelines)'], vetFirst: false },
  d08: { tip: '정해진 시간마다 배변 장소로 데려가고, 성공하면 바로 간식으로 보상해 주세요. 실수는 조용히 치우고, 잘 가리던 개가 갑자기 실수하면 진료를 받아 보세요.', sources: ['Merck Veterinary Manual – Behavior Problems of Dogs (Borns-Weil, 2025)', 'Chung TH et al. 2016, J Vet Behav 11:26–30'], vetFirst: true },
  d09: { tip: '집 안에서는 지켜볼 수 있을 때만 자유롭게 두고, 혼자 둘 땐 마킹하던 곳에 못 가게 막아 주세요. 중성화 전인 수컷이라면 수의사와 상의해 보세요.', sources: ['Merck Veterinary Manual – Behavior Problems of Dogs (Borns-Weil, 2025)', 'Neilson JC et al. 1997, J Am Vet Med Assoc 211(2):180–182'], vetFirst: false },
  d10: { tip: '나갈 때 오래 씹을 수 있는 간식 장난감을 주고, 산책·놀이로 운동량을 늘려 주세요. 혼자 있는 모습을 영상으로 찍어 변화를 확인해 보세요.', sources: ['Takeuchi Y et al. 2000, J Am Vet Med Assoc 217(3):342–345', 'Hammerle M et al. 2015, J Am Anim Hosp Assoc 51(4):205–221 (2015 AAHA Canine and Feline Behavior Management Guidelines)'], vetFirst: false },
  d11: { tip: '씹어도 되는 장난감과 간식을 채운 장난감을 번갈아 주고, 혼자 둘 때는 망가뜨리면 안 되는 물건을 치운 안전한 공간에 있게 해 주세요.', sources: ['Chung TH et al. 2016, J Vet Behav 11:26–30', 'Merck Veterinary Manual – Behavior Problems of Dogs (Borns-Weil, 2025)'], vetFirst: false },
  d12: { tip: '소리가 날 땐 창문·커튼을 닫고 숨을 수 있는 조용한 자리를 마련해 주세요. 평소엔 녹음한 소리를 아주 작게 틀며 간식을 주고 조금씩 키워 주세요.', sources: ['Riemer S 2019, PLoS One 14(9):e0218150', 'Merck Veterinary Manual – Behavior Problems of Dogs (Borns-Weil, 2025)'], vetFirst: false },
  d13: { tip: '낯선 사람이나 물건은 개가 편한 거리에서 보여 주고 간식으로 좋은 기억을 만들어 주세요. 다가갈지는 개가 정하게 하고, 숨을 자리도 마련해 주세요.', sources: ['Puurunen J et al. 2020, Sci Rep 10(1):3527', 'Hammerle M et al. 2015, J Am Anim Hosp Assoc 51(4):205–221 (2015 AAHA Canine and Feline Behavior Management Guidelines)'], vetFirst: false },
  d14: { tip: '네 발이 바닥에 있을 때만 인사하고 간식을 주세요. 뛰어오르면 말없이 등을 돌리고, 가족 모두 같은 방법으로 해 주세요.', sources: ['Hammerle M et al. 2015, J Am Anim Hosp Assoc 51(4):205–221 (2015 AAHA Canine and Feline Behavior Management Guidelines)', 'VCA Animal Hospitals – Dog Behavior Problems: Greeting Behavior – Jumping Up'], vetFirst: false },
  d15: { tip: '줄이 팽팽해지면 멈춰 서고, 느슨해지면 다시 걸으며 옆에서 걸을 때 간식을 주세요. 당기는 개에게는 조이지 않는 앞고리 하네스가 도움이 돼요.', sources: ['Cavalli C, Protopopova A 2025, Animals 15(15):2162', 'Hammerle M et al. 2015, J Am Anim Hosp Assoc 51(4):205–221 (2015 AAHA Canine and Feline Behavior Management Guidelines)'], vetFirst: false },
  d16: { tip: '개가 적은 시간과 길로 산책하고, 다른 개가 보이면 먼저 거리를 벌려 주세요. 그 거리에서 차분히 바라보면 바로 간식을 주세요.', sources: ['Haug LI 2008, Vet Clin North Am Small Anim Pract 38(5):1023–1041', 'Merck Veterinary Manual – Behavior Problems of Dogs (Borns-Weil, 2025)'], vetFirst: false },
  d17: { tip: '차·자전거·고양이가 많은 곳에선 줄을 짧게 잡아 주세요. 대상이 보일 때 보호자를 쳐다보면 아주 좋아하는 간식으로 크게 보상해 주세요.', sources: ['Merck Veterinary Manual – Behavior Problems of Dogs (Borns-Weil, 2025)', 'Hammerle M et al. 2015, J Am Anim Hosp Assoc 51(4):205–221 (2015 AAHA Canine and Feline Behavior Management Guidelines)'], vetFirst: false },
  d18: { tip: '변은 보자마자 치우고, 주워 먹을 만한 물건은 닿지 않는 곳에 두세요. 간식을 채운 장난감으로 씹을 거리를 주고, 자주 삼키면 진료를 받아 보세요.', sources: ['Hart BL et al. 2018, Vet Med Sci 4(2):106–114', 'Merck Veterinary Manual – Behavior Problems of Dogs (Borns-Weil, 2025)'], vetFirst: true },
  d19: { tip: '피부나 통증 문제가 없는지 먼저 진료를 받아 주세요. 행동이 시작되면 부드럽게 불러 다른 놀이로 바꿔 주고, 산책·노즈워크로 몸과 머리를 쓰게 해 주세요.', sources: ['Luescher AU 2003, Vet Clin North Am Small Anim Pract 33(2):253–267', 'Merck Veterinary Manual – Behavior Problems of Dogs (Borns-Weil, 2025)'], vetFirst: true },
  d20: { tip: '언제·어디서·무슨 일 다음에 그랬는지 기록하고 짧은 영상을 모아 두세요. 모은 기록을 들고 수의사나 행동 전문가와 상의해 주세요.', sources: ['Hammerle M et al. 2015, J Am Anim Hosp Assoc 51(4):205–221 (2015 AAHA Canine and Feline Behavior Management Guidelines)', 'Merck Veterinary Manual – Diagnosis of Behavior Problems in Animals (Pankratz, 2025)'], vetFirst: false },
  c01: { tip: '먼저 진료로 방광·요로 문제를 확인해 주세요. 화장실은 고양이 수보다 하나 더 두고, 향 없는 응고형 모래를 하루 한 번 이상 치워 주세요.', sources: ['Carney HC et al. 2014, J Feline Med Surg 16(7):579–598 (AAFP and ISFM Guidelines for Diagnosing and Solving House-Soiling Behavior in Cats)', 'Padalino B et al. 2023, J Feline Med Surg 25(11):1098612X231202482'], vetFirst: true },
  c02: { tip: '변비나 관절 통증이 없는지 먼저 진료를 받아 주세요. 턱이 낮고 넉넉한 화장실을 조용한 곳에 하나 더 두고 매일 치워 주세요.', sources: ['Padalino B et al. 2023, J Feline Med Surg 25(11):1098612X231202482', 'Carney HC et al. 2014, J Feline Med Surg 16(7):579–598 (AAFP and ISFM Guidelines for Diagnosing and Solving House-Soiling Behavior in Cats)'], vetFirst: true },
  c03: { tip: '뿌린 자리는 냄새가 남지 않게 매일 닦고, 화장실은 매일 치우고 매주 모래를 갈아 주세요. 다른 고양이와 부딪힌 일이 있었는지도 기록해 보세요.', sources: ['Pryor PA et al. 2001, J Am Vet Med Assoc 219(12):1709–1713', 'Carney HC et al. 2014, J Feline Med Surg 16(7):579–598 (AAFP and ISFM Guidelines for Diagnosing and Solving House-Soiling Behavior in Cats)'], vetFirst: true },
  c04: { tip: '긁는 가구 바로 옆에 밧줄을 감은 높고 튼튼한 기둥형 스크래처를 세워 두고, 고양이가 쓰면 칭찬과 간식으로 보상해 주세요.', sources: ['Wilson C et al. 2016, J Feline Med Surg 18(10):791–797', 'Moesta A et al. 2018, J Feline Med Surg 20(10):891–899'], vetFirst: false },
  c05: { tip: '손발 대신 낚싯대 같은 장난감으로 매일 사냥 놀이를 해 주세요. 물려고 하면 장난감을 던져 그쪽으로 관심을 돌려 주세요.', sources: ['Amat M, Manteca X 2019, J Feline Med Surg 21(3):245–255', 'Ellis SLH et al. 2013, J Feline Med Surg 15(3):219–230 (AAFP and ISFM Feline Environmental Needs Guidelines)'], vetFirst: false },
  c06: { tip: '고양이가 먼저 다가올 때 볼·턱 주변만 짧게 쓰다듬어 주세요. 꼬리를 탁탁 치거나 귀가 젖혀지면 바로 손을 떼 주세요.', sources: ['Haywood C et al. 2021, Front Vet Sci 8:714143', 'Ellis SLH et al. 2013, J Feline Med Surg 15(3):219–230 (AAFP and ISFM Feline Environmental Needs Guidelines)'], vetFirst: false },
  c07: { tip: '밥·물·화장실·쉴 곳을 고양이마다 따로, 서로 떨어진 곳에 마련해 주세요. 크게 싸웠다면 방을 나눴다가 처음 만나는 것처럼 천천히 다시 소개해 주세요.', sources: ['Ramos D 2019, J Feline Med Surg 21(3):221–233', 'Ellis SLH et al. 2013, J Feline Med Surg 15(3):219–230 (AAFP and ISFM Feline Environmental Needs Guidelines)'], vetFirst: false },
  c08: { tip: '공격 직전 상황을 기록해 그 상황을 피하고, 고양이가 스스로 다가올 때만 만져 주세요. 갑자기 생겼다면 통증 같은 몸의 문제부터 진료로 확인해 주세요.', sources: ['Amat M, Manteca X 2019, J Feline Med Surg 21(3):245–255', 'Mills DS et al. 2020, Animals 10(2):318'], vetFirst: true },
  c09: { tip: '손님이 오면 고양이가 숨을 수 있는 상자나 방을 열어 두고, 스스로 나올 때까지 기다려 주세요. 손님에게는 조용히 앉아 있어 달라고 부탁해 주세요.', sources: ['van der Leij WJR et al. 2019, PLoS One 14(10):e0223492', 'Ellis SLH et al. 2013, J Feline Med Surg 15(3):219–230 (AAFP and ISFM Feline Environmental Needs Guidelines)'], vetFirst: false },
  c10: { tip: '언제든 숨을 수 있는 자리를 마련해 주세요. 무서워하는 소리나 물건은 멀리서 약하게 보여 주며 간식을 주고, 괜찮아하면 조금씩 가까이해 주세요.', sources: ['van der Leij WJR et al. 2019, PLoS One 14(10):e0223492', 'Hammerle M et al. 2015, J Am Anim Hosp Assoc 51(4):205–221 (2015 AAHA Canine and Feline Behavior Management Guidelines)'], vetFirst: false },
  c11: { tip: '나이 든 고양이라면 먼저 진료로 몸 상태를 확인해 주세요. 낮에 놀이와 먹이 퍼즐로 몸과 머리를 쓰게 하면 밤을 편히 보내는 데 도움이 돼요.', sources: ['Denenberg S et al. 2024, Vet Clin North Am Small Anim Pract 54(1):153–168', 'Merck Veterinary Manual – Behavior Problems of Cats (Kim, 2025)'], vetFirst: true },
  c12: { tip: '먹이 퍼즐이나 자동 급식기로 밥을 조금씩 나눠 먹게 하고, 자기 전에 사냥 놀이를 해 주세요. 밥은 울 때가 아니라 조용할 때 챙겨 주세요.', sources: ['Dantas LM et al. 2016, J Feline Med Surg 18(9):723–732', 'Ellis SLH et al. 2013, J Feline Med Surg 15(3):219–230 (AAFP and ISFM Feline Environmental Needs Guidelines)'], vetFirst: false },
  c13: { tip: '털이 빠질 만큼 핥으면 먼저 피부·알레르기 진료를 받아 주세요. 언제 어디를 핥는지 기록하고, 놀이와 숨을 곳을 늘려 주세요.', sources: ['Waisglass SE et al. 2006, J Am Vet Med Assoc 228(11):1705–1709', 'Merck Veterinary Manual – Behavior Problems of Cats (Kim, 2025)'], vetFirst: true },
  c14: { tip: '끈·비닐·천은 닫힌 곳에 치워 두고, 씹어도 되는 캣그라스와 장난감, 놀이 시간을 늘려 주세요. 자주 토하거나 삼켰다면 진료를 받아 주세요.', sources: ['Demontigny-Bédard I et al. 2016, J Feline Med Surg 18(8):652–657', 'Merck Veterinary Manual – Behavior Problems of Cats (Kim, 2025)'], vetFirst: true },
  c15: { tip: '조리대 근처에 캣타워 같은 높은 자리를 두고, 거기 올라가면 간식으로 보상해 주세요. 조리대 위 음식은 바로 치워 두세요.', sources: ['Hammerle M et al. 2015, J Am Anim Hosp Assoc 51(4):205–221 (2015 AAHA Canine and Feline Behavior Management Guidelines)', 'Merck Veterinary Manual – Behavior Problems of Cats (Kim, 2025)'], vetFirst: false },
  c16: { tip: '창밖을 보고 흥분했다면 손을 거두고, 조용한 방에서 혼자 진정할 시간을 주세요. 창 아래쪽을 가려 바깥 고양이가 보이지 않게 해 주세요.', sources: ['Amat M, Manteca X 2019, J Feline Med Surg 21(3):245–255', 'Merck Veterinary Manual – Behavior Problems of Cats (Kim, 2025)'], vetFirst: false },
  c17: { tip: '외출 전에 놀아 주고, 혼자 있을 때 가지고 놀 장난감과 먹이 퍼즐을 꺼내 두세요. 집을 비운 사이 모습을 영상으로 확인해 보세요.', sources: ['de Souza Machado D et al. 2020, PLoS One 15(4):e0230999', 'Ellis SLH et al. 2013, J Feline Med Surg 15(3):219–230 (AAFP and ISFM Feline Environmental Needs Guidelines)'], vetFirst: false },
  c18: { tip: '언제·어디서·무슨 일 다음에 그랬는지 기록하고 짧은 영상을 모아 두세요. 모은 기록을 들고 수의사나 고양이 행동 전문가와 상의해 주세요.', sources: ['Hammerle M et al. 2015, J Am Anim Hosp Assoc 51(4):205–221 (2015 AAHA Canine and Feline Behavior Management Guidelines)', 'Merck Veterinary Manual – Diagnosis of Behavior Problems in Animals (Pankratz, 2025)'], vetFirst: false },
};

export const adviceFor = (code: string | null, responses: string[] = []): Advice[] => {
  if (!code) return [];
  const tip = BEHAVIOR_TIPS[code];
  const list: Advice[] = [];
  if (tip?.vetFirst) list.push({ key: 'vetFirst', ...BEHAVIOR_ISSUES.vetFirst });
  if (responses.includes('r06')) list.push({ key: 'punish', ...BEHAVIOR_ISSUES.punish });
  if (ATTENTION_BEHAVIORS.includes(code) && responses.some((r) => r === 'r03' || r === 'r04')) list.push({ key: 'rewardAttention', ...BEHAVIOR_ISSUES.rewardAttention });
  if (tip) list.push({ key: 'tip', title: BEHAVIOR_TEXT.tip, body: tip.tip, sources: tip.sources, status: 'info' });
  return list;
};
