import { useEffect, useMemo, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { OPACITY, ZSButton, ZSPressable, ZSScreen, ZSText, ZSTextField, radiusStyle, useOverlay, useTheme, withOpacity } from '@0610studio/zs-ui';
import Section from '../../src/ui/kit/Section';
import { GAP, MODAL_MAX_WIDTH, PAGE_INSET, ROW_HEIGHT, ROW_INSET } from '../../src/ui/kit/layout';
import ModalHeader from '../../src/ui/diary/ModalHeader';
import SearchIcon from '../../src/ui/diary/SearchIcon';
import { resolvePick } from '../../src/model/diary/pickBridge';
import { sanitizeDecimal } from '../../src/model/diary/common';
import { MEDICAL_TEST_TEXT, MEDICAL_UNITS, validateMedicalTest } from '../../src/model/diary/medical';

/** 이 앱 실행 동안 최근에 고른 단위(바라봄은 기기에 저장) */
const recentUnits: string[] = [];

/** 눌러서 다른 쪽으로 가는 칸 — 입력 칸 모양 그대로, 라벨이 위 테두리에 떠도 잘리지 않게 감싸는 쪽을 자르지 않는다 */
function FieldButton({ label, value, onPress, testID }: { label: string; value: string; onPress: () => void; testID: string }) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} unstable_pressDelay={130} accessibilityRole="button" accessibilityLabel={[label, value].filter(Boolean).join(', ')} testID={testID}>
      {({ pressed }) => (
        <View pointerEvents="none">
          <ZSTextField label={label} value={value} />
          {pressed ? <View style={[StyleSheet.absoluteFill, radiusStyle('lg'), { backgroundColor: withOpacity(colors.text, OPACITY.pressed) }]} /> : null}
        </View>
      )}
    </Pressable>
  );
}

/** 단위 고르기 쪽 — 찾기 + 최근 검색 + 목록, 없으면 입력한 글자로 직접 등록 */
function UnitPicker({ onPick }: { onPick: (unit: string) => void }) {
  const { colors } = useTheme();
  const { showAlert } = useOverlay();
  const [query, setQuery] = useState('');
  const keyword = query.trim().toLowerCase();
  const units = useMemo(() => MEDICAL_UNITS.filter((unit) => unit.toLowerCase().includes(keyword)), [keyword]);
  const showRecent = !keyword && recentUnits.length > 0;

  const register = () => {
    const value = query.trim();
    if (!value) {
      showAlert({ title: MEDICAL_TEST_TEXT.unitRequired, confirm: { label: '확인' } });
      return;
    }
    onPick(value);
  };

  const rows = (list: string[], prefix: string) =>
    list.map((unit) => (
      <ZSPressable key={`${prefix}-${unit}`} onPress={() => onPick(unit)} accessibilityRole="button" testID={`unit-${prefix}-${unit}`} style={styles.pressable}>
        <View style={styles.row}>
          <ZSText variant="body1">{unit}</ZSText>
        </View>
      </ZSPressable>
    ));

  return (
    <>
      <ZSTextField label={MEDICAL_TEST_TEXT.unitSearch} value={query} onChangeText={setQuery} startAdornment={<SearchIcon color={colors.textSecondary} />} testID="unit-search" />
      {showRecent ? (
        <Section label={MEDICAL_TEST_TEXT.recent} surface="list">
          {rows(recentUnits, 'recent')}
        </Section>
      ) : null}
      {units.length > 0 ? (
        <Section label={showRecent ? MEDICAL_TEST_TEXT.list : undefined} surface="list">
          {rows(units, 'all')}
        </Section>
      ) : (
        <View style={styles.empty}>
          <ZSText variant="subtitle1" emphasized>
            {MEDICAL_TEST_TEXT.unitEmptyTitle}
          </ZSText>
          <ZSText variant="body2" color="textSecondary">
            {MEDICAL_TEST_TEXT.unitEmptyDescription}
          </ZSText>
          <ZSButton title={MEDICAL_TEST_TEXT.unitRegister(query.trim())} variant="tonal" color="neutral" onPress={register} testID="unit-register" />
        </View>
      )}
    </>
  );
}

