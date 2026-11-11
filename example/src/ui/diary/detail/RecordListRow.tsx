import { Image, StyleSheet, View } from 'react-native';
import { ZSPressable, ZSText, useTheme } from '@0610studio/zs-ui';
import ContentIcon from '../../kit/ContentIcon';
import { GAP, ROW_HEIGHT, ROW_INSET } from '../../kit/layout';
import { formatListTime, recordLabel, recordSummary } from '../../../model/diary/detail';
import type { DiaryRecord } from '../../../model/diary/records';
import { categoryIcon } from '../diaryAssets';

export const RECORD_ICON = 32;

/** 지난 기록 한 줄 — 분류 아이콘 · 분류 이름 · 시각과 대표 값 → 기록 상세 */
export default function RecordListRow({ record, onPress }: { record: DiaryRecord; onPress: () => void }) {
  const { colors } = useTheme();
  const summary = recordSummary(record);
  const caption = [formatListTime(record.at), summary].filter(Boolean).join(' · ');
  return (
    <ZSPressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${recordLabel(record)}, ${caption}`} testID={`diary-record-${record.id}`} style={styles.pressable}>
      <View style={styles.row}>
        <Image source={categoryIcon(record.category)} style={styles.icon} resizeMode="contain" />
        <View style={styles.text}>
          <ZSText variant="subtitle1">{recordLabel(record)}</ZSText>
          <ZSText variant="caption" color="textSecondary" numberOfLines={1}>
            {caption}
          </ZSText>
        </View>
        <ContentIcon name="chevronRight" size={20} color={colors.textSecondary} />
      </View>
    </ZSPressable>
  );
}

const styles = StyleSheet.create({
  pressable: { marginHorizontal: -ROW_INSET, paddingHorizontal: ROW_INSET },
  row: { width: '100%', minHeight: ROW_HEIGHT.double, flexDirection: 'row', alignItems: 'center', gap: GAP.md, paddingVertical: GAP.md },
  icon: { width: RECORD_ICON, height: RECORD_ICON },
  // flex: 1 대신 grow+shrink — 글이 줄바꿈되게
  text: { flexGrow: 1, flexShrink: 1, gap: GAP.xxs },
});
