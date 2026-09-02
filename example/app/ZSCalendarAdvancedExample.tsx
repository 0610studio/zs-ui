import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  ZSCalendar,
  ZSContainer,
  ZSPressable,
  ZSText,
  useCalendarAgenda,
  useOverlay,
  getEventsOn,
  startOfMonth,
  todayDateString,
  useTheme,
  type CalendarHeaderContext,
  type CalendarMode,
  type CalendarThemeOverride,
  type DateRange,
  type DateString,
} from '@0610studio/zs-ui';
import type { DiaryEntry } from '../mock-api/db';
import { useCalendarDataSource } from '../src/model/useCalendarDataSource';
import FpsProbe from '../src/ui/FpsProbe';
import { AgendaItem } from '../src/ui/barabom/AgendaItem';
import BarabomCalendarHeader from '../src/ui/barabom/CalendarHeader';
import DatePickerSheet from '../src/ui/barabom/DatePickerSheet';
import { BARABOM_IMAGES } from '../src/ui/barabom/stickers';

/** 바라봄 CALENDAR_COLORS — 팔레트에서 나오지 않는 요일 색만 여기 둔다. 선택 카드·오늘 원은 ZSCalendar 기본 그림이다 */
const BARABOM_CALENDAR_THEME: CalendarThemeOverride = {
  sundayText: '#FF7575',
  saturdayText: '#8AA7FF',
  weekdayText: '#949494',
};

/** ZSCalendar 의 children 이라 인자 없이 컨텍스트에서 받는다 */
function DiaryList({ loading }: { loading: boolean }) {
  const { palette } = useTheme();
  // 달력 점과 같은 인덱스에서 나온다
  const { items, bindScroll } = useCalendarAgenda<DiaryEntry>();

  return (
    <View style={[styles.listContainer, { backgroundColor: palette.grey[20] }]}>
      {/* 달력 아래로 카드가 스며드는 흰 그라디언트 — 다크 모드에서는 tint 로 배경색을 따라간다 */}
      <View pointerEvents="none" style={styles.gradientContainer}>
        <Image source={BARABOM_IMAGES.GRADIENT_WHITE} resizeMode="stretch" style={[styles.gradientImage, { tintColor: palette.background.base }]} />
      </View>

      <FlatList
        {...bindScroll}
        testID="diary-list"
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={items}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <ZSText typo="caption.1" color="secondary" style={styles.empty}>
            {loading ? '불러오는 중…' : '이 날짜에는 기록이 없습니다'}
          </ZSText>
        }
        renderItem={({ item }) => (item.data ? <AgendaItem item={item.data} /> : null)}
      />
    </View>
  );
}

