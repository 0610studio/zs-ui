import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  ZSCalendar,
  ZSPaneLayout,
  ZSPressable,
  ZSText,
  useCalendarAgenda,
  usePaneLayout,
  useOverlay,
  getEventsOn,
  isValidDateString,
  startOfMonth,
  todayDateString,
  useTheme,
  type CalendarEvent,
  type CalendarHeaderContext,
  type CalendarMode,
  type DateRange,
  type DateString,
  type EventIndex,
} from '@0610studio/zs-ui';
import { categoryMeta, type DiaryEntry } from '../mock-api/db';
import { useCalendarDataSource } from '../src/model/useCalendarDataSource';
import FpsProbe from '../src/ui/FpsProbe';
import BarabomCalendarHeader from '../src/ui/barabom/CalendarHeader';
import DatePickerSheet, { DATE_SHEET_TITLE } from '../src/ui/barabom/DatePickerSheet';
import { DiaryList } from '../src/ui/barabom/DiaryList';
import RecipeHeader from '../src/ui/recipe/RecipeHeader';

function CalendarDiaryList({ loading }: { loading: boolean }) {
  const agenda = useCalendarAgenda<DiaryEntry>();
  return <DiaryList agenda={agenda} loading={loading} />;
}

const DEV_STRIP_MAX_FONT_SCALE = 2;
const SHOW_DEV_STRIP = __DEV__ || process.env.EXPO_PUBLIC_DEV_STRIP === '1';

function DevStrip({
  selectedDate,
  count,
  mode,
  loading,
  scrollTransition,
  onToggleScrollTransition,
}: {
  selectedDate: DateString | null;
  count: number;
  mode: CalendarMode;
  loading: boolean;
  scrollTransition: boolean;
  onToggleScrollTransition: () => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.devStrip, { backgroundColor: colors.surface2 }]}>
      <FpsProbe maxFontSizeMultiplier={DEV_STRIP_MAX_FONT_SCALE} />
      <View style={styles.devRow}>
        <ZSText variant="overline" color="textSecondary" maxFontSizeMultiplier={DEV_STRIP_MAX_FONT_SCALE} testID="diary-count">
          {`${selectedDate ?? '날짜를 선택하세요'} · 일정 ${count}건`}
        </ZSText>
        <View style={styles.devRowRight}>
          {loading && <ActivityIndicator size="small" testID="diary-loading" />}
          <ZSText variant="overline" color="textSecondary" maxFontSizeMultiplier={DEV_STRIP_MAX_FONT_SCALE} testID="diary-mode">{`보기 ${mode}`}</ZSText>
          <Pressable
            onPress={onToggleScrollTransition}
            hitSlop={6}
            accessibilityRole="switch"
            accessibilityState={{ checked: scrollTransition }}
            accessibilityLabel={scrollTransition ? '스크롤 전환 켬' : '스크롤 전환 끔'}
            testID="scroll-transition-toggle"
            style={[
              styles.toggleChip,
              { borderColor: scrollTransition ? colors.primary : colors.border, backgroundColor: scrollTransition ? colors.primary : 'transparent' },
            ]}
          >
            <ZSText
              variant="overline"
              maxFontSizeMultiplier={DEV_STRIP_MAX_FONT_SCALE}
              style={{ color: scrollTransition ? colors.onPrimary : colors.textSecondary }}
            >
              {scrollTransition ? '스크롤 전환 켬' : '스크롤 전환 끔'}
            </ZSText>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default function ZSCalendarAdvancedExample() {
  return <ZSCalendarAdvancedScreen />;
}

