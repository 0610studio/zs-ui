import { createContext } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import type { CalendarMode, DateRange, DateString, EventIndex } from './core';

export interface CalendarScrollBinding {
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onScrollEndDrag: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onMomentumScrollEnd: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  scrollEventThrottle: number;
}

export interface ZSCalendarContextValue {
  index: EventIndex<unknown>;
  selectedDate: DateString | null;
  visibleMonth: DateString;
  mode: CalendarMode;
  visibleRange: DateRange;
  selectDate: (date: DateString) => void;
  setMode: (mode: CalendarMode) => void;
  bindScroll: CalendarScrollBinding;
}

export const ZSCalendarContext = createContext<ZSCalendarContextValue | null>(null);
