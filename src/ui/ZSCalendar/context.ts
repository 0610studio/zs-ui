import { createContext, useContext } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import type { CalendarMode, DateRange, DateString, EventIndex } from './core';

export interface CalendarScrollBinding {
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  /** 스크롤이 멈췄을 때만 모드를 확정한다 (맨 위에서 멈추면 월간) */
  onScrollEndDrag: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onMomentumScrollEnd: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  scrollEventThrottle: number;
}

export interface ZSCalendarContextValue {
  /** 달력 dot 과 리스트가 공유하는 단일 인덱스 */
  index: EventIndex<unknown>;
  selectedDate: DateString | null;
  visibleMonth: DateString;
  mode: CalendarMode;
  /** 앞뒤 1페이지를 덮는 범위 — prefetch 힌트 */
  visibleRange: DateRange;
  selectDate: (date: DateString) => void;
  setMode: (mode: CalendarMode) => void;
  bindScroll: CalendarScrollBinding;
}

export const ZSCalendarContext = createContext<ZSCalendarContextValue | null>(null);

/** ZSCalendar 가 Provider 를 내장하므로, 리스트를 children 으로 넣어야 연결된다 */
export function useZSCalendarContext(caller: string): ZSCalendarContextValue {
  const value = useContext(ZSCalendarContext);
  if (!value) {
    throw new Error(
      `[zs-ui] ${caller}는 <ZSCalendar> 안에서만 사용할 수 있습니다. `
      + '아젠다 리스트를 <ZSCalendar>의 children 으로 넣거나, 훅에 직접 옵션을 넘기세요.',
    );
  }
  return value;
}
