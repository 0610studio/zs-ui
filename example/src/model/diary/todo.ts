export interface TodoItem {
  uid: string;
  name: string;
  weekdays: number[];
  time: string;
  goalCount: number;
  assignee?: string;
}

const MOCK_TODOS: TodoItem[] = [
  { uid: 't1', name: '아침 산책', weekdays: [0, 1, 2, 3, 4, 5, 6], time: '07:30', goalCount: 7, assignee: '아빠' },
  { uid: 't2', name: '양치하기', weekdays: [0, 1, 2, 3, 4], time: '21:00', goalCount: 5, assignee: '엄마' },
  { uid: 't3', name: '심장사상충 약 먹이기', weekdays: [5], time: '09:00', goalCount: 0 },
  { uid: 't4', name: '귀 청소', weekdays: [1, 4], time: '20:00', goalCount: 2, assignee: '엄마' },
];

export async function fetchTodos(): Promise<TodoItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return MOCK_TODOS;
}

const WEEKDAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

export function formatWeekdays(days: number[]): string {
  const sorted = [...days].sort((a, b) => a - b);
  if (sorted.length === 7) return '매일';
  if (sorted.join(',') === '0,1,2,3,4') return '월~금';
  if (sorted.length === 1) return `${WEEKDAY_LABELS[sorted[0]]}요일`;
  return sorted.map((day) => WEEKDAY_LABELS[day]).join(',');
}

export function formatTodoTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hours < 12 ? '오전' : '오후'} ${hour12}시 ${String(minutes).padStart(2, '0')}분`;
}

export function todoSubline(item: TodoItem): string {
  return [formatWeekdays(item.weekdays), formatTodoTime(item.time), item.goalCount > 0 ? `주 ${item.goalCount}회 목표` : null].filter(Boolean).join(' | ');
}

export const TODO_TEXT = {
  emptyTitle: '할일이 없어요.',
  emptyDescription: '할일을 추가해주세요.',
  manage: '할일 관리',
  required: '할일을 하나 이상 체크해주세요.',
};

export const validateTodo = (checked: string[]): string | null => (checked.length === 0 ? TODO_TEXT.required : null);
