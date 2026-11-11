import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ZSBanner, ZSButton, ZSChip, ZSSwitch, ZSText, ZSTopBar, useBarAxis, useTheme, type ZSTopBarRegion } from '@0610studio/zs-ui';
import { useBarAxisSetting } from '../../src/model/BarAxisSetting';
import LabValueRow from '../../src/ui/lab/LabValueRow';
import Section from '../../src/ui/kit/Section';
import Segmented from '../../src/ui/kit/Segmented';
import { TopBarIconButton, TopBarTextButton } from '../../src/ui/topBar/TopBarButtons';

const HISTORY_ICON = require('../../assets/icons/history.png');
const THEME_ICON = require('../../assets/icons/dark_mode.png');

const VARIANTS = ['검색', '제목·버튼', '글래스 버튼'] as const;
type Variant = (typeof VARIANTS)[number];
const CHIPS = ['포유류', '조류', '파충류', '어류'];

const SYSTEM_BAR = 'rgba(0, 122, 255, 0.22)';
const CONTENT = 'rgba(52, 199, 89, 0.32)';
const MARGIN = 'rgba(255, 59, 48, 0.42)';
const STATUS_BAR = 'rgba(142, 142, 147, 0.9)';
const CENTER_LINE = 'rgba(255, 59, 48, 0.9)';

const round = (value: number) => Math.round(value * 100) / 100;
const rectText = (rect: { x: number; y: number; width: number; height: number }) =>
  `x${round(rect.x)} y${round(rect.y)} · ${round(rect.width)}×${round(rect.height)}`;

const goBack = () => (router.canGoBack() ? router.back() : router.replace('/lab'));

function useHorizontalBarAxis() {
  const [, setBarAxis] = useBarAxis();
  const { barAxis: saved } = useBarAxisSetting();
  useEffect(() => {
    setBarAxis('horizontal');
    return () => setBarAxis(saved);
  }, [saved, setBarAxis]);
}

export default function LabTopBar() {
  const { colors } = useTheme();
  const [safeArea, setSafeArea] = useState(true);
  const [region, setRegion] = useState<ZSTopBarRegion | null>(null);
  const params = useLocalSearchParams<{ variant?: string; chips?: string }>();
  const [variant, setVariant] = useState<Variant>(VARIANTS[Number(params.variant)] ?? VARIANTS[0]);
  const [showOverlay, setShowOverlay] = useState(true);
  const [showChips, setShowChips] = useState(params.chips === '1');
  const [lastPress, setLastPress] = useState('-');
  useHorizontalBarAxis();

  const notDuo = region?.measured === true && region.placement === 'belowStatusBar';

  return (
    <View style={[styles.screen, { backgroundColor: colors.surface1 }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View>
        {region && showOverlay ? <RegionOverlay region={region} safeArea={safeArea} /> : null}
        <ZSTopBar safeArea={safeArea} onRegionChange={setRegion} contentStyle={styles.barContent} testID="lab-top-bar">
          <ZSButton title="뒤로" variant="text" onPress={goBack} testID="lab-top-bar-back" />
          <TopBarContent variant={variant} onPress={setLastPress} />
        </ZSTopBar>
      </View>
      {showChips ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipRow}
          contentContainerStyle={[styles.chips, { paddingLeft: region?.contentInsets.left || 20 }]}
          testID="lab-top-bar-chips"
        >
          {CHIPS.map((chip) => <ZSChip key={chip} label={chip} onSelectedChange={() => setLastPress(chip)} />)}
        </ScrollView>
      ) : null}
      <ScrollView contentContainerStyle={styles.body}>
        {notDuo ? (
          <ZSBanner
            title="iPhone Duo 전용"
            message="시계 옆 칸 배치는 iPhone Duo 에서 세로 바를 끈 상태에만 적용됩니다. 이 기기에서는 상태바 아래에 놓입니다."
            testID="lab-top-bar-duo-only"
          />
        ) : null}
        <Section label="상단 바 내용" gap={12}>
          <Segmented options={VARIANTS} value={variant} onValueChange={setVariant} testID="lab-top-bar-variant" />
          <ZSText variant="caption" color="textSecondary">
            검색: 검색 칸 + 아이콘 버튼 · 제목·버튼: 제목 + 아이콘 버튼 2개 · 글래스 버튼: 글자 버튼. 버튼은 @expo/ui(iOS SwiftUI · Android Compose)입니다.
          </ZSText>
          <LabValueRow label="마지막 누른 버튼" value={lastPress} testID="lab-top-bar-last-press" isLast />
        </Section>
        <Section gap={12}>
          <ZSSwitch label="safeArea" value={safeArea} onValueChange={setSafeArea} testID="lab-top-bar-safe-area" />
          <ZSText variant="caption" color="textSecondary">
            켜면 디자인 가이드 영역에, 끄면 상태바 밑을 포함한 컴포넌트 전체에 children 을 둡니다.
          </ZSText>
          <ZSSwitch label="영역 색 표시" value={showOverlay} onValueChange={setShowOverlay} testID="lab-top-bar-overlay" />
          <ZSSwitch label="아래 줄(필터 칩)" value={showChips} onValueChange={setShowChips} testID="lab-top-bar-chips-toggle" />
          <ZSText variant="caption" color="textSecondary">
            아래 줄은 상단 바 children 과 같은 왼쪽 시작(contentInsets.left)에 맞춥니다.
          </ZSText>
        </Section>
        <Section label="측정값" gap={0}>
          <LabValueRow label="배치" value={region ? region.placement : '-'} testID="lab-top-bar-placement" />
          <LabValueRow label="측정" value={region?.measured ? '네이티브' : '추정'} testID="lab-top-bar-measured" />
          <LabValueRow label="컴포넌트 높이" value={region ? `${round(region.height)}` : '-'} testID="lab-top-bar-height" />
          <LabValueRow label="시스템 bar region" value={region?.systemBar ? rectText(region.systemBar) : '없음'} testID="lab-top-bar-system-bar" />
          <LabValueRow
            label="화면 레이아웃 여백 (왼·오)"
            value={region?.systemMargins ? `${round(region.systemMargins.left)} / ${round(region.systemMargins.right)}` : '없음'}
            testID="lab-top-bar-system-margins"
          />
          <LabValueRow
            label="children inset (위·왼·오·아래)"
            value={region ? [region.contentInsets.top, region.contentInsets.left, region.contentInsets.right, region.contentInsets.bottom].map(round).join(' / ') : '-'}
            testID="lab-top-bar-content-insets"
            isLast
          />
        </Section>
        <Section label="색" gap={8}>
          <Legend color={SYSTEM_BAR} label="시스템 bar region" />
          <Legend color={CONTENT} label="children 영역" />
          <Legend color={MARGIN} label="왼쪽 여백 (bar region → children)" />
          <Legend color={STATUS_BAR} label="상태바 자리 (테두리)" outline />
          <Legend color={CENTER_LINE} label="bar region 가운데 선 — 시계 숫자 가운데와 맞아야 한다" line />
        </Section>
      </ScrollView>
    </View>
  );
}