/**
 * 개발용 상태 띠 — 화면 디자인이 아니라 계측·e2e 용이다.
 * 달력과 리스트 사이에 두면 바라봄의 흐름이 끊겨서 FPS 줄과 함께 맨 위에 둔다.
 */
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
  const { palette } = useTheme();
  return (
    <View style={[styles.devStrip, { backgroundColor: palette.background.layer2 }]}>
      <FpsProbe />
      <View style={styles.devRow}>
        <ZSText typo="caption.2" color="secondary" testID="diary-count">
          {`${selectedDate ?? '날짜를 선택하세요'} · 일정 ${count}건`}
        </ZSText>
        <View style={styles.devRowRight}>
          {loading && <ActivityIndicator size="small" testID="diary-loading" />}
          <ZSText typo="caption.2" color="secondary" testID="diary-mode">{`보기 ${mode}`}</ZSText>
          {/* 리스트 스크롤이 달력을 접는 연동을 끄고 켠다 — 팬 제스처는 영향 없다 */}
          <Pressable
            onPress={onToggleScrollTransition}
            hitSlop={6}
            accessibilityRole="switch"
            accessibilityState={{ checked: scrollTransition }}
            // iOS 는 이 라벨만 접근성 트리에 올리므로 표시 문구와 같게 둬야 스크린리더·e2e 가 상태를 읽는다
            accessibilityLabel={scrollTransition ? '스크롤 전환 켬' : '스크롤 전환 끔'}
            testID="scroll-transition-toggle"
            style={[
              styles.toggleChip,
              { borderColor: scrollTransition ? palette.primary[40] : palette.grey[30], backgroundColor: scrollTransition ? palette.primary[10] : 'transparent' },
            ]}
          >
            <ZSText typo="caption.4" style={{ color: scrollTransition ? palette.primary.dark : palette.text.secondary }}>
              {scrollTransition ? '스크롤 전환 켬' : '스크롤 전환 끔'}
            </ZSText>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

/**
 * 심화 예제 — 바라봄 일기 달력 화면을 그대로 옮겼다.
 * mock API 지연·오류·재시도, 커스텀 헤더, 바텀시트 날짜 선택기, 스크롤 전환 토글, FPS 계측까지 들어 있다.
 * 가장 짧은 사용법은 ZSCalendarExample 을 본다.
 */
export default function ZSCalendarAdvancedExample() {
  const { palette } = useTheme();

  // 빈 목록으로 시작하면 연동이 보이지 않는다
  const [selectedDate, setSelectedDate] = useState<DateString | null>(() => todayDateString());
  // 날짜 선택기로 다른 달을 고르면 그리드도 그 달로 가야 하므로 보이는 달을 밖에서 쥔다
  const [visibleMonth, setVisibleMonth] = useState<DateString>(() => startOfMonth(todayDateString()));
  const [mode, setMode] = useState<CalendarMode>('month');
  const { showBottomSheet, hideOverlay } = useOverlay();
  const [scrollTransition, setScrollTransition] = useState(true);
  const toggleScrollTransition = useCallback(() => setScrollTransition((on) => !on), []);

  const source = useCalendarDataSource();
  const { ensureRange } = source;

  // 앞뒤 페이지까지 포함한 범위를 받아 그대로 fetch 한다
  const handleVisibleRangeChange = useCallback((range: DateRange) => ensureRange(range), [ensureRange]);

  const events = useMemo(() => {
    const flat: Array<{ id: string; date: DateString; color?: string; data?: DiaryEntry }> = [];
    source.index.forEach((bucket) => flat.push(...bucket));
    return flat;
  }, [source.index]);

  const selectedCount = useMemo(
    () => (selectedDate ? getEventsOn(source.index, selectedDate).length : 0),
    [source.index, selectedDate],
  );

  const handleDateChange = useCallback((date: DateString) => setSelectedDate(date), []);
  // 바라봄처럼 연월을 누르면 바텀시트 날짜 선택기 — 고른 날을 선택하고 그 달로 이동한다
  const handleTitlePress = useCallback(() => {
    showBottomSheet({
      options: { height: 'auto' },
      component: (
        <DatePickerSheet
          initialDate={selectedDate ?? todayDateString()}
          onConfirm={(date) => {
            setSelectedDate(date);
            setVisibleMonth(startOfMonth(date));
            hideOverlay('bottomSheet');
          }}
        />
      ),
    });
  }, [showBottomSheet, hideOverlay, selectedDate]);

  const renderHeader = useCallback(
    (context: CalendarHeaderContext) => <BarabomCalendarHeader {...context} petName="바라봄" hasUnread />,
    [],
  );

  return (
    <GestureHandlerRootView style={styles.root}>
      <Stack.Screen options={{ title: 'ZSCalendar 심화' }} />
      <ZSContainer scrollViewDisabled style={[styles.container, { backgroundColor: palette.background.base }]}>
        {Platform.OS === 'web' && (
          <View style={[styles.notice, { backgroundColor: palette.warning[10] }]} testID="calendar-web-unsupported">
            <ZSText typo="caption.1" style={{ color: palette.warning[70] }}>
              ZSCalendar 는 웹을 지원하지 않습니다. iOS · Android 에서 확인하세요.
            </ZSText>
          </View>
        )}

        {(__DEV__ || process.env.EXPO_PUBLIC_DEV_STRIP === '1') && (
          <DevStrip
            selectedDate={selectedDate}
            count={selectedCount}
            mode={mode}
            loading={source.status === 'loading'}
            scrollTransition={scrollTransition}
            onToggleScrollTransition={toggleScrollTransition}
          />
        )}

        {source.status === 'error' && (
          <View style={[styles.errorBox, { backgroundColor: palette.danger[10] }]} testID="diary-error">
            <ZSText typo="caption.1" style={{ color: palette.danger[70], flex: 1 }} numberOfLines={2}>
              {source.error}
            </ZSText>
            <ZSPressable onPress={source.retry} testID="diary-retry" accessibilityRole="button" accessibilityLabel="다시 시도">
              <View style={[styles.retryButton, { backgroundColor: palette.danger[50] }]}>
                <ZSText typo="caption.2" color="white">재시도</ZSText>
              </View>
            </ZSPressable>
          </View>
        )}

        <ZSCalendar<DiaryEntry>
          testID="diary-calendar"
          style={styles.calendar}
          events={events}
          onVisibleRangeChange={handleVisibleRangeChange}
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          visibleMonth={visibleMonth}
          onMonthChange={setVisibleMonth}
          mode={mode}
          onModeChange={setMode}
          calendarTheme={BARABOM_CALENDAR_THEME}
          renderHeader={renderHeader}
          onTitlePress={handleTitlePress}
          enableScrollModeTransition={scrollTransition}
        >
          <DiaryList loading={source.status === 'loading'} />
        </ZSCalendar>
      </ZSContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1 },
  calendar: { flex: 1 },
  // 그리드 아래 여백은 ZSCalendar 가 그림자 번짐만큼 이미 두므로 따로 주지 않는다
  listContainer: { flex: 1, position: 'relative' },
  gradientContainer: { width: '100%', height: 35, position: 'absolute', top: 0, zIndex: 999 },
  gradientImage: { width: '100%', height: 30 },
  list: { flex: 1 },
  // InfiniteScrollFlatList.scrollViewContent 와 같은 리듬 — 카드 사이 20, 위 30, 아래 70
  listContent: { flexGrow: 1, gap: 20, paddingTop: 30, paddingBottom: 70 },
  devStrip: { paddingHorizontal: 12, paddingVertical: 6, gap: 4 },
  devRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  devRowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toggleChip: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 },
  notice: { borderRadius: 10, padding: 10, marginHorizontal: 16, marginTop: 12 },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, padding: 10, marginHorizontal: 16, marginTop: 12 },
  retryButton: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  empty: { paddingVertical: 16, textAlign: 'center' },
});
