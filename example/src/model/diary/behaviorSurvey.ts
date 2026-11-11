import { BEHAVIOR_ISSUES, type IssueId } from './behavior';

type Question = { id: string; text: string; multi?: boolean; options: { id: string; text: string }[] };

export const BARK_SURVEY = {
  name: '짖음',
  questions: [
    { id: 'health', text: '아파 보이는 신호가 있나요?', options: [{ id: 'yes', text: '있어요' }, { id: 'no', text: '없어요' }] },
    {
      id: 'response',
      multi: true,
      text: '짖을 때 보통 어떻게 하나요?',
      options: [
        { id: 'ignore', text: '모른 척하기' },
        { id: 'soothe', text: '이름 부르기·달래기' },
        { id: 'hug', text: '안아 주기' },
        { id: 'treat', text: '간식 주기' },
        { id: 'scold', text: '혼내기·소리 지르기' },
        { id: 'cue', text: '다른 행동 시키기' },
      ],
    },
    { id: 'family', text: '가족마다 반응이 같나요?', options: [{ id: 'same', text: '같아요' }, { id: 'diff', text: '달라요' }, { id: 'solo', text: '혼자 키워요' }] },
    { id: 'alone', text: '하루에 혼자 있는 시간은요?', options: [{ id: 'lt3', text: '3시간 미만' }, { id: '3to6', text: '3~6시간' }, { id: 'gt6', text: '6시간 넘게' }] },
    { id: 'walk', text: '하루 산책은요?', options: [{ id: 'none', text: '거의 안 해요' }, { id: 'lt30', text: '30분 미만' }, { id: 'ge30', text: '30분 이상' }] },
    {
      id: 'trigger',
      multi: true,
      text: '주로 언제 짖나요?',
      options: [
        { id: 'door', text: '초인종·현관 소리' },
        { id: 'window', text: '창밖을 볼 때' },
        { id: 'alone', text: '혼자 있을 때' },
        { id: 'attention', text: '관심을 원할 때' },
        { id: 'dog', text: '산책 중 다른 개' },
        { id: 'night', text: '밤' },
      ],
    },
  ] as Question[],
  rules: [
    { question: 'health', anyOf: ['yes'], issue: 'vetFirst' },
    { question: 'response', anyOf: ['scold'], issue: 'punish' },
    { question: 'response', anyOf: ['soothe', 'hug', 'treat'], issue: 'rewardAttention' },
    { question: 'family', anyOf: ['diff'], issue: 'inconsistent' },
    { question: 'alone', anyOf: ['3to6', 'gt6'], issue: 'aloneLong' },
    { question: 'walk', anyOf: ['none', 'lt30'], issue: 'exerciseLow' },
    { question: 'trigger', anyOf: ['door', 'window'], issue: 'doorTrigger' },
  ] as { question: string; anyOf: string[]; issue: IssueId }[],
};

export const MAX_ISSUES = 3;

export type SurveyAnswers = Record<string, string[]>;

export const matchedIssues = (answers: SurveyAnswers): IssueId[] => {
  const hit = new Set(BARK_SURVEY.rules.filter((rule) => (answers[rule.question] ?? []).some((answer) => rule.anyOf.includes(answer))).map((rule) => rule.issue));
  return (Object.keys(BEHAVIOR_ISSUES) as IssueId[]).filter((id) => hit.has(id));
};

export const surveyAnswerRows = (answers: SurveyAnswers): { question: string; answer: string }[] =>
  BARK_SURVEY.questions
    .filter((question) => (answers[question.id] ?? []).length > 0)
    .map((question) => ({
      question: question.text,
      answer: (answers[question.id] ?? []).map((id) => question.options.find((option) => option.id === id)?.text ?? id).join(', '),
    }));

const DAY = 24 * 60 * 60 * 1000;
const dot = (date: Date) => `${date.getMonth() + 1}.${date.getDate()}`;

export const windowTitle = (surveyAt: Date, index: number, now: Date = new Date()): string => {
  const start = new Date(surveyAt.getTime() + index * 14 * DAY);
  const end = new Date(start.getTime() + 13 * DAY);
  const weeks = `${index * 2 + 1}~${index * 2 + 2}주`;
  if (now.getTime() > end.getTime() + DAY) return `${weeks} · ${dot(start)}~${dot(end)}`;
  const day = Math.max(1, Math.floor((now.getTime() - start.getTime()) / DAY) + 1);
  return `${weeks} · ${dot(start)}부터 ${day}일째`;
};

export const compareFromText = (surveyAt: Date): string => {
  const date = new Date(surveyAt.getTime() + 28 * DAY);
  return `${date.getMonth() + 1}월 ${date.getDate()}일부터 첫 2주와 비교해 드려요.`;
};

export const SURVEY_TEXT = {
  target: '점검할 행동',
  issues: '바꿔 볼 점',
  hidden: (n: number) => `한 번에 ${MAX_ISSUES}가지까지만 보여 드려요. 나머지 ${n}가지는 다시 점검할 때 보여 드려요.`,
  noIssues: '지금은 바꿔 볼 점이 없어요. 행동 기록으로 변화를 지켜봐요.',
  resolved: '지난 점검보다 좋아진 점',
  progress: '점검 이후 변화(2주 단위)',
  worse: '마지막으로 끝난 2주가 첫 2주보다 줄지 않았어요. 병원이나 훈련사와 상의해 보세요. 수첩의 내보내기로 기록을 함께 볼 수 있어요.',
  recheck: '점검한 지 2주가 지났어요. 더보기 > 우리 아이 행동 관리에서 행동 자가점검을 다시 해 고칠 점이 나아졌는지 확인해 보세요.',
  answersShow: (n: number) => `점검 답 ${n}개 보기`,
  answersHide: '점검 답 접기',
  answers: '점검 답',
  pet: '반려동물',
  bark: '짖은 시간',
  owner: '보호자',
};
