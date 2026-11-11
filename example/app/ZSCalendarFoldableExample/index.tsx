import { useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  ZSCalendar,
  ZSPaneLayout,
  ZSPressable,
  ZSText,
  startOfMonth,
  useCalendarAgenda,
  useOverlay,
  usePaneLayout,
  useTheme,
  type CalendarEvent,
  type CalendarEventDisplay,
  type CalendarHeaderContext,
  type CalendarMode,
  type DateString,
} from '@0610studio/zs-ui';
import { categoryMeta, type DiaryEntry } from '../../mock-api/db';
import { useCalendarFoldable } from '../../src/model/CalendarFoldableContext';
import BarabomCalendarHeader from '../../src/ui/barabom/CalendarHeader';
import DatePickerSheet, { DATE_SHEET_TITLE } from '../../src/ui/barabom/DatePickerSheet';
import { DiaryList } from '../../src/ui/barabom/DiaryList';

const SHOW_DEV_STRIP = __DEV__ || process.env.EXPO_PUBLIC_DEV_STRIP === '1';
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function formatDayTitle(date: DateString): string {
  const [y, m, d] = date.split('-').map(Number);
  return `${m}월 ${d}일 (${WEEKDAYS[new Date(y, m - 1, d).getDay()]})`;
}

function withChipLabel(event: CalendarEvent<DiaryEntry>): CalendarEvent<DiaryEntry> {
  const memo = event.data?.memo.trim().split('\n')[0];
  return { ...event, label: memo || (event.data ? categoryMeta(event.data.category).label : undefined) };
}

export default function CalendarFoldableCalendarTab() {
  const { colors, mode } = useTheme();
  const { settings } = useCalendarFoldable();

  return (
    <GestureHandlerRootView style={styles.root}>
      <ZSPaneLayout
        primaryFraction={0.5}
        tabletop={settings.tabletop}
        backgroundColor={colors.surface1}
        primary={<CalendarPane />}
        secondary={<SideDiaryPane />}
      />
    </GestureHandlerRootView>
  );
}

function CalendarPane() {
  const { role, heightClass } = usePaneLayout();
  const single = role === 'single';
  const roomy = heightClass !== 'compact';
  const fixedMode: CalendarMode | null = single ? null : roomy ? 'month' : 'week';
  const eventDisplay: CalendarEventDisplay = single ? 'dot' : 'label';
  const { source, selectedDate, setSelectedDate, visibleMonth, setVisibleMonth, mode, setMode, settings } = useCalendarFoldable();
  const { showBottomSheet, hideBottomSheet } = useOverlay();

  const events = useMemo(() => {
    const flat: CalendarEvent<DiaryEntry>[] = [];
    source.index.forEach((bucket) => bucket.forEach((event) => flat.push(withChipLabel(event))));
    return flat;
  }, [source.index]);

  const openDatePicker = useCallback(() => {
    showBottomSheet({
      header: DATE_SHEET_TITLE,
      component: (
        <DatePickerSheet
          initialDate={selectedDate}
          onConfirm={(date) => {
            setSelectedDate(date);
            setVisibleMonth(startOfMonth(date));
            hideBottomSheet();
          }}
        />
      ),
    });
  }, [showBottomSheet, hideBottomSheet, selectedDate, setSelectedDate, setVisibleMonth]);

  const renderHeader = useCallback(
    (context: CalendarHeaderContext) => <BarabomCalendarHeader {...context} petName="바라봄" hasUnread />,
    [],
  );

  return (
    <View style={styles.root}>
      {SHOW_DEV_STRIP && <PaneDevStrip testID="cf-pane-primary" />}
      {source.status === 'error' && <ErrorBox message={source.error} onRetry={source.retry} />}
      <ZSCalendar<DiaryEntry>
        testID="cf-calendar"
        style={styles.root}
        events={events}
        onVisibleRangeChange={source.ensureRange}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        visibleMonth={visibleMonth}
        onMonthChange={setVisibleMonth}
        mode={fixedMode ?? mode}
        onModeChange={single ? setMode : undefined}
        enableModeTransition={single}
        eventDisplay={eventDisplay}
        maxContentWidth={eventDisplay === 'label' ? false : undefined}
        enableScrollModeTransition={settings.scrollTransition}
        renderHeader={renderHeader}
        onTitlePress={openDatePicker}
      >
        {single ? <InlineDiary /> : null}
      </ZSCalendar>
    </View>
  );
}

function InlineDiary() {
  const { source, selectedDate } = useCalendarFoldable();
  const agenda = useCalendarAgenda<DiaryEntry>();
  return (
    <DiaryList
      agenda={agenda}
      loading={source.status === 'loading'}
      header={<DiaryTitle placement="inline" date={selectedDate} count={agenda.items.length} />}
      testID="cf-diary-inline"
    />
  );
}

function SideDiaryPane() {
  const { source, selectedDate } = useCalendarFoldable();
  const agenda = useCalendarAgenda<DiaryEntry>({ index: source.index, selectedDate });

  return (
    <View style={styles.root}>
      {SHOW_DEV_STRIP && <PaneDevStrip testID="cf-pane-secondary" />}
      <DiaryList
        agenda={agenda}
        loading={source.status === 'loading'}
        header={<DiaryTitle placement="side" date={selectedDate} count={agenda.items.length} />}
        testID="cf-diary-side"
      />
    </View>
  );
}

function DiaryTitle({ placement, date, count }: { placement: 'inline' | 'side'; date: DateString; count: number }) {
  return (
    <ZSText variant="subtitle2" emphasized style={styles.diaryTitle} testID={`cf-diary-title-${placement}`}>
      {`${formatDayTitle(date)} · 기록 ${count}건`}
    </ZSText>
  );
}

function PaneDevStrip({ testID }: { testID: string }) {
  const { colors, mode } = useTheme();
  const { role, width, height, heightClass } = usePaneLayout();
  return (
    <View style={[styles.devStrip, { backgroundColor: colors.surface2 }]}>
      <ZSText variant="overline" color="textSecondary" testID={testID}>{`${role} ${Math.round(width)}`}</ZSText>
      <ZSText variant="overline" color="textSecondary" testID={`${testID}-height`}>{`${heightClass} ${Math.round(height)}`}</ZSText>
    </View>
  );
}

function ErrorBox({ message, onRetry }: { message: string | null; onRetry: () => void }) {
  const { colors, mode } = useTheme();
  return (
    <View style={[styles.errorBox, { backgroundColor: colors.errorContainer }]} testID="cf-error">
      <ZSText variant="label" style={{ color: colors.onErrorContainer, flex: 1 }} numberOfLines={2}>
        {message}
      </ZSText>
      <ZSPressable onPress={onRetry} accessibilityRole="button" accessibilityLabel="다시 시도">
        <View style={[styles.retryButton, { backgroundColor: colors.error }]}>
          <ZSText variant="overline" color="onError">재시도</ZSText>
        </View>
      </ZSPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  diaryTitle: { paddingHorizontal: 18 },
  devStrip: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', columnGap: 12, paddingHorizontal: 16, paddingVertical: 4 },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, padding: 10, marginHorizontal: 16, marginTop: 12 },
  retryButton: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
});
