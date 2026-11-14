import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ZSPressable, ZSText, todayDateString, useOverlay, useTheme, type DateString } from '@0610studio/zs-ui';
import DatePickerSheet, { DATE_SHEET_TITLE } from '../barabom/DatePickerSheet';
import { GAP, ROW_HEIGHT, ROW_INSET, RULE } from '../kit/layout';

type Key = 'start' | 'end';

const LABELS: Record<Key, string> = { start: '시작일', end: '종료일' };

/**
 * 시작일·종료일 칸 — 누르면 날짜 시트를 지금 보이는 화면 위에 띄운다.
 * formSheet·모달 라우트 안이면 그 라우트 위에, 시트 안이면 그 시트 위에 겹쳐 뜨고, 닫으면 아래 화면의 입력이 그대로 남는다.
 */
export default function PeriodFields({ testID }: { testID: string }) {
  const { showBottomSheet, hideBottomSheet } = useOverlay();
  const [period, setPeriod] = useState<Record<Key, DateString>>(() => ({ start: todayDateString(), end: todayDateString() }));

  const pick = (key: Key) =>
    showBottomSheet({
      header: DATE_SHEET_TITLE,
      component: (
        <DatePickerSheet
          initialDate={period[key]}
          onConfirm={(date) => {
            setPeriod((prev) => ({ ...prev, [key]: date }));
            hideBottomSheet();
          }}
        />
      ),
    });

  return (
    <View style={styles.list}>
      {(['start', 'end'] as const).map((key) => (
        <DateRow key={key} label={LABELS[key]} value={period[key]} onPress={() => pick(key)} testID={`${testID}-${key}`} />
      ))}
    </View>
  );
}

function DateRow({ label, value, onPress, testID }: { label: string; value: DateString; onPress: () => void; testID: string }) {
  const { colors } = useTheme();
  return (
    <ZSPressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${label} ${value}`} testID={testID} style={[styles.row, { borderColor: colors.border }]}>
      <ZSText variant="body1" color="textSecondary">
        {label}
      </ZSText>
      <ZSText variant="subtitle1" testID={`${testID}-value`}>
        {value}
      </ZSText>
    </ZSPressable>
  );
}

const styles = StyleSheet.create({
  list: { gap: GAP.sm },
  row: {
    minHeight: ROW_HEIGHT.single,
    paddingHorizontal: ROW_INSET,
    borderWidth: RULE,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
