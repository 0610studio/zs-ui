import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView } from 'expo-symbols';
import Svg, { Path } from 'react-native-svg';
import { ZSButton, ZSRadioGroup, ZSScreen, ZSText, ZSTextField, useTheme } from '@0610studio/zs-ui';
import Section from '../../src/ui/kit/Section';
import { GAP, MODAL_MAX_WIDTH, PAGE_INSET } from '../../src/ui/kit/layout';
import { UNKNOWN_BREED, fetchBreeds, type PetBreed } from '../../src/model/petRegister';

const SEARCH_PATH =
  'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z';

function SearchIcon({ color }: { color: string }) {
  if (Platform.OS === 'android') {
    return (
      <Svg width={20} height={20} viewBox="0 0 24 24">
        <Path d={SEARCH_PATH} fill={color} />
      </Svg>
    );
  }
  return <SymbolView name="magnifyingglass" tintColor={color} size={20} />;
}

/**
 * 품종 고르기 — 반려동물 등록에서 여는 모달 화면(presentation 'modal'). 목록이 길어 바텀시트 대신 전체 높이로 띄운다.
 * 서버(목)에서 받은 목록을 이름으로 찾고 하나를 고른다. '모름'은 늘 맨 위에 있다. 고른 품종은 dismissTo 의 params 로 등록 화면에 돌려준다.
 */
export default function BreedPicker() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ type?: string; selected?: string }>();
  const petType = params.type === 'cat' ? 'cat' : 'dog';
  const [breeds, setBreeds] = useState<PetBreed[] | null>(null);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(params.selected ? Number(params.selected) : null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    setFailed(false);
    fetchBreeds(petType)
      .then((list) => {
        if (alive) setBreeds(list);
      })
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, [petType, attempt]);

  const options = useMemo(() => {
    const keyword = query.trim();
    const matched = (breeds ?? []).filter((breed) => breed.name.includes(keyword));
    return [UNKNOWN_BREED, ...matched].map((breed) => ({ value: breed.id, label: breed.name }));
  }, [breeds, query]);

  const confirm = () => {
    const breed = [UNKNOWN_BREED, ...(breeds ?? [])].find((item) => item.id === selectedId) ?? UNKNOWN_BREED;
    router.dismissTo({ pathname: '/friends/register', params: { breedId: String(breed.id), breedName: breed.name } });
  };

  return (
    <>
      <Stack.Screen options={{ title: petType === 'dog' ? '강아지 품종' : '고양이 품종' }} />
      {/* iOS 모달은 뒤로 버튼이 없어 닫기를 둔다. Android 앱 바에는 뒤로 버튼이 있다 */}
      {Platform.OS === 'ios' ? (
        <Stack.Toolbar placement="left">
          <Stack.Toolbar.Button icon="xmark" accessibilityLabel="닫기" onPress={() => router.back()}>
            닫기
          </Stack.Toolbar.Button>
        </Stack.Toolbar>
      ) : null}
      <ZSScreen
        backgroundColor="background"
        maxContentWidth={MODAL_MAX_WIDTH}
        style={styles.container}
        bottomComponent={
          <View style={[styles.dock, { backgroundColor: colors.background }]}>
            <LinearGradient pointerEvents="none" colors={[`${colors.background}00`, colors.background]} style={styles.dockFade} />
            <ZSButton title="확인" size="large" fullWidth onPress={confirm} disabled={breeds === null} testID="register-breed-confirm" />
          </View>
        }
      >
        <ZSTextField
          label="품종 찾기"
          placeholder="이름으로 찾기"
          value={query}
          onChangeText={setQuery}
          startAdornment={<SearchIcon color={colors.textSecondary} />}
          returnKeyType="search"
          testID="register-breed-search"
        />
        {failed ? (
          <View style={styles.status}>
            <ZSText variant="body2" color="textSecondary">
              품종을 불러오지 못했어요
            </ZSText>
            <ZSButton title="다시 시도" variant="tonal" color="neutral" size="small" onPress={() => setAttempt((n) => n + 1)} />
          </View>
        ) : breeds === null ? (
          <View style={styles.status}>
            <ActivityIndicator color={colors.textSecondary} />
            <ZSText variant="body2" color="textSecondary">
              품종을 불러오는 중이에요
            </ZSText>
          </View>
        ) : (
          <View style={styles.list}>
            <Section surface="group" gap={0}>
              <ZSRadioGroup options={options} value={selectedId} onValueChange={(id) => setSelectedId(id)} accessibilityLabel="품종" testID="register-breed" />
            </Section>
            {options.length === 1 && query ? (
              <ZSText variant="body2" color="textSecondary">
                {`'${query}' 품종이 없어요. 모를 때는 '모름'을 고르세요`}
              </ZSText>
            ) : null}
          </View>
        )}
      </ZSScreen>
    </>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: PAGE_INSET, paddingTop: GAP.lg, paddingBottom: GAP['3xl'], gap: GAP.xl },
  status: { alignItems: 'center', justifyContent: 'center', gap: GAP.sm, paddingVertical: GAP['3xl'] * 2 },
  list: { gap: GAP.md },
  // 버튼 독 — 반려동물 등록 화면과 같은 모양(스크롤되는 내용이 독 위로 바탕색으로 사라진다)
  dock: { width: '100%', paddingHorizontal: PAGE_INSET, paddingTop: GAP.md, paddingBottom: GAP.sm },
  dockFade: { position: 'absolute', left: 0, right: 0, top: -GAP.xl, height: GAP.xl },
});