function TopBarContent({ variant, onPress }: { variant: Variant; onPress: (label: string) => void }) {
  const { colors } = useTheme();
  switch (variant) {
    case '검색':
      return (
        <>
          <View style={[styles.search, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <ZSText variant="body2" color="textSecondary" numberOfLines={1}>동물 검색</ZSText>
          </View>
          <TopBarIconButton label="최근 검색" symbol="clock.arrow.circlepath" androidIcon={HISTORY_ICON} onPress={() => onPress('최근 검색')} testID="lab-top-bar-recent" />
        </>
      );
    case '제목·버튼':
      return (
        <>
          <ZSText variant="h4" emphasized numberOfLines={1} style={styles.title}>동물 도감</ZSText>
          <TopBarIconButton label="기록" symbol="clock.arrow.circlepath" androidIcon={HISTORY_ICON} onPress={() => onPress('기록')} testID="lab-top-bar-history" />
          <TopBarIconButton label="테마" symbol="moon" androidIcon={THEME_ICON} onPress={() => onPress('테마')} testID="lab-top-bar-theme" />
        </>
      );
    case '글래스 버튼':
      return (
        <>
          <View style={styles.title} />
          <TopBarTextButton label="기록" symbol="clock.arrow.circlepath" androidIcon={HISTORY_ICON} onPress={() => onPress('기록 버튼')} testID="lab-top-bar-text-button" />
          <TopBarTextButton label="테마" symbol="moon" androidIcon={THEME_ICON} prominent onPress={() => onPress('테마 버튼')} testID="lab-top-bar-prominent-button" />
        </>
      );
  }
}

function RegionOverlay({ region, safeArea }: { region: ZSTopBarRegion; safeArea: boolean }) {
  const { top } = useSafeAreaInsets();
  const { contentInsets: inset, systemBar: bar } = region;
  const statusBar = bar
    ? { left: bar.x + bar.width, right: 0, top: 0, height: region.height }
    : { left: 0, right: 0, top: 0, height: top };
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {bar ? <View style={[styles.box, { left: bar.x, top: bar.y, width: bar.width, height: bar.height, backgroundColor: SYSTEM_BAR }]} /> : null}
      <View style={[styles.box, { ...inset, backgroundColor: CONTENT }]} />
      {bar && safeArea && inset.left > bar.x ? (
        <View style={[styles.box, { left: bar.x, top: bar.y, width: inset.left - bar.x, height: bar.height, backgroundColor: MARGIN }]} />
      ) : null}
      <View style={[styles.box, statusBar, styles.outline, { borderColor: STATUS_BAR }]} />
      {bar ? <View style={[styles.box, styles.centerLine, { top: bar.y + bar.height / 2 - 0.5 }]} /> : null}
    </View>
  );
}

function Legend({ color, label, outline, line }: { color: string; label: string; outline?: boolean; line?: boolean }) {
  return (
    <View style={styles.legend}>
      <View style={[styles.swatch, outline ? [styles.outline, { borderColor: color }] : line ? styles.swatchLine : null, !outline && { backgroundColor: color }]} />
      <ZSText variant="caption" style={styles.legendLabel}>{label}</ZSText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  barContent: { gap: 8 },
  search: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  title: { flex: 1 },
  chipRow: { flexGrow: 0 },
  chips: { gap: 8, paddingRight: 20, paddingVertical: 8 },
  body: { padding: 20, gap: 20 },
  box: { position: 'absolute' },
  outline: { borderWidth: 1, borderStyle: 'dashed' },
  centerLine: { left: 0, right: 0, height: 1, backgroundColor: CENTER_LINE },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  swatch: { width: 20, height: 14, borderRadius: 3 },
  swatchLine: { height: 2, borderRadius: 0 },
  legendLabel: { flex: 1 },
});
