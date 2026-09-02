import { useCallback, useMemo, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, TextInput, View, type TextStyle } from 'react-native';
import DateWheelPicker from '@0610studio/expo-skia-date-wheel-picker';
import { ZSPressable, ZSSegmented, ZSText, useTheme, type DateString } from '@0610studio/zs-ui';

type InteractionMode = 'select' | 'input';
/** 휠 피커는 배경·강조색을 hex 문자열 타입으로만 받는다 — 팔레트 값은 전부 hex 라 캐스팅만 한다 */
type HexColor = `#${string}`;

type Props = {
  /** 'YYYY-MM-DD' — 휠의 초기 위치 */
  initialDate: DateString;
  /** 확인을 눌렀을 때만 날짜가 온다. 시트를 닫는 것은 호출자 몫 */
  onConfirm: (date: DateString) => void;
};

/** 바라봄은 마지막 모드를 AsyncStorage 에 기억한다 — 데모는 앱이 살아 있는 동안만 기억한다 */
let lastInteractionMode: InteractionMode = 'select';

const pad2 = (n: number): string => String(n).padStart(2, '0');
const toDateString = (date: Date): DateString => `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}` as DateString;
const fromDateString = (value: DateString): Date => {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
};

/**
 * 숫자 8자리(YYYYMMDD)만 받는다. 바라봄처럼 타이핑 중에 하이픈을 끼워 넣으면 Android 제어형 입력이
 * 빠른 입력과 경합해 글자 순서가 뒤바뀌므로, 입력값은 그대로 두고 확인할 때만 해석한다.
 */
const sanitizeDigits = (text: string): string => text.replace(/[^0-9]/g, '').slice(0, 8);

/** 존재하는 날짜만 통과시킨다 — 2월 30일 같은 입력은 Date 가 조용히 다음 달로 넘겨 버린다 */
const parseDateDigits = (digits: string): Date | null => {
  if (!/^\d{8}$/.test(digits)) return null;
  const y = Number(digits.slice(0, 4));
  const m = Number(digits.slice(4, 6));
  const d = Number(digits.slice(6, 8));
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d ? date : null;
};

const toDigits = (date: Date): string => toDateString(date).replace(/-/g, '');

/**
 * 바라봄 DatePickerNativeModal(mode='date') — 제목 옆 "선택 / 입력" 세그먼트, 휠 피커 또는 숫자 입력, 확인 버튼.
 * showBottomSheet({ options: { height: 'auto' } }) 안에 넣어 쓴다.
 */
export default function DatePickerSheet({ initialDate, onConfirm }: Props) {
  const { palette, typography } = useTheme();
  const [interactionMode, setInteractionMode] = useState<InteractionMode>(lastInteractionMode);
  const [date, setDate] = useState<Date>(() => fromDateString(initialDate));
  const [inputDate, setInputDate] = useState<string>(() => initialDate.replace(/-/g, ''));
  const [errorMessage, setErrorMessage] = useState('');

  const modeLabel = interactionMode === 'input' ? '입력' : '선택';
  // 휠 글꼴은 앱 본문과 같게 — RN 텍스트라 fontFamily 이름으로 충분하다
  const fontFamily = useMemo(() => (StyleSheet.flatten(typography.body[2]) as TextStyle | undefined)?.fontFamily, [typography]);

  const handleModeChange = useCallback(
    (index: number) => {
      if (index === 0) {
        // 입력 → 선택: 유효한 입력이면 휠 위치를 맞춰 준다
        const parsed = parseDateDigits(inputDate);
        if (parsed) setDate(parsed);
        setInteractionMode('select');
        setErrorMessage('');
      } else {
        setInputDate(toDigits(date));
        setInteractionMode('input');
      }
      lastInteractionMode = index === 0 ? 'select' : 'input';
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
      <Pressable style={styles.titleBox} onPress={Keyboard.dismiss}>
        <ZSText allowFontScaling={false} typo="heading.5" color="secondary" style={styles.title}>
          {`날짜 ${modeLabel}`}
        </ZSText>
        <ZSSegmented
          options={['선택', '입력']}
          fullWidth={false}
          containerHeight={32}
          initialIndex={interactionMode === 'input' ? 1 : 0}
          onChange={handleModeChange}
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
            backgroundColor={palette.background.base as HexColor}
            activeFontColor={palette.text.base as HexColor}
            disableFontColor={palette.text.disabled}
          />
        </View>
      ) : (
        <Pressable style={styles.inputContainer} onPress={Keyboard.dismiss}>
          <View style={[styles.inputBox, { borderColor: errorMessage ? palette.danger.main : palette.grey[40] }]}>
            <TextInput
              allowFontScaling={false}
              style={[styles.input, { color: palette.text.base, fontFamily }]}
              placeholder="YYYYMMDD"
              maxLength={8}
              placeholderTextColor={palette.text.disabled}
              keyboardType="number-pad"
              // 탭하면 전체 선택 — 가운데에 커서가 놓여 숫자가 뒤섞이는 일을 막는다
              selectTextOnFocus
              value={inputDate}
              onChangeText={handleInputChange}
              testID="date-picker-input"
            />
          </View>
          <ZSText allowFontScaling={false} typo="label.4" color="secondary" style={styles.hint}>
            날짜는 숫자 8자리로 입력해주세요. (예: 20261015)
          </ZSText>
        </Pressable>
      )}

      {!!errorMessage && (
        <ZSText typo="caption.2" style={[styles.error, { color: palette.danger.main }]} testID="date-picker-error">
          {errorMessage}
        </ZSText>
      )}

      <ZSPressable
        onPress={handleConfirm}
        fullWidth
        pressedBackgroundColor="transparent"
        accessibilityRole="button"
        accessibilityLabel="확인"
        testID="date-picker-confirm"
        style={[styles.confirm, { backgroundColor: errorMessage ? palette.primary.lighter : palette.primary.main }]}
      >
        <ZSText typo="subTitle.1" color="white">확인</ZSText>
      </ZSPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  titleBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  title: { marginTop: 5, paddingLeft: 5, paddingBottom: 5 },
  pickerContainer: { width: '100%', alignItems: 'center', justifyContent: 'center' },
  inputContainer: { width: '100%', alignItems: 'center', gap: 5, marginTop: 5 },
  inputBox: { width: '100%', height: 80, borderWidth: 1, borderRadius: 14, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 10, marginTop: 5 },
  input: { fontSize: 20, width: '100%', height: '100%', textAlign: 'center', letterSpacing: 4 },
  hint: { width: '100%', paddingLeft: 10 },
  error: { paddingLeft: 10, marginTop: 8 },
  confirm: { marginTop: 20, marginBottom: 5, paddingVertical: 13, borderRadius: 12, alignItems: 'center', justifyContent: 'center', width: '100%' },
});
