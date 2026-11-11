import { useContext, useMemo } from 'react';
import { ZSCalendarContext, type CalendarScrollBinding } from '../context';
import { getEventsOn, type CalendarEvent, type DateString, type EventIndex } from '../core';

const NOOP_SCROLL_BINDING: CalendarScrollBinding = {
  onScroll: () => undefined,
  onScrollEndDrag: () => undefined,
  onMomentumScrollEnd: () => undefined,
  scrollEventThrottle: 16,
};

export interface CalendarAgendaOptions<T> {
  index?: EventIndex<T>;
  selectedDate?: DateString | null;
}

export interface CalendarAgenda<T> {
  items: readonly CalendarEvent<T>[];
  bindScroll: CalendarScrollBinding;
}

export function useCalendarAgenda<T = unknown>(options: CalendarAgendaOptions<T> = {}): CalendarAgenda<T> {
  const context = useContext(ZSCalendarContext);

  const index = (options.index ?? context?.index) as EventIndex<T> | undefined;
  const selectedDate = options.selectedDate !== undefined ? options.selectedDate : context?.selectedDate ?? null;
  const bindScroll = context?.bindScroll ?? NOOP_SCROLL_BINDING;

  if (!index) {
    throw new Error(
      '[zs-ui] useCalendarAgenda 는 <ZSCalendar> 안에서 쓰거나 index 옵션을 직접 넘겨야 합니다.',
    );
  }

  return useMemo(
    () => ({ items: selectedDate ? getEventsOn(index, selectedDate) : [], bindScroll }),
    [index, selectedDate, bindScroll],
  );
}
