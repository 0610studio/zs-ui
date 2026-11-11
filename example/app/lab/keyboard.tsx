import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Keyboard, ScrollView, StyleSheet, TextInput, View, type HostInstance } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ZSKeyboardStickyView, ZSChip, ZSScreen, ZSText, ZSTextField, useHeaderInset, useTheme, type ZSTextFieldRef } from '@0610studio/zs-ui';
import CtaButton from '../../src/ui/CtaButton';
import ScreenHeader from '../../src/ui/ScreenHeader';
import { EndMarker, LiveSize } from '../../src/ui/lab/FoldableLab';

type Mode = 'zs' | 'rn';

const FIELDS = [1, 2, 3, 4, 5, 6];
const EXTRA_OFFSET = 16;
const MEASURE_DELAY = 700;

export default function LabKeyboard() {
  const { colors } = useTheme();
  const [mode, setMode] = useState<Mode>('zs');
  const [secure, setSecure] = useState(false);
  const [values, setValues] = useState<Record<number, string>>({});
  const measureTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [ctaHeight, setCtaHeight] = useState(0);
  const ctaRef = useRef<HostInstance>(null);
  const [report, setReport] = useState('gap -');

  const measure = useCallback(() => {
    if (measureTimer.current) clearTimeout(measureTimer.current);
    measureTimer.current = setTimeout(() => {
      const input = TextInput.State.currentlyFocusedInput();
      if (!input || !ctaRef.current) return;
      input.measureInWindow((_x, inputY, _w, inputHeight) => {
        ctaRef.current?.measureInWindow((_cx, ctaY) => {
          setReport(`gap ${Math.round(ctaY - (inputY + inputHeight))}`);
        });
      });
    }, MEASURE_DELAY);
  }, []);

  useEffect(() => {
    const subscription = Keyboard.addListener('keyboardDidShow', measure);
    return () => {
      subscription.remove();
      if (measureTimer.current) clearTimeout(measureTimer.current);
    };
  }, [measure]);

  const cta = (
    <ZSKeyboardStickyView>
      <View ref={ctaRef} testID="lab-keyboard-cta" onLayout={(event) => setCtaHeight(event.nativeEvent.layout.height)}>
        <CtaButton disabled={false} primaryButtonText="CTA 버튼" onPrimaryButtonPress={Keyboard.dismiss} />
      </View>
    </ZSKeyboardStickyView>
  );

  const header = (
    <View style={[styles.header, { backgroundColor: colors.surface2 }]}>
      <LiveSize padded={false} />
      <View style={styles.modes}>
        <ZSChip label="ZSScreen" selected={mode === 'zs'} onSelectedChange={() => setMode('zs')} testID="lab-keyboard-mode-zs" />
        <ZSChip label="RN ScrollView" selected={mode === 'rn'} onSelectedChange={() => setMode('rn')} testID="lab-keyboard-mode-rn" />
        <ZSChip label="보안 입력" selected={secure} onSelectedChange={() => setSecure(!secure)} testID="lab-keyboard-secure" />
      </View>
      <ZSText variant="label" color="textSecondary" testID="lab-keyboard-gap">{`${mode} · ${report}`}</ZSText>
    </View>
  );

  const content = (
    <View style={styles.content}>
      <Fields secure={secure} onFocus={measure} values={values} onChange={(field, text) => setValues((prev) => ({ ...prev, [field]: text }))} />
      <EndMarker testID="lab-keyboard-end" label="마지막 입력과 고정 버튼이 키보드 위에 보여야 합니다." />
      <View style={{ height: ctaHeight }} />
    </View>
  );

  return (
    <>
      <ScreenHeader title="Keyboard" />
      {mode === 'zs' ? (
        <ZSScreen backgroundColor="surface1" keyboardScrollExtraOffset={ctaHeight + EXTRA_OFFSET} topComponent={header} bottomComponent={cta}>
          {content}
        </ZSScreen>
      ) : (
        <RNKeyboardScreen background={colors.surface1} top={header} bottom={cta}>
          {content}
        </RNKeyboardScreen>
      )}
    </>
  );
}

// 비교용 — 헤더 아래 자리만 ZSScreen 처럼 비우고, 키보드는 RN ScrollView 기본 동작에 맡긴다
function RNKeyboardScreen({ children, top, bottom, background }: { children: ReactNode; top: ReactNode; bottom: ReactNode; background: string }) {
  const headerInset = useHeaderInset();
  return (
    <View style={[styles.flex, { backgroundColor: background, paddingTop: headerInset }]}>
      {top}
      <ScrollView style={styles.flex} automaticallyAdjustKeyboardInsets keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
      <SafeAreaView edges={['bottom']}>
        <View>{bottom}</View>
      </SafeAreaView>
    </View>
  );
}

function Fields({ secure, onFocus, values, onChange }: { secure: boolean; onFocus: () => void; values: Record<number, string>; onChange: (field: number, text: string) => void }) {
  const refs = useRef<(ZSTextFieldRef | null)[]>([]);

  return (
    <View style={styles.fields}>
      {FIELDS.map((field, index) => (
        <ZSTextField
          key={field}
          ref={(instance) => { refs.current[index] = instance; }}
          label={`필드 ${field} · ${['아이디', secure ? '비밀번호' : '일반 입력', secure ? '비밀번호 확인' : '확인 입력', '이름', '숫자', '하단 메모'][index]}`}
          errorText={field === 1 && !!values[1] && values[1].length < 4 ? '아이디는 4자 이상 입력하세요.' : undefined}
          autoComplete={secure && (field === 2 || field === 3) ? 'current-password' : 'off'}
          textContentType={secure && (field === 2 || field === 3) ? 'password' : 'none'}
          autoCorrect={false}
          secureTextEntry={secure && (field === 2 || field === 3)}
          keyboardType={field === 5 ? 'number-pad' : 'default'}
          value={values[field] ?? ''}
          onChangeText={(text) => onChange(field, text)}
          testID={`lab-keyboard-field-${field}`}
          returnKeyType={index < FIELDS.length - 1 ? 'next' : 'done'}
          submitBehavior={index < FIELDS.length - 1 ? 'submit' : 'blurAndSubmit'}
          onSubmitEditing={() => refs.current[index + 1]?.focus()}
          onFocus={onFocus}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 6,
  },
  content: {
    width: '100%',
    padding: 20,
  },
  modes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  fields: {
    gap: 110,
  },
});
