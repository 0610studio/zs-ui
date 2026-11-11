import { useEffect, useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { ZSScreen, ZSSegmentedControl, ZSSegmentedPages, ZSSkeleton, useOverlay, useTheme } from '@0610studio/zs-ui';
import RecipeHeader from '../../src/ui/recipe/RecipeHeader';
import { GAP } from '../../src/ui/kit/layout';
import SplitColumns, { COLUMN_GAP, usePageInset, useWideLayout } from '../../src/ui/kit/SplitColumns';
import TrendCard from '../../src/ui/diary/detail/TrendCard';
import BarChart from '../../src/ui/diary/overview/BarChart';
import DonutChart, { type DonutSlice } from '../../src/ui/diary/overview/DonutChart';
import MeasureDots from '../../src/ui/diary/overview/MeasureDots';
import { EmptyCard, OverviewCard, PetSheet, ProfileCard } from '../../src/ui/diary/overview/Cards';
import { BehaviorProgress, TodoProgress, WeightGoal } from '../../src/ui/diary/overview/Sections';
import { NOT_IN_EXAMPLE_MESSAGE } from '../../src/model/diary/common';
import { formatWon, weightTrend } from '../../src/model/diary/detail';
import { POOPEE } from '../../src/model/diary/poopee';
import {
  OVERVIEW_PERIODS,
  OVERVIEW_PERIOD_SEGMENTS,
  OVERVIEW_PETS,
  OVERVIEW_TEXT,
  POOPEE_COLOR,
  fetchOverview,
  hasValues,
  measureName,
  measureUnit,
  periodLabel,
  periodStarts,
  symptomLabel,
  todoRows,
  weightChart,
  weightGoal,
  withComma,
  type OverviewEmptyKind,
  type OverviewPeriod,
  type OverviewPetId,
  type OverviewSlice,
  type PetOverview,
} from '../../src/model/diary/overview';

const AFTER_SHEET = 300;

type Section = { id: string; hasData: boolean; node: ReactNode };

export default function DiaryOverviewScreen() {
  const { colors } = useTheme();
  const wide = useWideLayout();
  const inset = usePageInset();
  const { showBottomSheet, hideBottomSheet, showSnackbar } = useOverlay();
  const [now] = useState(() => new Date());
  const [petId, setPetId] = useState<OverviewPetId>('bori');
  const [period, setPeriod] = useState<OverviewPeriod>('day');
  const [overview, setOverview] = useState<PetOverview | null>(null);

  useEffect(() => {
    let alive = true;
    setOverview(null);
    fetchOverview(petId).then((next) => {
      if (alive) setOverview(next);
    });
    return () => {
      alive = false;
    };
  }, [petId]);

  const notInExample = () => showSnackbar({ message: NOT_IN_EXAMPLE_MESSAGE });

  const openWrite = (kind: OverviewEmptyKind) => {
    if (kind === 'activity') router.push('/diary/walk');
    else if (kind === 'water' || kind === 'food') router.push({ pathname: '/diary/write/[category]', params: { category: 'feed' } });
    else if (kind === 'feces') router.push({ pathname: '/diary/write/[category]', params: { category: 'poopee' } });
    else router.push({ pathname: '/diary/write/[category]', params: { category: kind } });
  };

  const openPetSheet = () =>
    showBottomSheet({
      header: OVERVIEW_TEXT.petSheetTitle,
      component: (
        <PetSheet
          pets={OVERVIEW_PETS}
          current={petId}
          now={now}
          onPick={(pet) => {
            hideBottomSheet();
            if (pet.id !== petId) setTimeout(() => setPetId(pet.id), AFTER_SHEET);
          }}
        />
      ),
    });

  const skeleton = (height: number, index: number) => <ZSSkeleton.Box key={index} height={height} radius="xl" />;
  const header = <RecipeHeader title={OVERVIEW_TEXT.title} />;

  if (!overview) {
    return (
      <>
        {header}
        <ZSScreen backgroundColor="background" style={[styles.container, { paddingHorizontal: inset }]}>
          {wide ? (
            <SplitColumns gap={GAP.lg} start={[112, 40, 260].map(skeleton)} end={[220, 260].map(skeleton)} />
          ) : (
            [112, 220, 40, 260, 260].map(skeleton)
          )}
        </ZSScreen>
      </>
    );
  }

  const trendChart = weightChart(overview, now);
  const goal = weightGoal(overview);
  // 기간마다 카드 목록 — 넓은 창은 기간 페이지마다 따로 만든다
  const buildSections = (period: OverviewPeriod): Section[] => {
    const labels = periodStarts(period, now).map((start) => periodLabel(start, period));
    const bars = (values: (number | null)[], marks: number[] = []) => values.map((value, index) => ({ label: labels[index], value, mark: marks.includes(index) ? OVERVIEW_TEXT.fasting : undefined }));
    const card = (id: string, title: string, node: ReactNode, description?: string) => (
      <OverviewCard title={title} description={description} onPress={notInExample} testID={`overview-${id}`}>
        {node}
      </OverviewCard>
    );
    const slices = (items: OverviewSlice[] | undefined, toLabel: (code: string) => string, toColor: (code: string, index: number) => string): DonutSlice[] =>
      (items ?? []).map((item, index) => ({ label: toLabel(item.code), count: item.count, color: toColor(item.code, index) }));
    const palette = [colors.info, colors.primaryMark, colors.secondary, colors.tertiary, colors.success, colors.textSecondary];
    const byPalette = (_: string, index: number) => palette[index % palette.length];
    const byPoopee = (code: string, index: number) => POOPEE_COLOR[code] ?? byPalette(code, index);
    const shapeLabel = (code: string) => POOPEE.shape.options.find((option) => option.code === code)?.label ?? code;

    const { walk, food, play, water, price, abnormal, poopee, measure } = overview;
    const todos = todoRows(overview.todos[period]);
    const feces = poopee?.[period];
    const hasFeces = !!feces && (feces.feces.length > 0 || feces.shape.length > 0 || feces.urine.length > 0);
    const abnormalItems = abnormal?.[period] ?? [];
    const measureRows = measure?.[period].filter((row) => hasValues(row.values)) ?? [];
    const fastingDays = period === 'day' ? food?.fastingDays ?? [] : [];
    const empty = (kind: OverviewEmptyKind) => <EmptyCard kind={kind} onPress={() => openWrite(kind)} />;

    const sections: Section[] = [
      { id: 'weight', hasData: !!trendChart, node: trendChart ? null : empty('weight') },
      { id: 'todo', hasData: todos.length > 0, node: todos.length > 0 ? card('todo', OVERVIEW_TEXT.sections.todo, <TodoProgress todos={overview.todos[period]} period={period} labels={labels} />) : empty('todo') },
      {
        id: 'behavior',
        hasData: overview.behaviors.length > 0,
        node:
          overview.behaviors.length > 0
            ? card('behavior', OVERVIEW_TEXT.sections.behavior, <BehaviorProgress behaviors={overview.behaviors} now={now} onPress={notInExample} />, OVERVIEW_TEXT.behavior.period(overview.behaviors[0].weeks.length))
            : null,
      },
      {
        id: 'walk',
        hasData: hasValues(walk?.minutes[period]),
        node:
          walk && hasValues(walk.minutes[period])
            ? card(
                'walk',
                OVERVIEW_TEXT.sections.walk,
                <BarChart
                  bars={bars(walk.minutes[period])}
                  color={colors.primaryMark}
                  format={(value) => `${withComma(value)}분`}
                  barLabel={OVERVIEW_TEXT.labels.duration}
                  line={{ label: OVERVIEW_TEXT.labels.distance, values: walk.km[period], format: (value) => `${value}km` }}
                  testID="overview-walk-chart"
                />,
              )
            : empty('activity'),
      },
      {
        id: 'play',
        hasData: hasValues(play?.[period]),
        node: play && hasValues(play[period]) ? card('play', OVERVIEW_TEXT.sections.play, <BarChart bars={bars(play[period])} color={colors.primaryMark} format={(value) => `${withComma(value)}분`} showValues testID="overview-play-chart" />) : null,
      },
      {
        id: 'food',
        hasData: hasValues(food?.grams[period]),
        node:
          food && hasValues(food.grams[period])
            ? card(
                'food',
                OVERVIEW_TEXT.sections.food,
                <BarChart
                  bars={bars(food.grams[period], fastingDays)}
                  color={colors.primaryMark}
                  format={(value) => `${withComma(value)}g`}
                  barLabel={OVERVIEW_TEXT.sections.food}
                  line={hasValues(food.kcal[period]) ? { label: OVERVIEW_TEXT.labels.calories, values: food.kcal[period], format: (value) => `${withComma(value)}kcal` } : undefined}
                  testID="overview-food-chart"
                />,
              )
            : empty('food'),
      },
      {
        id: 'water',
        hasData: hasValues(water?.[period]),
        node: water && hasValues(water[period]) ? card('water', OVERVIEW_TEXT.sections.water, <BarChart bars={bars(water[period])} color={colors.primaryMark} format={(value) => `${withComma(value)}ml`} showValues testID="overview-water-chart" />) : empty('water'),
      },
      {
        id: 'abnormal',
        hasData: abnormalItems.length > 0,
        node:
          abnormalItems.length > 0
            ? card('abnormal', OVERVIEW_TEXT.sections.abnormal, <DonutChart slices={slices(abnormalItems, symptomLabel, byPalette)} testID="overview-abnormal-chart" />, OVERVIEW_TEXT.pieDescription[period])
            : empty('abnormal'),
      },
      {
        id: 'poopee',
        hasData: hasFeces,
        node:
          feces && hasFeces
            ? card(
                'poopee',
                OVERVIEW_TEXT.sections.poopee,
                <View style={styles.donuts}>
                  {feces.feces.length > 0 ? <DonutChart title={OVERVIEW_TEXT.labels.feces} slices={slices(feces.feces, (code) => code, byPoopee)} testID="overview-feces-chart" /> : null}
                  {feces.shape.length > 0 ? <DonutChart title={OVERVIEW_TEXT.labels.fecesShape} slices={slices(feces.shape, shapeLabel, byPalette)} testID="overview-shape-chart" /> : null}
                  {feces.urine.length > 0 ? <DonutChart title={OVERVIEW_TEXT.labels.urine} slices={slices(feces.urine, (code) => code, byPoopee)} testID="overview-urine-chart" /> : null}
                </View>,
                OVERVIEW_TEXT.pieDescription[period],
              )
            : empty('feces'),
      },
      {
        id: 'measure',
        hasData: measureRows.length > 0,
        node:
          measureRows.length > 0
            ? card('measure', OVERVIEW_TEXT.sections.measure, <MeasureDots rows={measureRows.map((row) => ({ name: measureName(row.kind), unit: measureUnit(row.kind), values: row.values }))} labels={labels} testID="overview-measure-chart" />)
            : null,
      },
      {
        id: 'price',
        hasData: hasValues(price?.[period]),
        node: price && hasValues(price[period]) ? card('price', OVERVIEW_TEXT.sections.price, <BarChart bars={bars(price[period])} color={colors.primaryMark} format={formatWon} showValues testID="overview-price-chart" />) : null,
      },
    ];
    return [...sections].sort((a, b) => Number(b.hasData) - Number(a.hasData)).filter((section) => section.node);
  };
  const sorted = buildSections(period);

  const profile = <ProfileCard pet={overview.pet} now={now} onChange={openPetSheet} onAlbum={notInExample} onExport={notInExample} onSearch={notInExample} />;
  const trend = trendChart ? (
    <TrendCard trend={weightTrend(trendChart)} testID="overview-weight">
      {goal ? <WeightGoal goal={goal} onPress={notInExample} /> : null}
    </TrendCard>
  ) : null;
  const periodControl = (
    <ZSSegmentedControl
      options={OVERVIEW_PERIODS}
      value={period}
      onValueChange={setPeriod}
      fullWidth
      accessibilityLabel="기간"
      testID="overview-period"
    />
  );
  const renderSection = (section: Section) => <View key={section.id}>{section.node}</View>;

  if (wide) {
    // 넓은 창 — 왼쪽은 기간과 무관한 정보(프로필·체중 추이·행동 교정), 오른쪽은 일간·주간·월간 전환과 그 기간 카드. 칸마다 따로 스크롤하고 전환 컨트롤은 칸 위에 고정
    const fixed = sorted.filter((section) => PERIODLESS.has(section.id));
    return (
      <>
        {header}
        <ZSScreen scrollEnabled={false} backgroundColor="background" style={[styles.wideRoot, { paddingHorizontal: inset }]}>
          <View style={styles.wideRow}>
            <ScrollView style={styles.pane} contentContainerStyle={styles.paneContent} contentInsetAdjustmentBehavior="never" testID="overview-fixed-pane">
              {profile}
              {trend}
              {fixed.map(renderSection)}
            </ScrollView>
            <View style={styles.pane}>
              <View style={styles.tabs}>
                <ZSSegmentedControl options={OVERVIEW_PERIOD_SEGMENTS} value={period} onValueChange={setPeriod} fullWidth accessibilityLabel="기간" testID="overview-period" />
              </View>
              {/* 기간 페이지 — 고른 쪽으로 넘어가고 좌우로 밀어도 넘어간다. 페이지마다 스크롤을 따로 둔다 */}
              <ZSSegmentedPages
                options={OVERVIEW_PERIOD_SEGMENTS}
                value={period}
                onValueChange={setPeriod}
                swipeEnabled
                testID="overview-period-pane"
                renderPage={(page) => (
                  <ScrollView style={styles.pane} contentContainerStyle={styles.paneContent} contentInsetAdjustmentBehavior="never">
                    {buildSections(page).filter((section) => !PERIODLESS.has(section.id)).map(renderSection)}
                  </ScrollView>
                )}
              />
            </View>
          </View>
        </ZSScreen>
      </>
    );
  }

  return (
    <>
      {header}
      <ZSScreen backgroundColor="background" style={[styles.container, { paddingHorizontal: inset }]}>
        {profile}
        {trend}
        {periodControl}
        {sorted.map(renderSection)}
      </ZSScreen>
    </>
  );
}

/** 기간과 무관한 카드 — 넓은 창 왼쪽 칸 */
const PERIODLESS = new Set(['weight', 'behavior']);

const styles = StyleSheet.create({
  container: { paddingTop: GAP.lg, paddingBottom: GAP['3xl'] * 2, gap: GAP.lg },
  donuts: { gap: GAP.xl },
  wideRoot: { flex: 1 },
  wideRow: { flex: 1, flexDirection: 'row', gap: COLUMN_GAP },
  pane: { flex: 1 },
  paneContent: { paddingTop: GAP.lg, paddingBottom: GAP['3xl'] * 2, gap: GAP.lg },
  tabs: { paddingTop: GAP.sm },
});
