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
  /** 둘 다 생략하면 <ZSCalendar> 컨텍스트에서 가져온다 */
  index?: EventIndex<T>;
  selectedDate?: DateString | null;
}

export interface CalendarAgenda<T> {
  /** 선택한 날짜의 일정. events 에 들어온 순서를 유지한다 */
  items: ReadonlyArray<CalendarEvent<T>>;
  /** 리스트에 펼쳐 넣으면 스크롤이 주↔월 전환을 구동한다 (달력 밖에서는 빈 바인딩) */
  bindScroll: CalendarScrollBinding;
}

/**
 * 달력 dot 과 같은 인덱스에서 선택한 날짜의 일정을 뽑는다 — 두 곳이 같은 인덱스를
 * 보므로 어긋날 여지가 없다. <ZSCalendar> children 안에서는 인자 없이 쓴다.
 */
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
