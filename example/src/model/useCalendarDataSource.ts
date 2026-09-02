import { useCallback, useRef, useState } from 'react';
import {
  buildEventIndex,
  compareDate,
  type CalendarEvent,
  type DateRange,
  type DateString,
  type EventIndex,
} from '@0610studio/zs-ui';
import type { DiaryEntry } from '../../mock-api/db';
import { fetchRangeEvents } from '../../mock-api/server';

export interface CalendarDataSourceOptions {
  /** 데모 전용 — 다음 요청을 무조건 실패시켜 오류 복구 경로를 재현한다 */
  forceFailure?: boolean;
}

export interface CalendarDataSource {
  index: EventIndex<DiaryEntry>;
  loaded: DateRange | null;
  status: 'idle' | 'loading' | 'error';
  error: string | null;
  /** 중복 요청이 없는지 눈으로 확인하는 용도 */
  fetchCount: number;
  /** 이미 덮고 있으면 아무 일도 하지 않는다 */
  ensureRange: (needed: DateRange) => void;
  retry: () => void;
}

const union = (a: DateRange | null, b: DateRange): DateRange =>
  a
    ? {
        startDate: compareDate(a.startDate, b.startDate) <= 0 ? a.startDate : b.startDate,
        endDate: compareDate(a.endDate, b.endDate) >= 0 ? a.endDate : b.endDate,
      }
    : b;

const covers = (loaded: DateRange | null, needed: DateRange): boolean =>
  !!loaded && compareDate(loaded.startDate, needed.startDate) <= 0 && compareDate(loaded.endDate, needed.endDate) >= 0;

/** onVisibleRangeChange 힌트를 받아 실제로 fetch 하는 소비자 쪽 저장소 */
export function useCalendarDataSource({ forceFailure = false }: CalendarDataSourceOptions = {}): CalendarDataSource {
  const [index, setIndex] = useState<EventIndex<DiaryEntry>>(() => buildEventIndex<DiaryEntry>([]));
  const [loaded, setLoaded] = useState<DateRange | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [fetchCount, setFetchCount] = useState(0);

  const eventsRef = useRef<CalendarEvent<DiaryEntry>[]>([]);
  const loadedRef = useRef<DateRange | null>(null);
  const inflightRef = useRef<DateRange | null>(null);
  const lastFailedRef = useRef<DateRange | null>(null);
  const forceFailureRef = useRef(forceFailure);
  forceFailureRef.current = forceFailure;

  const load = useCallback(async (needed: DateRange) => {
    if (inflightRef.current || covers(loadedRef.current, needed)) return;

    // 이미 가진 범위와 합쳐 한 번에 받는다 — 구멍 난 범위를 여러 개 관리하지 않으려고
    const target = union(loadedRef.current, needed);
    inflightRef.current = target;
    setStatus('loading');
    setError(null);
    setFetchCount((count) => count + 1);

    try {
      const fetched = await fetchRangeEvents(target.startDate, target.endDate, forceFailureRef.current ? { failureRate: 1 } : {});
      eventsRef.current = fetched;
      loadedRef.current = target;
      lastFailedRef.current = null;
      setIndex(buildEventIndex(fetched));
      setLoaded(target);
      setStatus('idle');
    } catch (cause) {
      lastFailedRef.current = target;
      setError(cause instanceof Error ? cause.message : String(cause));
      setStatus('error');
    } finally {
      inflightRef.current = null;
    }
  }, []);

  const ensureRange = useCallback(
    (needed: DateRange) => {
      void load(needed);
    },
    [load],
  );

  const retry = useCallback(() => {
    const failed = lastFailedRef.current;
    if (failed) void load(failed);
  }, [load]);

  return { index, loaded, status, error, fetchCount, ensureRange, retry };
}
