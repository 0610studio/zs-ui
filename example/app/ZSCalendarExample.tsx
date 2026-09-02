import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ZSCalendar, ZSText, useCalendarAgenda, todayDateString, type CalendarEvent, type DateString } from '@0610studio/zs-ui';

type Memo = { title: string };

/** 달력 점과 아래 목록이 같은 배열에서 나온다 — 날짜별로 다시 묶을 필요가 없다 */
const today = todayDateString();
const EVENTS: CalendarEvent<Memo>[] = [
  { id: '1', date: today, color: '#D7B8FF', data: { title: '산책 30분' } },
  { id: '2', date: today, color: '#A7DBD1', data: { title: '아침 급여 45g' } },
  { id: '3', date: `${today.slice(0, 8)}05` as DateString, color: '#FF9761', data: { title: '병원 예방접종' } },
  { id: '4', date: `${today.slice(0, 8)}18` as DateString, color: '#FFD164', data: { title: '목욕' } },
];

/** ZSCalendar 의 children 이면 인자 없이 선택한 날짜의 일정을 받고, 스크롤로 주↔월 전환도 된다 */
function MemoList() {
  const { items, bindScroll } = useCalendarAgenda<Memo>();
  return (
    <FlatList
      {...bindScroll}
      data={items}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      ListEmptyComponent={<ZSText typo="caption.1" color="secondary" style={styles.empty}>기록이 없습니다</ZSText>}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <View style={[styles.dot, { backgroundColor: item.color }]} />
          <ZSText typo="body.3">{item.data?.title}</ZSText>
        </View>
      )}
    />
  );
}

/** 기본 예제 — 이벤트 배열 하나와 선택 날짜 상태만으로 동작하는 최소 구성 */
export default function ZSCalendarExample() {
  const [selectedDate, setSelectedDate] = useState<DateString>(today);

  return (
    <GestureHandlerRootView style={styles.root}>
      <Stack.Screen options={{ title: 'ZSCalendar' }} />
      <ZSCalendar<Memo>
        style={styles.root}
        events={EVENTS}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        testID="basic-calendar"
      >
        <MemoList />
      </ZSCalendar>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  list: { padding: 16, gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  empty: { textAlign: 'center', paddingVertical: 24 },
});
