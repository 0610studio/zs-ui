import { useEffect, useMemo, useState } from 'react';
import { BackHandler, Image, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { ZSBox, ZSButton, ZSPressable, ZSScreen, ZSText, ZSTextField, radiusStyle, useOverlay, useTheme } from '@0610studio/zs-ui';
import Section from '../../src/ui/kit/Section';
import { GAP, MODAL_MAX_WIDTH, PAGE_INSET, ROW_INSET } from '../../src/ui/kit/layout';
import ModalHeader from '../../src/ui/diary/ModalHeader';
import PetBubble from '../../src/ui/diary/PetBubble';
import SearchIcon from '../../src/ui/diary/SearchIcon';
import { resolvePick } from '../../src/model/diary/pickBridge';
import { NOT_IN_EXAMPLE_MESSAGE, sanitizeDecimal } from '../../src/model/diary/common';
import { FEED_LIST_TEXT, FOODS, RECENT_FOOD_UIDS, entryKcal, kcalPer10g, kcalPer100g, nutritionTags, parseGram, searchFoods, type FoodItem } from '../../src/model/diary/feed';

const FOOD_IMAGE = require('../../assets/barabom/feed/default_food.png');

/** 이 앱 실행 동안 최근에 고른 사료(바라봄은 서버 기록) */
const recentFoods: number[] = [...RECENT_FOOD_UIDS];

function FoodThumb({ size }: { size: number }) {
  return (
    <ZSBox backgroundColor="surface2" style={[styles.thumb, radiusStyle('md'), { width: size, height: size }]}>
      <Image source={FOOD_IMAGE} style={{ width: size * 0.8, height: size * 0.8 }} resizeMode="contain" />
    </ZSBox>
  );
}

/** "[브랜드]" — 검색어와 겹치는 글자를 강조(바라봄 FoodListItem) */
function BrandText({ brand, query }: { brand: string; query: string }) {
  const keyword = query.trim();
  const at = keyword ? brand.toLowerCase().indexOf(keyword.toLowerCase()) : -1;
  if (at < 0) {
    return (
      <ZSText variant="caption" color="textSecondary">
        {`[${brand}]`}
      </ZSText>
    );
  }
  return (
    <ZSText variant="caption" color="textSecondary">
      {`[${brand.slice(0, at)}`}
      <ZSText variant="caption" emphasized color="primary">
        {brand.slice(at, at + keyword.length)}
      </ZSText>
      {`${brand.slice(at + keyword.length)}]`}
    </ZSText>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <ZSBox backgroundColor="surface3" style={[styles.badge, radiusStyle('full')]}>
      <ZSText variant="caption" emphasized color="textSecondary">
        {label}
      </ZSText>
    </ZSBox>
  );
}

function FoodRow({ food, query, onPress, testID }: { food: FoodItem; query: string; onPress: () => void; testID: string }) {
  const badge = food.register === 'OWNER' ? FEED_LIST_TEXT.ownerBadge : food.register === 'SHARED' ? FEED_LIST_TEXT.sharedBadge : null;
  return (
    <ZSPressable onPress={onPress} accessibilityRole="button" accessibilityLabel={[food.brand, food.name, badge].filter(Boolean).join(', ')} testID={testID} style={styles.pressable}>
      <View style={styles.row}>
        <FoodThumb size={50} />
        <View style={styles.rowText}>
          {food.brand ? <BrandText brand={food.brand} query={query} /> : null}
          <ZSText variant="subtitle1">{food.name}</ZSText>
        </View>
        {badge ? <Badge label={badge} /> : null}
      </View>
    </ZSPressable>
  );
}

/** 고른 사료 — 사진·브랜드·이름·10g당 칼로리·영양 태그 + 급여 무게, 캐릭터가 칼로리를 알려 준다 */
function FoodDetail({ food, gram, onGram }: { food: FoodItem; gram: string; onGram: (text: string) => void }) {
  const per10 = kcalPer10g(food);
  const known = kcalPer100g(food) !== null;
  const grams = parseGram(gram) ?? 0;
  const kcal = entryKcal(food, grams);
  const message = !known ? FEED_LIST_TEXT.noKcalCalculation : grams > 0 && kcal !== null ? FEED_LIST_TEXT.feedKcal(Math.round(kcal * 10) / 10) : FEED_LIST_TEXT.weightRequired;
  return (
    <>
      <View style={styles.detailHead}>
        <FoodThumb size={70} />
        <View style={styles.rowText}>
          <ZSText variant="caption" color="textSecondary">{`[${food.brand ?? FEED_LIST_TEXT.customRegistered}]`}</ZSText>
          <ZSText variant="subtitle1" emphasized>
            {food.name}
          </ZSText>
          <ZSText variant="body2" color="textSecondary" testID="feed-food-kcal10">
            {FEED_LIST_TEXT.kcalPer10g}
            {per10 !== null ? (
              <ZSText variant="body2" emphasized color="primary">
                {`${per10}kcal`}
              </ZSText>
            ) : (
              FEED_LIST_TEXT.noKcalInfo
            )}
          </ZSText>
        </View>
      </View>
      {nutritionTags(food).length > 0 ? (
        <View style={styles.tags}>
          {nutritionTags(food).map((tag) => (
            <Badge key={tag} label={tag} />
          ))}
        </View>
      ) : null}
      <ZSTextField
        label={FEED_LIST_TEXT.weightLabel}
        value={gram}
        onChangeText={(text) => onGram(sanitizeDecimal(text))}
        keyboardType="decimal-pad"
        maxLength={7}
        endAdornment={
          <ZSText variant="body1" color="textSecondary">
            g
          </ZSText>
        }
        testID="feed-food-gram"
      />
      <PetBubble testID="feed-food-bubble">
        <ZSText variant="body2">{message}</ZSText>
      </PetBubble>
    </>
  );
}

/** 급여 › 급여 제품 추가 — 찾기(최근 검색·사료 목록) → 고른 사료의 급여 무게. 전체 높이 모달(바라봄 FeedList) */
export default function FeedFoodScreen() {
  const { colors } = useTheme();
  const { showAlert, showSnackbar } = useOverlay();
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<FoodItem | null>(null);
  const [gram, setGram] = useState('');
  const foods = useMemo(() => searchFoods(query), [query]);
  const recent = useMemo(() => recentFoods.map((uid) => FOODS.find((food) => food.uid === uid)).filter((food): food is FoodItem => !!food), []);
  const showRecent = !query.trim() && recent.length > 0;

  // 고른 쪽에서 Android 뒤로가기는 목록으로 돌아간다
  useEffect(() => {
    if (!picked) return undefined;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setPicked(null);
      return true;
    });
    return () => subscription.remove();
  }, [picked]);

  const add = () => {
    if (!picked) return;
    const grams = parseGram(gram);
    if (grams === null) {
      showAlert({ title: FEED_LIST_TEXT.weightNumberOnly, confirm: { label: '확인' } });
      return;
    }
    const index = recentFoods.indexOf(picked.uid);
    if (index >= 0) recentFoods.splice(index, 1);
    recentFoods.unshift(picked.uid);
    router.back();
    resolvePick(JSON.stringify({ uid: picked.uid, gram: grams }));
  };

  const pick = (food: FoodItem) => {
    setGram('');
    setPicked(food);
  };

  if (picked) {
    return (
      <>
        <ModalHeader title={FEED_LIST_TEXT.title} leading={{ kind: 'back', onPress: () => setPicked(null) }} action={{ title: FEED_LIST_TEXT.add, onPress: add, testID: 'feed-food-add' }} />
        <ZSScreen backgroundColor="background" maxContentWidth={MODAL_MAX_WIDTH} style={styles.container}>
          <FoodDetail food={picked} gram={gram} onGram={setGram} />
        </ZSScreen>
      </>
    );
  }

  const rows = (list: FoodItem[], prefix: string) => list.map((food) => <FoodRow key={`${prefix}-${food.uid}`} food={food} query={query} onPress={() => pick(food)} testID={`feed-food-${prefix}-${food.uid}`} />);

  return (
    <>
      <ModalHeader title={FEED_LIST_TEXT.title} leading={{ kind: 'close', onPress: () => router.back() }} />
      <ZSScreen backgroundColor="background" maxContentWidth={MODAL_MAX_WIDTH} style={styles.container}>
        <ZSTextField label={FEED_LIST_TEXT.searchLabel} value={query} onChangeText={setQuery} startAdornment={<SearchIcon color={colors.textSecondary} />} testID="feed-food-search" />
        {showRecent ? (
          <Section label={FEED_LIST_TEXT.recentSearch} surface="list" ruleInset={ROW_INSET + 50 + GAP.md}>
            {rows(recent, 'recent')}
          </Section>
        ) : null}
        {foods.length > 0 ? (
          <Section label={FEED_LIST_TEXT.listTitle} surface="list" ruleInset={ROW_INSET + 50 + GAP.md}>
            {rows(foods, 'all')}
          </Section>
        ) : (
          <View style={styles.empty}>
            <ZSText variant="subtitle1" emphasized>
              {FEED_LIST_TEXT.emptyTitle}
            </ZSText>
            <ZSText variant="body2" color="textSecondary">
              {FEED_LIST_TEXT.emptyDescription}
            </ZSText>
            <ZSButton title={FEED_LIST_TEXT.manageButton} variant="tonal" color="neutral" onPress={() => showSnackbar({ message: NOT_IN_EXAMPLE_MESSAGE })} testID="feed-food-manage" />
          </View>
        )}
      </ZSScreen>
    </>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: PAGE_INSET, paddingTop: GAP.lg, paddingBottom: GAP['3xl'] * 2, gap: GAP['2xl'] },
  pressable: { marginHorizontal: -ROW_INSET, paddingHorizontal: ROW_INSET },
  row: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: GAP.md, paddingVertical: GAP.md },
  rowText: { flexGrow: 1, flexShrink: 1, gap: GAP.xxs },
  thumb: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  badge: { paddingHorizontal: GAP.sm, paddingVertical: GAP.xxs },
  detailHead: { flexDirection: 'row', alignItems: 'center', gap: GAP.md },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP.xs },
  empty: { alignItems: 'center', gap: GAP.sm, paddingVertical: GAP['3xl'] },
});