function ZSCalendarAdvancedScreen() {
  const { colors } = useTheme();

  const { date } = useLocalSearchParams<{ date?: string }>();
  const baseDate = isValidDateString(date) ? date : todayDateString();

  const [selectedDate, setSelectedDate] = useState<DateString | null>(() => baseDate);
  const [visibleMonth, setVisibleMonth] = useState<DateString>(() => startOfMonth(baseDate));
  const [mode, setMode] = useState<CalendarMode>('month');
  const { showBottomSheet, hideBottomSheet } = useOverlay();
  const [scrollTransition, setScrollTransition] = useState(true);
  const toggleScrollTransition = useCallback(() => setScrollTransition((on) => !on), []);

  const source = useCalendarDataSource();
  const { ensureRange } = source;

  const handleVisibleRangeChange = useCallback((range: DateRange) => ensureRange(range), [ensureRange]);

  const events = useMemo(() => {
    const flat: { id: string; date: DateString; color?: string; data?: DiaryEntry }[] = [];
    source.index.forEach((bucket) => flat.push(...bucket));
    return flat;
  }, [source.index]);

  const selectedCount = useMemo(
    () => (selectedDate ? getEventsOn(source.index, selectedDate).length : 0),
    [source.index, selectedDate],
  );

  const handleDateChange = useCallback((date: DateString) => setSelectedDate(date), []);
  const handleTitlePress = useCallback(() => {
    showBottomSheet({
      header: DATE_SHEET_TITLE,
      component: (
        <DatePickerSheet
          initialDate={selectedDate ?? baseDate}
          onConfirm={(date) => {
            setSelectedDate(date);
            setVisibleMonth(startOfMonth(date));
            hideBottomSheet();
          }}
        />
      ),
    });
  }, [showBottomSheet, hideBottomSheet, selectedDate]);

  const devStrip = SHOW_DEV_STRIP ? (
    <DevStrip
      selectedDate={selectedDate}
      count={selectedCount}
      mode={mode}
      loading={source.status === 'loading'}
      scrollTransition={scrollTransition}
      onToggleScrollTransition={toggleScrollTransition}
    />
  ) : null;

  const errorBox =
    source.status === 'error' ? (
      <View style={[styles.errorBox, { backgroundColor: colors.errorContainer }]} testID="diary-error">
        <ZSText variant="label" style={{ color: colors.onErrorContainer, flex: 1 }} numberOfLines={2}>
          {source.error}
        </ZSText>
        <ZSPressable onPress={source.retry} testID="diary-retry" accessibilityRole="button" accessibilityLabel="다시 시도">
          <View style={[styles.retryButton, { backgroundColor: colors.error }]}>
            <ZSText variant="overline" color="onError">재시도</ZSText>
          </View>
        </ZSPressable>
      </View>
    ) : null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <RecipeHeader title="ZSCalendar 심화" />
      <ZSPaneLayout
        primaryFraction={0.5}
        backgroundColor="background"
        primary={
          <CalendarPane
            devStrip={devStrip}
            errorBox={errorBox}
            events={events}
            loading={source.status === 'loading'}
            onVisibleRangeChange={handleVisibleRangeChange}
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
            visibleMonth={visibleMonth}
            onMonthChange={setVisibleMonth}
            mode={mode}
            onModeChange={setMode}
            onTitlePress={handleTitlePress}
            scrollTransition={scrollTransition}
          />
        }
        secondary={<SideDiary index={source.index} selectedDate={selectedDate} loading={source.status === 'loading'} />}
      />
    </GestureHandlerRootView>
  );
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function formatDayTitle(date: DateString): string {
  const [y, m, d] = date.split('-').map(Number);
  return `${m}월 ${d}일 (${WEEKDAYS[new Date(y, m - 1, d).getDay()]})`;
}

const renderHeader = (context: CalendarHeaderContext) => <BarabomCalendarHeader {...context} petName="바라봄" hasUnread />;

function CalendarPane({
  devStrip,
  errorBox,
  events,
  loading,
  onVisibleRangeChange,
  selectedDate,
  onDateChange,
  visibleMonth,
  onMonthChange,
  mode,
  onModeChange,
  onTitlePress,
  scrollTransition,
}: {
  devStrip: ReactNode;
  errorBox: ReactNode;
  events: CalendarEvent<DiaryEntry>[];
  loading: boolean;
  onVisibleRangeChange: (range: DateRange) => void;
  selectedDate: DateString | null;
  onDateChange: (date: DateString) => void;
  visibleMonth: DateString;
  onMonthChange: (month: DateString) => void;
  mode: CalendarMode;
  onModeChange: (mode: CalendarMode) => void;
  onTitlePress: () => void;
  scrollTransition: boolean;
}) {
  const { role, heightClass } = usePaneLayout();
  const single = role === 'single';
  const roomy = heightClass !== 'compact';
  const labelEvents = useMemo(() => (single ? events : events.map(withChipLabel)), [single, events]);
  return (
    <View style={styles.root}>
      {devStrip}
      {errorBox}
      <ZSCalendar<DiaryEntry>
        testID="diary-calendar"
        style={styles.calendar}
        events={labelEvents}
        onVisibleRangeChange={onVisibleRangeChange}
        selectedDate={selectedDate}
        onDateChange={onDateChange}
        visibleMonth={visibleMonth}
        onMonthChange={onMonthChange}
        mode={single ? mode : roomy ? 'month' : 'week'}
        onModeChange={single ? onModeChange : undefined}
        enableModeTransition={single}
        eventDisplay={single || !roomy ? 'dot' : 'label'}
        renderHeader={renderHeader}
        onTitlePress={onTitlePress}
        enableScrollModeTransition={scrollTransition}
      >
        {single ? <CalendarDiaryList loading={loading} /> : null}
      </ZSCalendar>
    </View>
  );
}

function withChipLabel(event: CalendarEvent<DiaryEntry>): CalendarEvent<DiaryEntry> {
  const memo = event.data?.memo.trim().split('\n')[0];
  return { ...event, label: memo || (event.data ? categoryMeta(event.data.category).label : undefined) };
}

function SideDiary({ index, selectedDate, loading }: { index: EventIndex<DiaryEntry>; selectedDate: DateString | null; loading: boolean }) {
  const agenda = useCalendarAgenda<DiaryEntry>({ index, selectedDate: selectedDate ?? todayDateString() });
  return (
    <DiaryList
      agenda={agenda}
      loading={loading}
      header={
        <ZSText variant="subtitle1" emphasized accessibilityRole="header" style={styles.sideTitle} testID="diary-side-title">
          {`${formatDayTitle(selectedDate ?? todayDateString())} · 기록 ${agenda.items.length}건`}
        </ZSText>
      }
      testID="diary-list-side"
    />
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  sideTitle: { paddingHorizontal: 18 },
  calendar: { flex: 1 },
  devStrip: { paddingHorizontal: 12, paddingVertical: 6, gap: 4 },
  devRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', rowGap: 4, columnGap: 8, paddingHorizontal: 4 },
  devRowRight: { flexDirection: 'row', flexWrap: 'wrap', flexShrink: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginLeft: 'auto' },
  toggleChip: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, padding: 10, marginHorizontal: 16, marginTop: 12 },
  retryButton: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
});
