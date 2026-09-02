import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import { useAnimatedReaction, useDerivedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useTheme } from '../../context/ThemeContext';
import {
  DEFAULT_MAX_CONTENT_WIDTH,
  addDays,
  addMonths,
  buildEventIndex,
  computeGridLayout,
  monthOfWeek,
  monthsBetween,
  resolveCalendarLocale,
  resolveCalendarTheme,
  rotateWeekdays,
  startOfMonth,
  startOfWeek,
  todayDateString,
  visibleRangeOf,
  weekRowOfMonth,
  weeksBetween,
  weeksInMonth,
  type CalendarEvent,
  type CalendarLabels,
  type CalendarLocaleCode,
  type CalendarLocaleStrings,
  type CalendarMode,
  type CalendarThemeOverride,
  type DateRange,
  type DateString,
  type FirstDayOfWeek,
} from './core';
import { ZSCalendarContext, type ZSCalendarContextValue } from './context';
import CalendarHeader, { type CalendarHeaderContext } from './ui/CalendarHeader';
import MonthPagerCanvas from './skia/MonthPagerCanvas';
import { buildCalendarFonts, resolveCalendarFontSources, useCalendarFontProvider, CALENDAR_FONT_FAMILY, type CalendarFontSources } from './skia/fonts';
import { usePaneCache, type CalendarPagerUnit } from './skia/usePaneCache';
import { SELECTED_CARD_SHADOW_BLEED } from './skia/drawGrid';
import { useHorizontalPager } from './gestures/useHorizontalPager';
import { useModeTransition } from './gestures/useModeTransition';
import { useContainerWidth } from './hooks/useContainerWidth';
import { useCalendarAnnouncements } from './hooks/useCalendarAnnouncements';
import { useControllableState } from './hooks/useControllableState';

/** 6주짜리 달도 잘리지 않도록 캔버스 높이를 최대 주 수로 고정한다 */
const MAX_WEEK_ROWS = 6;
const HEIGHT_TABLE_SPAN = 3;

export interface ZSCalendarProps<T = unknown> {
  /** 달력 dot 과 아젠다 리스트가 공유하는 단일 소스 */
  events?: ReadonlyArray<CalendarEvent<T>>;
  /** 앞뒤 페이지까지 포함한 범위 — 이 범위만 prefetch 하면 도착 시점에 dot 이 이미 있다 */
  onVisibleRangeChange?: (range: DateRange) => void;

  selectedDate?: DateString | null;
  defaultSelectedDate?: DateString | null;
  onDateChange?: (date: DateString) => void;

  /** 'YYYY-MM-DD' — 항상 해당 월의 1일로 정규화된다 */
  visibleMonth?: DateString;
  defaultVisibleMonth?: DateString;
  onMonthChange?: (month: DateString) => void;

  mode?: CalendarMode;
  defaultMode?: CalendarMode;
  onModeChange?: (mode: CalendarMode) => void;

  /** 팔레트에서 파생된 기본값을 덮어쓴다 */
  calendarTheme?: CalendarThemeOverride;
  /** 미주입 시 ThemeProvider 의 `themeFontAssets`(400·700) 를 쓰고, 그것도 없으면 시스템 폰트다 */
  fonts?: CalendarFontSources;
  /** 0=일요일, 1=월요일 */
  firstDayOfWeek?: FirstDayOfWeek;
  /**
   * 요일·월 제목·접근성 라벨·스크린리더 안내의 언어. 'ko' | 'en' 또는 문자열 묶음을 직접 넘긴다.
   * 기본은 한국어.
   */
  locale?: CalendarLocaleCode | CalendarLocaleStrings;
  /** locale 위에 요일·월 제목만 덮어쓴다 */
  labels?: CalendarLabels;
  /** 태블릿용 상한. false 면 제한 없음 */
  maxContentWidth?: number | false;
  /** 기본 헤더를 통째로 교체한다 */
  renderHeader?: (context: CalendarHeaderContext) => React.ReactNode;
  onTitlePress?: () => void;
  /** 끄면 월간 고정 — 팬도 리스트 스크롤도 전환하지 않는다 */
  enableModeTransition?: boolean;
  /** 끄면 아젠다 리스트 스크롤이 월간↔주간을 바꾸지 않는다. 팬 제스처는 그대로 */
  enableScrollModeTransition?: boolean;
  /** 스크린리더에 월 이동·모드 전환을 알린다 */
  announceChanges?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Provider 안에서 렌더된다 — 여기서만 useCalendarAgenda 가 인자 없이 동작한다 */
  children?: React.ReactNode;
  testID?: string;
}