/** 병원 › 검사 결과 추가 — 검사 이름·측정 값·단위·정상 범위(바라봄 MedicalTestInput). 전체 높이 모달 */
export default function MedicalTestScreen() {
  const { showSnackbar } = useOverlay();
  const [page, setPage] = useState<'form' | 'unit'>('form');
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('');
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');

  // 단위 쪽에서 Android 뒤로가기는 입력 쪽으로 돌아간다
  useEffect(() => {
    if (page !== 'unit') return undefined;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setPage('form');
      return true;
    });
    return () => subscription.remove();
  }, [page]);

  const save = () => {
    const test = { name: name.trim(), value, unit, min, max };
    const error = validateMedicalTest(test);
    if (error) {
      showSnackbar({ message: error, type: 'error' });
      return;
    }
    router.back();
    resolvePick(JSON.stringify(test));
  };

  if (page === 'unit') {
    return (
      <>
        <ModalHeader title={MEDICAL_TEST_TEXT.unit} leading={{ kind: 'back', onPress: () => setPage('form') }} />
        <ZSScreen backgroundColor="background" maxContentWidth={MODAL_MAX_WIDTH} style={styles.container}>
          <UnitPicker
            onPick={(picked) => {
              const index = recentUnits.indexOf(picked);
              if (index >= 0) recentUnits.splice(index, 1);
              recentUnits.unshift(picked);
              setUnit(picked);
              setPage('form');
            }}
          />
        </ZSScreen>
      </>
    );
  }

  return (
    <>
      <ModalHeader title="검사 결과" leading={{ kind: 'close', onPress: () => router.back() }} action={{ title: '저장', onPress: save, testID: 'medical-test-save' }} />
      <ZSScreen backgroundColor="background" maxContentWidth={MODAL_MAX_WIDTH} style={styles.container}>
        <Section label={MEDICAL_TEST_TEXT.info} surface="plain" gap={GAP.md}>
          <ZSTextField label={MEDICAL_TEST_TEXT.name} value={name} onChangeText={setName} testID="medical-test-name" />
          <View style={styles.pair}>
            <View style={styles.valueField}>
              <ZSTextField label={MEDICAL_TEST_TEXT.value} value={value} onChangeText={(text) => setValue(sanitizeDecimal(text))} keyboardType="decimal-pad" testID="medical-test-value" />
            </View>
            <View style={styles.unitField}>
              <FieldButton label={MEDICAL_TEST_TEXT.unit} value={unit} onPress={() => setPage('unit')} testID="medical-test-unit" />
            </View>
          </View>
        </Section>
        <Section label={MEDICAL_TEST_TEXT.range} surface="plain" gap={GAP.md}>
          <View style={styles.pair}>
            <View style={styles.half}>
              <ZSTextField label={MEDICAL_TEST_TEXT.min} value={min} onChangeText={(text) => setMin(sanitizeDecimal(text))} keyboardType="decimal-pad" testID="medical-test-min" />
            </View>
            <ZSText variant="subtitle1" color="textSecondary" style={styles.tilde}>
              ~
            </ZSText>
            <View style={styles.half}>
              <ZSTextField label={MEDICAL_TEST_TEXT.max} value={max} onChangeText={(text) => setMax(sanitizeDecimal(text))} keyboardType="decimal-pad" testID="medical-test-max" />
            </View>
          </View>
        </Section>
      </ZSScreen>
    </>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: PAGE_INSET, paddingTop: GAP.lg, paddingBottom: GAP['3xl'] * 2, gap: GAP['2xl'] },
  pair: { flexDirection: 'row', alignItems: 'flex-start', gap: GAP.sm },
  valueField: { flexGrow: 3, flexShrink: 1, flexBasis: 0 },
  unitField: { flexGrow: 2, flexShrink: 1, flexBasis: 0 },
  half: { flexGrow: 1, flexShrink: 1, flexBasis: 0 },
  tilde: { marginTop: GAP.lg },
  pressable: { marginHorizontal: -ROW_INSET, paddingHorizontal: ROW_INSET },
  row: { width: '100%', minHeight: ROW_HEIGHT.single, justifyContent: 'center', paddingVertical: GAP.md },
  empty: { alignItems: 'center', gap: GAP.sm, paddingVertical: GAP['3xl'] },
});
