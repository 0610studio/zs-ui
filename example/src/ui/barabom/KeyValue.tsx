import { StyleSheet, View } from 'react-native';
import { ZSText, useTheme } from '@0610studio/zs-ui';
import type { DiaryKeyValue } from '../../../mock-api/db';

type Props = {
  data?: ReadonlyArray<DiaryKeyValue>;
};

/** 바라봄 ZSCalendar/ui/KeyValue 를 그대로 옮겼다 — 행 사이는 구분선, 마지막 행만 선이 없다 */
export default function KeyValue({ data }: Props) {
  const { palette } = useTheme();

  if (!data || data.length === 0) return null;

  return (
    <View style={[styles.container, { backgroundColor: palette.background.layer1 }]}>
      {data.map((item, idx) => (
        <View
          key={`${item.key}-${idx}`}
          style={[
            styles.itemContainer,
            { borderBottomColor: palette.grey[20], borderBottomWidth: data.length - 1 === idx ? 0 : 1 },
          ]}
        >
          <ZSText style={styles.keyText}>{item.key}</ZSText>
          <ZSText style={styles.valueText}>{item.value}</ZSText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 14, paddingVertical: 4, width: '100%' },
  itemContainer: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16, paddingVertical: 9, flex: 1 },
  keyText: { flex: 1, flexShrink: 1, minWidth: 0, marginRight: 8 },
  valueText: { flexShrink: 1, minWidth: 0 },
});
