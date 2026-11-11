import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';
import { useCompetingGestures } from 'react-native-gesture-handler';
import { useDerivedValue } from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { capFontScale } from '../../theme/fontScale';
import {
  DEFAULT_WEEKDAY_HEADER_HEIGHT,
  addMonths,
  buildEventIndex,
  computeGridLayout,
  resolveCalendarLocale,
  resolveCalendarTheme,
  rotateWeekdays,
  startOfMonth,
  visibleRangeOf,
  weeksInMonth,
  type CalendarEvent,
  type CalendarEventDisplay,
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
import { buildCalendarFonts, resolveCalendarFontSources, useCalendarFontProvider, type CalendarFontSources } from './skia/fonts';
import { usePaneCache } from './skia/usePaneCache';
import { SELECTED_CARD_SHADOW_BLEED } from './skia/drawGrid';
import { useHorizontalPager } from './gestures/useHorizontalPager';
import { useModeTransition } from './gestures/useModeTransition';
import { useContainerSize } from './hooks/useContainerSize';
import { useCalendarAnnouncements } from './hooks/useCalendarAnnouncements';
import { useCalendarPaging, useCalendarPagingSync } from './hooks/useCalendarPaging';
import { useToday } from './hooks/useToday';
import { useControllableState } from '../../model/useControllableState';

const MAX_WEEK_ROWS = 6;
const HEIGHT_TABLE_SPAN = 3;

export interface ZSCalendarProps<T = unknown> {
  events?: readonly CalendarEvent<T>[];
  eventDisplay?: CalendarEventDisplay;
  onVisibleRangeChange?: (range: DateRange) => void;

  selectedDate?: DateString | null;
  defaultSelectedDate?: DateString | null;
  onDateChange?: (date: DateString) => void;

  visibleMonth?: DateString;
  defaultVisibleMonth?: DateString;
  onMonthChange?: (month: DateString) => void;

  mode?: CalendarMode;
  defaultMode?: CalendarMode;
  onModeChange?: (mode: CalendarMode) => void;

  theme?: CalendarThemeOverride;
  fonts?: CalendarFontSources;
  firstDayOfWeek?: FirstDayOfWeek;
  locale?: CalendarLocaleCode | CalendarLocaleStrings;
  maxContentWidth?: number | false;
  renderHeader?: (context: CalendarHeaderContext) => React.ReactNode;
  onTitlePress?: () => void;
  enableModeTransition?: boolean;
  enableScrollModeTransition?: boolean;
  announceChanges?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  testID?: string;
}

function ZSCalendar<T = unknown>({
  events,
  eventDisplay = 'dot',
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
  theme: calendarThemeOverride,
  fonts: fontSources,
  firstDayOfWeek = 0,
  locale = 'ko',
  maxContentWidth = false,
  renderHeader,
  onTitlePress,
  enableModeTransition = true,
  enableScrollModeTransition = true,
  announceChanges = true,
  style,
  children,
  testID,
}: ZSCalendarProps<T>) {
  const { colors, mode: colorMode, fontAssets, maxFontSizeMultiplier } = useTheme();
  const today = useToday();

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

  const paging = useCalendarPaging({ visibleMonth, selectedDate, firstDayOfWeek, initialMode: mode });
  const { unit, page, baseMonth, baseWeek, weekAnchor, currentWeekStart, derivedMonth, rowCount } = paging;

  const isLabel = eventDisplay === 'label';
  const { width, height: gridHostHeight, onLayout } = useContainerSize({ measureHeight: isLabel });
  const index = useMemo(() => buildEventIndex(events), [events]);
  const theme = useMemo(
    () => resolveCalendarTheme(colors, colorMode, calendarThemeOverride),
    [colors, colorMode, calendarThemeOverride],
  );
  const themeFontSources = useMemo(() => resolveCalendarFontSources(fontAssets), [fontAssets]);
  const fontProvider = useCalendarFontProvider(fontSources ?? themeFontSources);
  const strings = useMemo(() => resolveCalendarLocale(locale), [locale]);
  const weekdayLabels = useMemo(() => rotateWeekdays(strings.weekdays, firstDayOfWeek), [strings.weekdays, firstDayOfWeek]);

  const fixedWeek = !enableModeTransition && mode === 'week';
  const availableRowsHeight = isLabel && gridHostHeight > 0
    ? gridHostHeight - DEFAULT_WEEKDAY_HEADER_HEIGHT - SELECTED_CARD_SHADOW_BLEED
    : undefined;
  const fillRowCount = isLabel ? (fixedWeek ? 1 : rowCount) : undefined;
  const { fontScale: systemFontScale = 1 } = useWindowDimensions();
  const fontScale = capFontScale(systemFontScale, maxFontSizeMultiplier);
  const metrics = useMemo(
    () =>
      computeGridLayout({
        containerWidth: width,
        rowCount: MAX_WEEK_ROWS,
        maxContentWidth,
        eventDisplay,
        availableRowsHeight,
        fillRowCount,
        fontScale,
      }),
    [width, maxContentWidth, eventDisplay, availableRowsHeight, fillRowCount, fontScale],
  );
  const fonts = useMemo(
    () => buildCalendarFonts({ dayFontSize: metrics.dayFontSize, fontProvider }),
    [metrics.dayFontSize, fontProvider],
  );

  const getPane = usePaneCache({
    unit,
    baseMonth,
    baseWeek,
    weekAnchor,
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
      table[page + offset] =
        unit === 'week'
          ? metrics.rowHeight
          : weeksInMonth(startOfMonth(addMonths(baseMonth, page + offset)), firstDayOfWeek) * metrics.rowHeight;
    }
    return table;
  }, [unit, baseMonth, page, firstDayOfWeek, metrics.rowHeight]);
  const rowsHeightByPage = useDerivedValue(() => heightTable);

  const pager = useHorizontalPager({ pageWidth: metrics.gridWidth, onPageChange: paging.setPage });

  const transition = useModeTransition({
    expandDistance: Math.max(rowCount - 1, 1) * metrics.rowHeight,
    onModeChange: setModeState,
    initialMode: mode,
    enabled: enableModeTransition,
    scrollEnabled: enableScrollModeTransition,
  });
  const { progress, setMode: driveMode } = transition;
  const { goToPage, stepPage } = pager;

  const fadeRows = useCalendarPagingSync(paging, { progress, mode, driveMode, goToPage, visibleMonth, setVisibleMonth });

  const competing = useCompetingGestures(pager.gesture, transition.gesture);
  const gesture = enableModeTransition ? competing : pager.gesture;

  const visibleRange = useMemo(
    () => visibleRangeOf(unit === 'week' ? currentWeekStart : derivedMonth, unit, firstDayOfWeek, 1),
    [unit, currentWeekStart, derivedMonth, firstDayOfWeek],
  );
  useEffect(() => {
    onVisibleRangeChange?.(visibleRange);
  }, [onVisibleRangeChange, visibleRange]);

  useCalendarAnnouncements(derivedMonth, mode, announceChanges, strings);

  const defaultHeaderStyle = useMemo(
    () => (maxContentWidth === false ? undefined : { maxWidth: maxContentWidth }),
    [maxContentWidth],
  );

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
      selectDate: setSelectedDate,
      setMode: driveMode,
      bindScroll: transition.bindScroll,
    }),
    [index, selectedDate, derivedMonth, mode, visibleRange, setSelectedDate, driveMode, transition.bindScroll],
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
            style={defaultHeaderStyle}
          />
        )}

        <View onLayout={onLayout} style={isLabel ? styles.gridHostFill : styles.gridHost} testID={testID ? `${testID}-grid` : undefined}>
          {width > 0 && (
            <MonthPagerCanvas
              panes={panes}
              unit={unit}
              fadeRows={fadeRows}
              metrics={metrics}
              canvasRowsHeight={metrics.rowHeight * (fixedWeek ? 1 : MAX_WEEK_ROWS) + SELECTED_CARD_SHADOW_BLEED}
              rowsHeightByPage={rowsHeightByPage}
              translateX={pager.translateX}
              progress={progress}
              gesture={gesture}
              theme={theme}
              weekdayLabels={weekdayLabels}
              firstDayOfWeek={firstDayOfWeek}
              selectedDate={selectedDate}
              index={index}
              onSelect={setSelectedDate}
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
  gridHostFill: { width: '100%', flexGrow: 1, flexShrink: 1, overflow: 'hidden' },
});

export default ZSCalendar;
export type { CalendarHeaderContext };