/**
 * Skia 그리드 · 3-pane 페이저 · 주↔월 전환을 묶은 달력.
 * ThemeProvider 와 GestureHandlerRootView 하위에서 동작한다.
 */
function ZSCalendar<T = unknown>({
  events,
  onVisibleRangeChange,
  selectedDate: selectedDateProp,
  defaultSelectedDate,
  onDateChange,
  visibleMonth: visibleMonthProp,
  defaultVisibleMonth,
  onMonthChange,
  mode: modeProp,
  defaultMode = 'month',
  onModeChange,
  calendarTheme: calendarThemeOverride,
  fonts: fontSources,
  firstDayOfWeek = 0,
  locale = 'ko',
  labels,
  maxContentWidth = DEFAULT_MAX_CONTENT_WIDTH,
  renderHeader,
  onTitlePress,
  enableModeTransition = true,
  enableScrollModeTransition = true,
  announceChanges = true,
  style,
  children,
  testID,
}: ZSCalendarProps<T>) {
  const { palette, fontAssets } = useTheme();
  const today = useMemo(() => todayDateString(), []);

  const [selectedDate, setSelectedDate] = useControllableState<DateString | null>(
    selectedDateProp,
    defaultSelectedDate ?? today,
    (next) => {
      if (next) onDateChange?.(next);
    },
  );
  const [visibleMonth, setVisibleMonth] = useControllableState<DateString>(
    visibleMonthProp ? startOfMonth(visibleMonthProp) : undefined,
    startOfMonth(defaultVisibleMonth ?? today),
    onMonthChange,
  );
  const [mode, setModeState] = useControllableState<CalendarMode>(modeProp, defaultMode, onModeChange);

  /**
   * 페이지 단위는 모드를 따라간다(월간=한 달, 주간=한 주). 다만 접힘·펼침 애니메이션은
   * 월 그리드가 있어야 하므로, progress 가 0 을 벗어나는 순간 월 단위로 갈아탄다.
   */
  const [unit, setUnit] = useState<CalendarPagerUnit>(defaultMode === 'week' ? 'week' : 'month');
  const [page, setPage] = useState(0);

  /**
   * 페이지 0 이 가리키는 달 / 주. 단위를 갈아탈 때 페이지 번호는 그대로 두고 이 원점만 옮긴다 —
   * 번호를 바꾸면 translateX 를 다시 맞춰야 하고, 그 값이 UI 스레드에 한 프레임 늦게 닿아
   * 빈 프레임이 한 번 보인다.
   */
  const [baseMonth, setBaseMonth] = useState(visibleMonth);
  const [baseWeekRaw, setBaseWeek] = useState(() => startOfWeek(visibleMonth, firstDayOfWeek));
  const baseWeek = useMemo(() => startOfWeek(baseWeekRaw, firstDayOfWeek), [baseWeekRaw, firstDayOfWeek]);

  const { width, onLayout } = useContainerWidth();
  const index = useMemo(() => buildEventIndex(events), [events]);

  const metrics = useMemo(
    () => computeGridLayout({ containerWidth: width, rowCount: MAX_WEEK_ROWS, maxContentWidth }),
    [width, maxContentWidth],
  );
  const theme = useMemo(
    () => resolveCalendarTheme(palette, calendarThemeOverride),
    [palette, calendarThemeOverride],
  );
  // 앱이 ThemeProvider 에 폰트 파일을 넘겼으면 달력 숫자도 같은 글꼴로 — 컴포넌트마다 다시 주입하지 않는다
  const themeFontSources = useMemo(() => resolveCalendarFontSources(fontAssets), [fontAssets]);
  const fontProvider = useCalendarFontProvider(fontSources ?? themeFontSources);
  const fonts = useMemo(
    () =>
      buildCalendarFonts({
        dayFontSize: metrics.dayFontSize,
        fontProvider,
        fontFamily: fontProvider ? CALENDAR_FONT_FAMILY : undefined,
      }),
    [metrics.dayFontSize, fontProvider],
  );
  const strings = useMemo(() => resolveCalendarLocale(locale, labels), [locale, labels]);
  const weekdayLabels = useMemo(() => rotateWeekdays(strings.weekdays, firstDayOfWeek), [strings.weekdays, firstDayOfWeek]);
  // 주간 단위면 페이지 자체, 월간 단위면 접혔을 때 남을 주
  const currentWeekStart = useMemo(() => {
    if (unit === 'week') return addDays(baseWeek, page * 7);
    const month = startOfMonth(addMonths(baseMonth, page));
    const candidate = startOfWeek(selectedDate ?? today, firstDayOfWeek);
    // 선택일이 이 달 그리드에 없으면(달만 넘겨봤다면) 첫 주를 남긴다
    return weekRowOfMonth(candidate, month, firstDayOfWeek) >= 0
      ? candidate
      : startOfWeek(startOfMonth(month), firstDayOfWeek);
  }, [unit, page, baseWeek, baseMonth, selectedDate, today, firstDayOfWeek]);

  // 헤더·범위의 기준 달. 주간에서는 보이는 주의 과반이 속한 달
  const derivedMonth = useMemo(
    () => (unit === 'week' ? monthOfWeek(currentWeekStart) : startOfMonth(addMonths(baseMonth, page))),
    [unit, currentWeekStart, baseMonth, page],
  );
  const rowCount = useMemo(() => weeksInMonth(derivedMonth, firstDayOfWeek), [derivedMonth, firstDayOfWeek]);

  const { getPane } = usePaneCache({
    unit,
    baseMonth,
    baseWeek,
    anchorWeekStart: currentWeekStart,
    metrics,
    theme,
    fonts,
    index,
    selectedDate,
    today,
    firstDayOfWeek,
  });
  const panes = useMemo(() => [getPane(page - 1), getPane(page), getPane(page + 1)], [getPane, page]);

  const heightTable = useMemo(() => {
    const table: Record<number, number> = {};
    for (let offset = -HEIGHT_TABLE_SPAN; offset <= HEIGHT_TABLE_SPAN; offset += 1) {
      // 주간 페이지는 언제나 1행 — 펼치는 동안에는 이미 월 단위다
      table[page + offset] =
        unit === 'week'
          ? metrics.rowHeight
          : weeksInMonth(startOfMonth(addMonths(baseMonth, page + offset)), firstDayOfWeek) * metrics.rowHeight;
    }
    return table;
  }, [unit, baseMonth, page, firstDayOfWeek, metrics.rowHeight]);
  const rowsHeightByPage = useDerivedValue(() => heightTable, [heightTable]);

  const handlePageChange = useCallback((nextPage: number) => setPage(nextPage), []);
  const pager = useHorizontalPager({ pageWidth: metrics.gridWidth, onPageChange: handlePageChange });

  const transition = useModeTransition({
    expandDistance: Math.max(rowCount - 1, 1) * metrics.rowHeight,
    onModeChange: setModeState,
    initialMode: mode,
    enabled: enableModeTransition,
    scrollEnabled: enableScrollModeTransition,
  });
  const { progress, setMode: driveMode } = transition;

  // 워클릿·이펙트 순서에 휘둘리지 않도록 전환 시점 상태를 ref 로 들고 한 번에 바꾼다
  const unitStateRef = useRef({ unit, page, currentWeekStart, baseWeek, baseMonth, firstDayOfWeek });
  unitStateRef.current = { unit, page, currentWeekStart, baseWeek, baseMonth, firstDayOfWeek };

  // 화면은 그대로, 현재 페이지 번호가 새 단위에서도 같은 주/달을 가리키도록 원점을 잡는다
  const switchUnit = useCallback((next: CalendarPagerUnit) => {
    const current = unitStateRef.current;
    if (current.unit === next) return;

    if (next === 'week') setBaseWeek(addDays(current.currentWeekStart, -7 * current.page));
    else setBaseMonth(addMonths(monthOfWeek(current.currentWeekStart), -current.page));
    setUnit(next);
  }, []);

  // progress 가 0 을 벗어나면 월 단위로, 정확히 0 이면 주 단위로
  useAnimatedReaction(
    () => progress.value > 0.001,
    (needsMonthGrid, previous) => {
      if (previous !== null && needsMonthGrid === previous) return;
      scheduleOnRN(switchUnit, needsMonthGrid ? 'month' : 'week');
    },
    [switchUnit],
  );

  // 전환 도중에만 비선택 주를 페이드한다. 정지 상태에서는 레이어 없이 그린다
  const [midTransition, setMidTransition] = useState(false);
  useAnimatedReaction(
    () => progress.value > 0.001 && progress.value < 0.999,
    (mid, previous) => {
      if (mid !== previous) scheduleOnRN(setMidTransition, mid);
    },
    [],
  );
  // 주간에서 펼치기 시작하면 월 그리드가 올라오는 커밋과 같은 프레임부터 페이드가 걸려야 한다 —
  // 그 순간 mode 는 아직 'week' 이므로 반응의 한 프레임 지연에 기대지 않는다
  const fadeRows = unit === 'month' && (midTransition || mode !== 'month');

  // 페이지 이동은 visibleMonth 로 반영하고, 밖에서 바꾸면 페이저가 따라온다
  const lastMonthRef = useRef(visibleMonth);
  const { goToPage, stepPage } = pager;
  useEffect(() => {
    if (derivedMonth !== lastMonthRef.current) {
      lastMonthRef.current = derivedMonth;
      setVisibleMonth(derivedMonth);
      return;
    }
    if (visibleMonth === derivedMonth) return;

    lastMonthRef.current = visibleMonth;
    const current = unitStateRef.current;
    const target =
      current.unit === 'week'
        ? weeksBetween(current.baseWeek, startOfWeek(visibleMonth, current.firstDayOfWeek))
        : monthsBetween(current.baseMonth, visibleMonth);
    setPage(target);
    goToPage(target);
  }, [derivedMonth, visibleMonth, setVisibleMonth, goToPage]);

  // mode 를 밖에서 바꾸면 progress 를 스프링으로 몰아준다
  const lastModeRef = useRef(mode);
  useEffect(() => {
    if (lastModeRef.current === mode) return;
    lastModeRef.current = mode;
    // 펼칠 때는 월 그리드가 먼저 있어야 한다. 접을 때는 progress 가 0 에 닿은 뒤 위 반응이 처리
    if (mode === 'month') switchUnit('month');
    driveMode(mode);
  }, [mode, driveMode, switchUnit]);

  const gesture = useMemo(
    () => (enableModeTransition ? Gesture.Race(pager.gesture, transition.gesture) : pager.gesture),
    [enableModeTransition, pager.gesture, transition.gesture],
  );

  // 주간의 기준은 달의 1일이 아니라 보이는 주다
  const visibleRange = useMemo(
    () => visibleRangeOf(unit === 'week' ? currentWeekStart : derivedMonth, unit, firstDayOfWeek, 1),
    [unit, currentWeekStart, derivedMonth, firstDayOfWeek],
  );
  useEffect(() => {
    onVisibleRangeChange?.(visibleRange);
  }, [onVisibleRangeChange, visibleRange]);

  useCalendarAnnouncements(derivedMonth, mode, announceChanges, strings);

  const selectDate = useCallback((date: DateString) => setSelectedDate(date), [setSelectedDate]);

  // pager 객체는 매 렌더 새로 만들어지므로 함수 참조에만 의존한다
  const headerContext: CalendarHeaderContext = useMemo(
    () => ({
      visibleMonth: derivedMonth,
      onPrev: () => stepPage(-1),
      onNext: () => stepPage(1),
      onTitlePress,
    }),
    [derivedMonth, stepPage, onTitlePress],
  );

  const contextValue = useMemo<ZSCalendarContextValue>(
    () => ({
      index: index as ZSCalendarContextValue['index'],
      selectedDate,
      visibleMonth: derivedMonth,
      mode,
      visibleRange,
      selectDate,
      setMode: driveMode,
      bindScroll: transition.bindScroll,
    }),
    [index, selectedDate, derivedMonth, mode, visibleRange, selectDate, driveMode, transition.bindScroll],
  );

  return (
    <ZSCalendarContext.Provider value={contextValue}>
      <View style={[styles.root, style]} testID={testID}>
        {renderHeader ? (
          renderHeader(headerContext)
        ) : (
          <CalendarHeader
            {...headerContext}
            monthTitle={strings.monthTitle}
            prevMonthLabel={strings.prevMonth}
            nextMonthLabel={strings.nextMonth}
          />
        )}

        <View onLayout={onLayout} style={styles.gridHost} testID={testID ? `${testID}-grid` : undefined}>
          {width > 0 && (
            <MonthPagerCanvas
              panes={panes}
              unit={unit}
              fadeRows={fadeRows}
              metrics={metrics}
              canvasRowsHeight={metrics.rowHeight * MAX_WEEK_ROWS + SELECTED_CARD_SHADOW_BLEED}
              rowsHeightByPage={rowsHeightByPage}
              translateX={pager.translateX}
              progress={progress}
              gesture={gesture}
              theme={theme}
              weekdayLabels={weekdayLabels}
              firstDayOfWeek={firstDayOfWeek}
              selectedDate={selectedDate}
              index={index}
              onSelect={selectDate}
              formatLabel={strings.cellLabel}
            />
          )}
        </View>

        {children}
      </View>
    </ZSCalendarContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: { width: '100%' },
  gridHost: { width: '100%' },
});

export default ZSCalendar;
export type { CalendarHeaderContext };
