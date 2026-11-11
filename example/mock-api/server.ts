import type { CalendarEvent } from '@0610studio/zs-ui';
import { generateRangeEvents, type DiaryEntry } from './db';

const LATENCY_MS = 300;
const FAILURE_RATE = 0.05;

export interface MockApiOptions {
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

export async function fetchRangeEvents(
  startDate: string,
  endDate: string,
  options: MockApiOptions = {},
): Promise<CalendarEvent<DiaryEntry>[]> {
  await simulateNetwork(options);
  return generateRangeEvents(startDate, endDate);
}

export type { DiaryEntry };
