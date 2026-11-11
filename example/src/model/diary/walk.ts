import { END_BEFORE_START_MESSAGE } from './common';

export const WALK_HOW_TO = {
  title: '어떻게 기록할까요?',
  live: { title: '실시간 산책', description: '위치와 시간을 자동으로 기록해요.' },
  manual: { title: '산책 수동 입력', description: '산책 시간을 수동으로 입력해요.' },
};

export const WALK_TEXT = {
  start: '시작 시간',
  end: '종료 시간',
  distance: '거리 입력',
  unit: 'Km',
  timeRequired: '산책 시간을 입력해주세요.',
  distanceRequired: '산책 거리를 입력해주세요.',
};

export function walkDefaultTimes(now: Date = new Date()): { start: Date; end: Date } {
  const end = new Date(now);
  end.setSeconds(0, 0);
  const start = new Date(end.getTime() - 30 * 60 * 1000);
  if (start.toDateString() !== end.toDateString()) {
    start.setTime(end.getTime());
    start.setHours(0, 0, 0, 0);
  }
  return { start, end };
}

export function validateWalk(start: Date, end: Date | null, distance: string): string | null {
  if (!end) return WALK_TEXT.timeRequired;
  if (end.getTime() < start.getTime()) return END_BEFORE_START_MESSAGE;
  if (!distance) return WALK_TEXT.distanceRequired;
  return null;
}
