import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ZSScreen, ZSText, ZSBox, useTheme, useWindowLayout, type EventIndex } from '@0610studio/zs-ui';
import { DIARY_CATEGORIES, type DiaryCategoryMeta, type DiaryEntry } from '../../mock-api/db';
import { useCalendarFoldable } from '../../src/model/CalendarFoldableContext';

type CategoryCount = DiaryCategoryMeta & { count: number };

function summarizeMonth(index: EventIndex<DiaryEntry>, month: string) {
  const prefix = month.slice(0, 8);
  const counts = new Map<string, number>();
  let days = 0;
  index.forEach((bucket, date) => {
    if (!date.startsWith(prefix) || bucket.length === 0) return;
    days += 1;
    bucket.forEach((event) => {
      if (event.data) counts.set(event.data.category, (counts.get(event.data.category) ?? 0) + 1);
    });
  });
  const rows: CategoryCount[] = DIARY_CATEGORIES
    .map((meta) => ({ ...meta, count: counts.get(meta.code) ?? 0 }))
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count);
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  return { rows, total, days };
}

function chunk<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) result.push(items.slice(i, i + size));
  return result;
}

export default function CalendarFoldableStatsTab() {
  const { colors } = useTheme();
  const { widthClass } = useWindowLayout();
  const { source, visibleMonth } = useCalendarFoldable();
  const { rows, total, days } = useMemo(() => summarizeMonth(source.index, visibleMonth), [source.index, visibleMonth]);
  const columns = widthClass === 'compact' ? 1 : 2;
  const max = rows[0]?.count ?? 0;
  const [year, month] = visibleMonth.split('-').map(Number);

  return (
    <ZSScreen style={[styles.container, { backgroundColor: colors.surface1 }]}>
      <View style={styles.heading}>
        <ZSText variant="h3" emphasized testID="cf-stats-title">{`${year}년 ${month}월 기록`}</ZSText>
        <ZSText variant="caption" color="textSecondary" testID="cf-stats-total">
          {source.status === 'loading' && total === 0 ? '불러오는 중…' : `총 ${total}건 · 기록한 날 ${days}일`}
        </ZSText>
      </View>

      {chunk(rows, columns).map((line) => (
        <View key={line.map((row) => row.code).join('-')} style={styles.row}>
          {line.map((row) => (
            <View key={row.code} style={styles.flex1}>
              <ZSBox backgroundColor="surface2" style={styles.card} testID={`cf-stats-${row.code}`}>
                <View style={styles.cardHeader}>
                  <View style={[styles.swatch, { backgroundColor: row.color }]} />
                  <ZSText variant="subtitle2" emphasized style={styles.flex1}>{row.label}</ZSText>
                  <ZSText variant="subtitle2" emphasized>{`${row.count}건`}</ZSText>
                </View>
                <View style={[styles.track, { backgroundColor: colors.surface2 }]}>
                  <View style={[styles.bar, { width: `${(row.count / max) * 100}%`, backgroundColor: row.color }]} />
                </View>
              </ZSBox>
            </View>
          ))}
          {line.length < columns && <View style={styles.flex1} />}
        </View>
      ))}
    </ZSScreen>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40, gap: 12 },
  heading: { width: '100%', gap: 4, marginBottom: 8 },
  row: { width: '100%', flexDirection: 'row', gap: 12 },
  card: { width: '100%', borderRadius: 14, padding: 16, gap: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  swatch: { width: 10, height: 10, borderRadius: 5 },
  flex1: { flex: 1 },
  track: { width: '100%', height: 6, borderRadius: 3, overflow: 'hidden' },
  bar: { height: '100%', borderRadius: 3 },
});
