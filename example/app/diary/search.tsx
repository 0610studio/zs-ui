import { useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ZSButton, ZSPressable, ZSScreen, ZSText, ZSTextField, useTheme, type ZSTextFieldRef } from '@0610studio/zs-ui';
import Section from '../../src/ui/kit/Section';
import { GAP, MODAL_MAX_WIDTH, PAGE_INSET, ROW_HEIGHT, ROW_INSET } from '../../src/ui/kit/layout';
import ModalHeader from '../../src/ui/diary/ModalHeader';
import SearchIcon from '../../src/ui/diary/SearchIcon';
import { resolvePick } from '../../src/model/diary/pickBridge';
import { SEARCH_SOURCES, SEARCH_TEXT, encodePicked, filterOptions, type SearchKind } from '../../src/model/diary/search';

/**
 * 건강수첩 검색 목록 — 증상·진료 과목을 이름으로 찾아 고른다(바라봄 SearchList). 전체 높이 모달.
 * 고르면 작성 화면에 돌려주고 닫힌다. 결과가 없으면 '기타'로 등록하는 버튼. 진료 과목은 '기타 (직접입력)'에서 이름을 직접 적는다.
 */
export default function DiarySearch() {
  const { colors } = useTheme();
  const { kind } = useLocalSearchParams<{ kind?: string }>();
  const source = SEARCH_SOURCES[(kind ?? 'symptom') as SearchKind] ?? SEARCH_SOURCES.symptom;
  const [query, setQuery] = useState('');
  const [customMode, setCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const items = useMemo(() => filterOptions(source.items, query), [source, query]);
  const customRef = useRef<ZSTextFieldRef>(null);

  // 직접 입력 쪽이 보인 뒤 100ms 에 입력 칸에 포커스(바라봄과 같음) — 쪽이 바뀌는 같은 프레임의 autoFocus 는 먹지 않았다
  useEffect(() => {
    if (!customMode) return undefined;
    const timer = setTimeout(() => customRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, [customMode]);

  // 직접 입력 쪽에서 Android 뒤로가기는 목록으로 돌아간다(바라봄 '뒤로')
  useEffect(() => {
    if (!customMode) return undefined;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setCustomMode(false);
      return true;
    });
    return () => subscription.remove();
  }, [customMode]);

  const finish = (code: string, name: string) => {
    router.back();
    resolvePick(encodePicked(source, code, name));
  };

  const pick = (code: string, name: string) => {
    if (source.custom && code === source.custom.code) setCustomMode(true);
    else finish(code, name);
  };

  if (customMode && source.custom) {
    const custom = source.custom;
    const saveCustom = () => finish(custom.code, customName.trim() || custom.fallbackName);
    return (
      <>
        <ModalHeader title={source.title} leading={{ kind: 'back', onPress: () => setCustomMode(false) }} action={{ title: '저장', onPress: saveCustom, testID: 'diary-search-custom-save' }} />
        <ZSScreen backgroundColor="background" maxContentWidth={MODAL_MAX_WIDTH} style={styles.container}>
          <ZSTextField
            ref={customRef}
            label={custom.label}
            value={customName}
            onChangeText={setCustomName}
            helperText={custom.hint}
            returnKeyType="done"
            onSubmitEditing={saveCustom}
            testID="diary-search-custom"
          />
        </ZSScreen>
      </>
    );
  }

  return (
    <>
      <ModalHeader title={source.title} leading={{ kind: 'close', onPress: () => router.back() }} />
      <ZSScreen backgroundColor="background" maxContentWidth={MODAL_MAX_WIDTH} style={styles.container}>
        <ZSTextField
          label={SEARCH_TEXT.input}
          value={query}
          onChangeText={setQuery}
          startAdornment={<SearchIcon color={colors.textSecondary} />}
          returnKeyType="search"
          testID="diary-search-input"
        />
        {items.length > 0 ? (
          <Section surface="list">
            {items.map((item) => (
              <ZSPressable key={item.code} onPress={() => pick(item.code, item.label)} accessibilityRole="button" testID={`diary-search-${item.code}`} style={styles.pressable}>
                <View style={styles.row}>
                  <ZSText variant="body1" style={styles.label}>
                    {item.label}
                  </ZSText>
                </View>
              </ZSPressable>
            ))}
          </Section>
        ) : (
          <View style={styles.empty}>
            <ZSText variant="subtitle1" emphasized>
              {SEARCH_TEXT.emptyTitle}
            </ZSText>
            <ZSText variant="body2" color="textSecondary" style={styles.center}>
              {source.emptyDescription}
            </ZSText>
            <ZSButton title={source.fallback.buttonLabel} variant="tonal" color="neutral" onPress={() => pick(source.fallback.code, '')} testID="diary-search-fallback" />
          </View>
        )}
      </ZSScreen>
    </>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: PAGE_INSET, paddingTop: GAP.lg, paddingBottom: GAP['3xl'] * 2, gap: GAP.xl },
  pressable: { marginHorizontal: -ROW_INSET, paddingHorizontal: ROW_INSET },
  row: { width: '100%', minHeight: ROW_HEIGHT.single, justifyContent: 'center', paddingVertical: GAP.md },
  label: { flexShrink: 1 },
  empty: { alignItems: 'center', gap: GAP.sm, paddingVertical: GAP['3xl'] },
  center: { textAlign: 'center' },
});
