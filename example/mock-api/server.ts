/** 지연 300ms · 5% 확률 오류를 섞어, 실서버의 지연과 실패가 UX 에 어떻게 드러나는지 본다 */

import type { CalendarEvent } from '@0610studio/zs-ui';
import { generateRangeEvents, type DiaryEntry } from './db';

const LATENCY_MS = 300;
const FAILURE_RATE = 0.05;

export interface MockApiOptions {
  /** 데모에서 지연·오류를 끄고 싶을 때 */
  latencyMs?: number;
  failureRate?: number;
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

async function simulateNetwork({ latencyMs = LATENCY_MS, failureRate = FAILURE_RATE }: MockApiOptions): Promise<void> {
  await sleep(latencyMs);
  if (failureRate > 0 && Math.random() < failureRate) {
    throw new Error('[mock-api] 일시적인 네트워크 오류 (재시도하세요)');
  }
}

/** onVisibleRangeChange 가 알려준 범위를 그대로 넘긴다 */
export async function fetchRangeEvents(
  startDate: string,
  endDate: string,
  options: MockApiOptions = {},
): Promise<CalendarEvent<DiaryEntry>[]> {
  await simulateNetwork(options);
  return generateRangeEvents(startDate, endDate);
}

export type { DiaryEntry };
