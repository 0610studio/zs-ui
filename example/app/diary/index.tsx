import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ZSButton, ZSScreen, ZSText, useOverlay, useTheme } from '@0610studio/zs-ui';
import RecipeHeader from '../../src/ui/recipe/RecipeHeader';
import Section from '../../src/ui/kit/Section';
import { usePageInset } from '../../src/ui/kit/SplitColumns';
import { GAP, ROW_INSET } from '../../src/ui/kit/layout';
import CategorySheet, { CATEGORY_SHEET_TITLE, CategoryHelpButton } from '../../src/ui/diary/CategorySheet';
import RecordListRow, { RECORD_ICON } from '../../src/ui/diary/detail/RecordListRow';
import { DIARY_SCREENS } from '../../src/ui/diary/screens';
import { CATEGORY_GUIDE, type DiaryCategoryCode } from '../../src/model/diary/categories';
import { DETAIL_TEXT } from '../../src/model/diary/detail';
import { listRecords } from '../../src/model/diary/records';

/** 시트가 닫히는 전환을 기다렸다가 다음 화면으로 간다(바라봄 300ms) */
const AFTER_SHEET = 300;

/**
 * 화면 레시피 · 건강수첩 기록 — 바라봄 '기록할 수첩 선택' → 분류 작성 화면. 수첩 설명은 (?) 또는 아래 글자 버튼.
 * 산책은 '어떻게 기록할까요?'를 거친다. 아래 '지난 기록'은 기록 상세(읽기 전용)로 간다.
 */
export default function DiaryHome() {
  const { colors } = useTheme();
  const inset = usePageInset();
  const { showBottomSheet, hideBottomSheet, showSnackbar } = useOverlay();
  // 상세에서 지우거나 숨기고 돌아오면 목록을 다시 읽는다
  const [records, setRecords] = useState(listRecords);
  const refresh = useCallback(() => setRecords(listRecords()), []);
  useFocusEffect(refresh);

  const openGuide = () => router.push('/diary/guide');

  const pick = (code: DiaryCategoryCode) => {
    hideBottomSheet();
    setTimeout(() => {
      if (code === 'walk' && DIARY_SCREENS.walk) router.push('/diary/walk');
      else if (DIARY_SCREENS[code]) router.push({ pathname: '/diary/write/[category]', params: { category: code } });
      else showSnackbar({ message: '준비 중인 수첩이에요' });
    }, AFTER_SHEET);
  };

  const openSelect = () =>
    showBottomSheet({
      header: CATEGORY_SHEET_TITLE,
      headerRight: (
        <CategoryHelpButton
          onPress={() => {
            hideBottomSheet();
            setTimeout(openGuide, AFTER_SHEET);
          }}
        />
      ),
      component: <CategorySheet onPick={pick} />,
    });

  const hero = (
    <>
      <View style={styles.hero}>
        <ZSText variant="h2" emphasized accessibilityRole="header">
          {CATEGORY_GUIDE.heroTitle}
        </ZSText>
        <ZSText variant="body1" color="textSecondary">
          {CATEGORY_GUIDE.heroDescription}
        </ZSText>
      </View>
      <ZSButton title="어떤 수첩이 있는지 보기" variant="tonal" color="neutral" onPress={openGuide} style={styles.guide} testID="diary-guide" />
    </>
  );

  const openRecord = (id: string) => router.push({ pathname: '/diary/record/[id]', params: { id } });
  const recordList =
    records.length > 0 ? (
      <Section label={DETAIL_TEXT.listTitle} surface="list" ruleInset={ROW_INSET + RECORD_ICON + GAP.md}>
        {records.map((record) => (
          <RecordListRow key={record.id} record={record} onPress={() => openRecord(record.id)} />
        ))}
      </Section>
    ) : null;

  const dock = (
    <View style={[styles.dock, { backgroundColor: colors.background, paddingHorizontal: inset }]}>
      <LinearGradient pointerEvents="none" colors={[`${colors.background}00`, colors.background]} style={styles.dockFade} />
      <ZSButton title="기록하기" size="large" fullWidth onPress={openSelect} testID="diary-write" />
    </View>
  );

  return (
    <>
      <RecipeHeader title="건강수첩" />
      <ZSScreen backgroundColor="background" style={[styles.container, { paddingHorizontal: inset }]} bottomComponent={dock}>
        {hero}
        {recordList}
      </ZSScreen>
    </>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: GAP['2xl'], paddingBottom: GAP['3xl'], gap: GAP['2xl'] },
  hero: { gap: GAP.md },
  guide: { alignSelf: 'flex-start' },
  dock: { width: '100%', paddingTop: GAP.md, paddingBottom: GAP.sm },
  dockFade: { position: 'absolute', left: 0, right: 0, top: -GAP.xl, height: GAP.xl },
});
