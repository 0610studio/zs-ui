import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ZSCalendar, ZSScreen, ZSText, useCalendarAgenda, useTheme, todayDateString, type CalendarEvent, type DateString } from '@0610studio/zs-ui';
import ScreenHeader from '../src/ui/ScreenHeader';

type Kind = 'activity' | 'meal' | 'health';
type Memo = { title: string; kind: Kind };

const KIND_COLOR = { activity: 'success', meal: 'info', health: 'error' } as const;

const today = todayDateString();
const month = today.slice(0, 8);
const EVENTS: CalendarEvent<Memo>[] = [
  { id: '1', date: today, data: { title: '산책 30분', kind: 'activity' } },
  { id: '2', date: today, data: { title: '아침 급여 45g', kind: 'meal' } },
  { id: '3', date: `${month}05` as DateString, data: { title: '병원 예방접종', kind: 'health' } },
  { id: '4', date: `${month}18` as DateString, data: { title: '목욕', kind: 'activity' } },
];
const FIRST_PICK = ([`${month}05`, `${month}18`] as DateString[]).find((date) => date !== today) ?? today;

function MemoList() {
  const { colors } = useTheme();
  const { items, bindScroll } = useCalendarAgenda<Memo>();
  return (
    <FlatList
      {...bindScroll}
      data={items}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      ListEmptyComponent={<ZSText variant="label" color="textSecondary" style={styles.empty}>기록이 없습니다</ZSText>}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <View style={[styles.dot, { backgroundColor: item.data ? colors[KIND_COLOR[item.data.kind]] : colors.textSecondary }]} />
          <ZSText variant="body2">{item.data?.title}</ZSText>
        </View>
      )}
    />
  );
}

export default function ZSCalendarExample() {
  const { colors } = useTheme();
  const [selectedDate, setSelectedDate] = useState<DateString>(FIRST_PICK);
  const events = useMemo(() => EVENTS.map((event) => ({ ...event, color: event.data ? colors[KIND_COLOR[event.data.kind]] : undefined })), [colors]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <ScreenHeader title="ZSCalendar" />
      <ZSScreen scrollEnabled={false} maxContentWidth="none" backgroundColor="background">
        <ZSCalendar<Memo>
          style={styles.root}
          events={events}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          testID="basic-calendar"
        >
          <MemoList />
        </ZSCalendar>
      </ZSScreen>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  list: { padding: 20, gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  empty: { textAlign: 'center', paddingVertical: 24 },
});
