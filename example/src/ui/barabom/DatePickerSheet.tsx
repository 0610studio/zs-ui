import { useCallback, useMemo, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, TextInput, View, type TextStyle } from 'react-native';
import DateWheelPicker from '@0610studio/expo-skia-date-wheel-picker';
import { ZSPressable, ZSSegmentedControl, ZSText, useTheme, type DateString } from '@0610studio/zs-ui';

type InteractionMode = 'select' | 'input';
type HexColor = `#${string}`;

type Props = {
  initialDate: DateString;
  onConfirm: (date: DateString) => void;
};

let lastInteractionMode: InteractionMode = 'select';

const pad2 = (n: number): string => String(n).padStart(2, '0');
const toDateString = (date: Date): DateString => `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}` as DateString;
const fromDateString = (value: DateString): Date => {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const sanitizeDigits = (text: string): string => text.replace(/[^0-9]/g, '').slice(0, 8);

const parseDateDigits = (digits: string): Date | null => {
  if (!/^\d{8}$/.test(digits)) return null;
  const y = Number(digits.slice(0, 4));
  const m = Number(digits.slice(4, 6));
  const d = Number(digits.slice(6, 8));
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d ? date : null;
};

const toDigits = (date: Date): string => toDateString(date).replace(/-/g, '');

const MODE_OPTIONS: { label: string; value: InteractionMode }[] = [
  { label: '선택', value: 'select' },
  { label: '입력', value: 'input' },
];

/** 시트 제목 — showBottomSheet header 로 넘긴다(헤더 줄에서 시트를 끈다). 선택|입력은 본문 맨 위 전환으로 고른다 */
export const DATE_SHEET_TITLE = '날짜';

export default function DatePickerSheet({ initialDate, onConfirm }: Props) {
  const { colors, mode, typography } = useTheme();
  const [interactionMode, setInteractionMode] = useState<InteractionMode>(lastInteractionMode);
  const [date, setDate] = useState<Date>(() => fromDateString(initialDate));
  const [inputDate, setInputDate] = useState<string>(() => initialDate.replace(/-/g, ''));
  const [errorMessage, setErrorMessage] = useState('');

  const fontFamily = useMemo(() => (StyleSheet.flatten(typography.subtitle2) as TextStyle | undefined)?.fontFamily, [typography]);

  const handleModeChange = useCallback(
    (next: InteractionMode) => {
      if (next === 'select') {
        const parsed = parseDateDigits(inputDate);
        if (parsed) setDate(parsed);
        setInteractionMode('select');
        setErrorMessage('');
      } else {
        setInputDate(toDigits(date));
        setInteractionMode('input');
      }
      lastInteractionMode = next;
    },
    [date, inputDate],
  );

  const handleInputChange = useCallback((text: string) => {
    setInputDate(sanitizeDigits(text));
    setErrorMessage('');
  }, []);

  const handleConfirm = useCallback(() => {
    if (interactionMode === 'input') {
      const parsed = parseDateDigits(inputDate);
      if (!parsed) {
        setErrorMessage('날짜 형식이 올바르지 않습니다.');
        return;
      }
      onConfirm(toDateString(parsed));
      return;
    }
    onConfirm(toDateString(date));
  }, [interactionMode, inputDate, date, onConfirm]);

  return (
    <View style={styles.container} testID="date-picker-sheet">
      <Pressable style={styles.titleBox} onPress={Keyboard.dismiss} accessible={false}>
        <ZSSegmentedControl
          options={MODE_OPTIONS}
          defaultValue={interactionMode}
          onValueChange={handleModeChange}
          fullWidth={false}
          testID="date-picker-mode"
        />
      </Pressable>

      {interactionMode === 'select' ? (
        <View style={styles.pickerContainer} testID="date-picker-wheel">
          <DateWheelPicker
            date={date}
            onDateChange={setDate}
            mode="date"
            fontFamily={fontFamily}
            allowFontScaling={false}
            fontSize={19}
            rowHeight={37}
            locale="ko"
            activeFontColor={colors.text as HexColor}
            disableFontColor={colors.borderStrong}
          />
        </View>
      ) : (
        <Pressable style={styles.inputContainer} onPress={Keyboard.dismiss} accessible={false}>
          <View style={[styles.inputBox, { borderColor: errorMessage ? colors.error : colors.borderStrong }]}>
            <TextInput
              allowFontScaling={false}
              style={[styles.input, { color: colors.text, fontFamily }]}
              placeholder="YYYYMMDD"
              maxLength={8}
              placeholderTextColor={colors.borderStrong}
              keyboardType="number-pad"
              selectTextOnFocus
              value={inputDate}
              onChangeText={handleInputChange}
              testID="date-picker-input"
            />
          </View>
          <ZSText allowFontScaling={false} variant="label" color="textSecondary" style={styles.hint}>
            날짜는 숫자 8자리로 입력해주세요. (예: 20261015)
          </ZSText>
        </Pressable>
      )}

      {!!errorMessage && (
        <ZSText variant="overline" style={[styles.error, { color: colors.error }]} testID="date-picker-error">
          {errorMessage}
        </ZSText>
      )}

      <ZSPressable
        onPress={handleConfirm}
        pressedColor="transparent"
        accessibilityRole="button"
        accessibilityLabel="확인"
        testID="date-picker-confirm"
        style={[styles.confirm, { backgroundColor: errorMessage ? colors.surface4 : colors.primary }]}
      >
        <ZSText variant="subtitle1" emphasized color={errorMessage ? 'textSecondary' : 'onPrimary'}>확인</ZSText>
      </ZSPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  // 선택|입력 전환 — 제목은 시트 헤더로 옮겼다
  titleBox: { flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 15 },
  pickerContainer: { width: '100%', alignItems: 'center', justifyContent: 'center' },
  inputContainer: { width: '100%', alignItems: 'center', gap: 5, marginTop: 5 },
  inputBox: { width: '100%', height: 80, borderWidth: 1, borderRadius: 14, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 10, marginTop: 5 },
  input: { fontSize: 20, width: '100%', height: '100%', textAlign: 'center', letterSpacing: 4 },
  hint: { width: '100%', paddingLeft: 10 },
  error: { paddingLeft: 10, marginTop: 8 },
  confirm: { marginTop: 20, marginBottom: 5, paddingVertical: 13, borderRadius: 12, alignItems: 'center', justifyContent: 'center', width: '100%' },
});
