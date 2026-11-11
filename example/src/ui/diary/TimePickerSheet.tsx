import { useMemo, useState } from 'react';
import { StyleSheet, View, type TextStyle } from 'react-native';
import DateWheelPicker from '@0610studio/expo-skia-date-wheel-picker';
import { ZSButton, ZSText, useTheme } from '@0610studio/zs-ui';
import { GAP } from '../kit/layout';

type HexColor = `#${string}`;

type Props = {
  initialTime: Date;
  onConfirm: (time: Date) => void;
  validate?: (time: Date) => string | null;
};

/** 시트 제목 — showBottomSheet header 로 넘긴다(헤더 줄에서 시트를 끈다) */
export const TIME_SHEET_TITLE = '시간 선택';

export default function TimePickerSheet({ initialTime, onConfirm, validate }: Props) {
  const { colors, typography } = useTheme();
  const [time, setTime] = useState<Date>(initialTime);
  const [error, setError] = useState<string | null>(null);
  const confirm = () => {
    const message = validate?.(time) ?? null;
    setError(message);
    if (!message) onConfirm(time);
  };
  const fontFamily = useMemo(() => (StyleSheet.flatten(typography.subtitle2) as TextStyle | undefined)?.fontFamily, [typography]);
  return (
    <View style={styles.root} testID="time-picker-sheet">
      <View style={styles.wheel} testID="time-picker-wheel">
        <DateWheelPicker
          date={time}
          onDateChange={(next) => {
            setTime(next);
            setError(null);
          }}
          mode="time"
          fontFamily={fontFamily}
          allowFontScaling={false}
          fontSize={19}
          rowHeight={37}
          locale="ko"
          activeFontColor={colors.text as HexColor}
          disableFontColor={colors.borderStrong}
        />
      </View>
      {error ? (
        <ZSText variant="body2" color="error" accessibilityLiveRegion="polite" testID="time-picker-error">
          {error}
        </ZSText>
      ) : null}
      <ZSButton title="확인" size="large" fullWidth onPress={confirm} testID="time-picker-confirm" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: GAP.lg, paddingBottom: GAP.lg },
  wheel: { width: '100%', alignItems: 'center', justifyContent: 'center' },
});
