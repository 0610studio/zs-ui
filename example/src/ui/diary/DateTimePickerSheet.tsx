import { useMemo, useState } from 'react';
import { StyleSheet, View, type TextStyle } from 'react-native';
import DateWheelPicker from '@0610studio/expo-skia-date-wheel-picker';
import { ZSButton, ZSText, useTheme } from '@0610studio/zs-ui';
import { GAP } from '../kit/layout';

type HexColor = `#${string}`;

type Props = {
  initial: Date;
  minimumDate?: Date;
  onConfirm: (value: Date) => void;
  validate?: (value: Date) => string | null;
};

/** 시트 제목 — showBottomSheet header 로 넘긴다(헤더 줄에서 시트를 끈다) */
export const DATETIME_SHEET_TITLE = '날짜·시간 선택';

export default function DateTimePickerSheet({ initial, minimumDate, onConfirm, validate }: Props) {
  const { colors, typography } = useTheme();
  const [value, setValue] = useState<Date>(initial);
  const [error, setError] = useState<string | null>(null);
  const fontFamily = useMemo(() => (StyleSheet.flatten(typography.subtitle2) as TextStyle | undefined)?.fontFamily, [typography]);
  const update = (next: Date) => {
    setValue(next);
    setError(null);
  };
  const confirm = () => {
    const message = validate?.(value) ?? null;
    setError(message);
    if (!message) onConfirm(value);
  };
  const wheel = {
    fontFamily,
    allowFontScaling: false,
    fontSize: 19,
    rowHeight: 37,
    visibleRows: 3,
    locale: 'ko',
    activeFontColor: colors.text as HexColor,
    disableFontColor: colors.borderStrong,
  };
  return (
    <View style={styles.root} testID="datetime-picker-sheet">
      <View style={styles.part}>
        <ZSText variant="caption" emphasized color="textSecondary" style={styles.label}>
          날짜
        </ZSText>
        <DateWheelPicker
          {...wheel}
          mode="date"
          date={value}
          minimumDate={minimumDate}
          onDateChange={(day) => {
            const next = new Date(value);
            next.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());
            update(next);
          }}
        />
      </View>
      <View style={styles.part}>
        <ZSText variant="caption" emphasized color="textSecondary" style={styles.label}>
          시간
        </ZSText>
        <DateWheelPicker
          {...wheel}
          mode="time"
          date={value}
          onDateChange={(time) => {
            const next = new Date(value);
            next.setHours(time.getHours(), time.getMinutes(), 0, 0);
            update(next);
          }}
        />
      </View>
      {error ? (
        <ZSText variant="body2" color="error" accessibilityLiveRegion="polite" testID="datetime-picker-error">
          {error}
        </ZSText>
      ) : null}
      <ZSButton title="확인" size="large" fullWidth onPress={confirm} testID="datetime-picker-confirm" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: GAP.lg, paddingBottom: GAP.lg },
  part: { width: '100%', alignItems: 'center', gap: GAP.xs },
  label: { alignSelf: 'flex-start' },
});
