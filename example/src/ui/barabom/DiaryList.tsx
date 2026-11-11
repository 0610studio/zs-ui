import type { ReactElement } from 'react';
import { FlatList, Image, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ZSText, useTabBarInset, useTheme, type CalendarAgenda } from '@0610studio/zs-ui';
import type { DiaryEntry } from '../../../mock-api/db';
import { AgendaItem } from './AgendaItem';
import { BARABOM_IMAGES } from './stickers';
import { GAP } from '../kit/layout';

const LIST_END_SPACE = 70;

export function DiaryList({ agenda, loading, header, testID = 'diary-list' }: {
  agenda: CalendarAgenda<DiaryEntry>;
  loading: boolean;
  header?: ReactElement;
  testID?: string;
}) {
  const { colors } = useTheme();
  const { bottom: bottomInset, left, right } = useSafeAreaInsets();
  const tabBarInset = useTabBarInset();
  const bottom = bottomInset + (bottomInset > 0 ? tabBarInset : 0);
  const { items, bindScroll } = agenda;

  return (
    <View style={[styles.listContainer, { backgroundColor: colors.background, marginBottom: -bottom, marginLeft: -left, marginRight: -right }]}>
      <View pointerEvents="none" style={styles.gradientContainer}>
        <Image source={BARABOM_IMAGES.GRADIENT_WHITE} resizeMode="stretch" style={[styles.gradientImage, { tintColor: colors.surface1 }]} />
      </View>

      <FlatList
        {...bindScroll}
        testID={testID}
        style={styles.list}
        contentContainerStyle={[styles.listContent, { paddingBottom: LIST_END_SPACE + bottom }, { paddingLeft: left, paddingRight: right }]}
        scrollIndicatorInsets={{ bottom, right }}
        automaticallyAdjustsScrollIndicatorInsets={false}
        data={items}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <ZSText variant="label" color="textSecondary" style={styles.empty}>
            {loading ? '불러오는 중…' : '이 날짜에는 기록이 없습니다'}
          </ZSText>
        }
        renderItem={({ item }) => (item.data ? <AgendaItem item={item.data} /> : null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: { flex: 1, position: 'relative' },
  gradientContainer: { width: '100%', height: 35, position: 'absolute', top: 0, zIndex: 999 },
  gradientImage: { width: '100%', height: 30 },
  list: { flex: 1 },
  listContent: { flexGrow: 1, gap: GAP.md, paddingTop: 30 },
  empty: { paddingVertical: 16, textAlign: 'center' },
});
