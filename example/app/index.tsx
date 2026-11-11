import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack, router, type Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ZSScreen, ZSPressable, ZSText, radiusStyle, useTheme } from '@0610studio/zs-ui';
import useLargeText, { fitSingleWord } from '../src/hooks/useLargeText';
import HeaderRight from '../src/ui/HeaderRight';
import AnimalPhoto, { type AnimalPhotoKind } from '../src/ui/kit/AnimalPhoto';
import ContentIcon from '../src/ui/kit/ContentIcon';
import { GAP, PAGE_INSET, ROW_HEIGHT, ROW_INSET, RULE, TABULAR } from '../src/ui/kit/layout';

const LIB_VERSION: string = require('@0610studio/zs-ui/package.json').version;

function useGlyphColors() {
  const { colors } = useTheme();
  return {
    ink: colors.text,
    accent: colors.primary,
    onAccent: colors.onPrimary,
    faint: colors.borderStrong,
    face: colors.background,
  };
}

function ThemeGlyph() {
  const { accent, ink } = useGlyphColors();
  return (
    <View style={{ flexDirection: 'row' }}>
      <View style={{ width: 8, height: 16, borderTopLeftRadius: 8, borderBottomLeftRadius: 8, backgroundColor: accent }} />
      <View style={{ width: 8, height: 16, borderTopRightRadius: 8, borderBottomRightRadius: 8, backgroundColor: ink }} />
    </View>
  );
}

function TextGlyph({ color, children }: { color: string; children: string }) {
  return (
    <ZSText variant="caption" emphasized maxFontSizeMultiplier={1} numberOfLines={1} style={{ color }}>
      {children}
    </ZSText>
  );
}

function BoxGlyph({ color }: { color: string }) {
  return <View style={{ width: 14, height: 14, borderWidth: 2, borderColor: color, borderRadius: 4 }} />;
}

function FieldGlyph({ color }: { color: string }) {
  return <View style={{ width: 18, height: 12, borderWidth: 1.5, borderColor: color, borderRadius: 4 }} />;
}

function PillGlyph({ color }: { color: string }) {
  return <View style={{ width: 18, height: 10, borderRadius: 5, backgroundColor: color }} />;
}

function RadioGlyph({ color }: { color: string }) {
  return (
    <View style={{ width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: color, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }} />
    </View>
  );
}

function LinesGlyph({ strong, weak }: { strong: string; weak: string }) {
  return (
    <View style={{ gap: 3, alignItems: 'flex-start' }}>
      <View style={{ width: 16, height: 4, borderRadius: 2, backgroundColor: strong }} />
      <View style={{ width: 11, height: 4, borderRadius: 2, backgroundColor: weak }} />
    </View>
  );
}

function MenuGlyph({ colors }: { colors: [string, string, string] }) {
  return (
    <View style={{ gap: 2, width: 14 }}>
      {colors.map((color, index) => (
        <View key={index} style={{ height: 3, borderRadius: 2, backgroundColor: color }} />
      ))}
    </View>
  );
}

function BeamGlyph({ from, to }: { from: string; to: string }) {
  return (
    <View style={{ width: 16, height: 16, borderRadius: 6, borderWidth: 2, borderColor: from }}>
      <View style={{ position: 'absolute', top: -2, right: -2, width: 9, height: 9, borderTopRightRadius: 6, borderTopWidth: 2, borderRightWidth: 2, borderColor: to }} />
    </View>
  );
}

function CalendarGlyph({ frame, mark }: { frame: string; mark: string }) {
  return (
    <View style={{ width: 16, height: 16, borderRadius: 4, borderWidth: 2, borderColor: frame, paddingTop: 3, alignItems: 'center' }}>
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: mark }} />
    </View>
  );
}

function SegmentGlyph({ thumb, track }: { thumb: string; track: string }) {
  return (
    <View style={{ width: 18, height: 12, flexDirection: 'row', padding: 2, borderRadius: 6, backgroundColor: track }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: thumb }} />
    </View>
  );
}

function TabGlyph({ active, idle }: { active: string; idle: string }) {
  return (
    <View style={{ gap: 3 }}>
      <View style={{ flexDirection: 'row', gap: 4 }}>
        <View style={{ width: 7, height: 3, borderRadius: 2, backgroundColor: active }} />
        <View style={{ width: 7, height: 3, borderRadius: 2, backgroundColor: idle }} />
      </View>
      <View style={{ width: 7, height: 2, borderRadius: 1, backgroundColor: active }} />
    </View>
  );
}

function DropdownGlyph({ color }: { color: string }) {
  return (
    <View style={{ width: 18, height: 13, borderWidth: 1.5, borderColor: color, borderRadius: 4, alignItems: 'flex-end', justifyContent: 'center', paddingRight: 2 }}>
      <View style={{ width: 0, height: 0, borderLeftWidth: 3, borderRightWidth: 3, borderTopWidth: 4, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: color }} />
    </View>
  );
}

function ChipGlyph({ fill, mark }: { fill: string; mark: string }) {
  return (
    <View style={{ width: 20, height: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 2, borderRadius: 6, backgroundColor: fill }}>
      <View style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: mark }} />
      <View style={{ width: 6, height: 2, borderRadius: 1, backgroundColor: mark }} />
    </View>
  );
}

function TooltipGlyph({ bubble, dot }: { bubble: string; dot: string }) {
  return (
    <View style={{ alignItems: 'flex-start' }}>
      <View style={{ width: 18, height: 11, borderRadius: 5, backgroundColor: bubble, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 9, height: 2, borderRadius: 1, backgroundColor: dot }} />
      </View>
      <View style={{ marginLeft: 4, width: 0, height: 0, borderLeftWidth: 3, borderRightWidth: 3, borderTopWidth: 4, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: bubble }} />
    </View>
  );
}

function MessageGlyph({ mark, line }: { mark: string; line: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
      <View style={{ width: 6, height: 6, borderRadius: 3, borderWidth: 2, borderColor: mark }} />
      <View style={{ gap: 2 }}>
        <View style={{ width: 9, height: 3, borderRadius: 2, backgroundColor: mark }} />
        <View style={{ width: 6, height: 3, borderRadius: 2, backgroundColor: line }} />
      </View>
    </View>
  );
}

function CardGlyph({ face, line }: { face: string; line: string }) {
  return (
    <View style={{ width: 18, height: 14, borderRadius: 4, padding: 3, gap: 2, backgroundColor: face }}>
      <View style={{ width: 8, height: 2, borderRadius: 1, backgroundColor: line }} />
      <View style={{ width: 11, height: 2, borderRadius: 1, backgroundColor: line }} />
    </View>
  );
}

function SwitchGlyph({ track, thumb }: { track: string; thumb: string }) {
  return (
    <View style={{ width: 18, height: 11, borderRadius: 6, backgroundColor: track, justifyContent: 'center', alignItems: 'flex-end', paddingHorizontal: 2 }}>
      <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: thumb }} />
    </View>
  );
}

function FoldGlyph({ color }: { color: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      <View style={{ width: 7, height: 16, borderWidth: 2, borderColor: color, borderTopLeftRadius: 3, borderBottomLeftRadius: 3 }} />
      <View style={{ width: 7, height: 16, borderWidth: 2, borderColor: color, borderTopRightRadius: 3, borderBottomRightRadius: 3 }} />
    </View>
  );
}

function CatalogSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <ZSText variant="caption" emphasized color="textSecondary" accessibilityRole="header" style={styles.sectionLabel}>
        {label}
      </ZSText>
      {children}
    </View>
  );
}

function CatalogGroup({ children, ruleInset = GLYPH_TEXT_START }: { children: React.ReactNode; ruleInset?: number }) {
  const { colors } = useTheme();
  const large = useLargeText();
  const rows = React.Children.toArray(children);
  return (
    <View style={[styles.group, radiusStyle('xl'), { backgroundColor: colors.surface2 }]}>
      {rows.map((row, index) => (
        <React.Fragment key={index}>
          {index > 0 ? <View style={[styles.rule, { marginStart: large ? ROW_INSET : ruleInset, backgroundColor: colors.border }]} /> : null}
          {row}
        </React.Fragment>
      ))}
    </View>
  );
}

function Chevron() {
  const { colors } = useTheme();
  return <ContentIcon name="chevronRight" size={20} color={colors.textSecondary} />;
}

function CatalogRow({ title, caption, glyph, href, testID }: {
  title: string;
  caption: string;
  glyph: React.ReactNode;
  href: Href;
  testID?: string;
}) {
  const large = useLargeText();
  const slot = <View style={styles.glyphSlot}>{glyph}</View>;
  return (
    <ZSPressable
      onPress={() => router.push(href)}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`${title}: ${caption}`}
      style={[styles.row, large && styles.rowStacked]}
    >
      {large ? (
        <View style={styles.rowTop}>
          {slot}
          <Chevron />
        </View>
      ) : (
        slot
      )}
      <View style={large ? styles.rowTextStacked : styles.rowText}>
        <ZSText variant="subtitle1" {...(large ? fitSingleWord(title) : null)}>{title}</ZSText>
        <ZSText variant="caption" color="textSecondary">{caption}</ZSText>
      </View>
      {large ? null : <Chevron />}
    </ZSPressable>
  );
}

function GridRow({ children }: { children: React.ReactNode }) {
  const large = useLargeText();
  return <View style={[styles.gridRow, large && styles.gridRowStacked]}>{children}</View>;
}

const GRID_CAPTION_MAX_FONT_SCALE = 2.5;

function GridCard({ title, caption, glyph, href, testID }: {
  title: string;
  caption: string;
  glyph: React.ReactNode;
  href: Href;
  testID?: string;
}) {
  const large = useLargeText();
  return (
    <View style={large ? null : styles.gridSlot}>
      <ZSPressable
        onPress={() => router.push(href)}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={`${title}: ${caption}`}
        backgroundColor="surface2"
        radius="xl"
        style={styles.gridCard}
      >
        <View style={styles.glyphSlotStart}>{glyph}</View>
        <View style={styles.gridText}>
          <ZSText
            variant="subtitle2"
            emphasized
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={large ? 0.5 : 0.85}
            maxFontSizeMultiplier={large ? undefined : 1.3}
          >
            {title}
          </ZSText>
          <ZSText
            variant="caption"
            color="textSecondary"
            numberOfLines={large ? undefined : 2}
            maxFontSizeMultiplier={large ? GRID_CAPTION_MAX_FONT_SCALE : undefined}
          >
            {caption}
          </ZSText>
        </View>
      </ZSPressable>
    </View>
  );
}

function RecipeRow({ title, caption, photo, href, testID }: {
  title: string;
  caption: string;
  photo: AnimalPhotoKind;
  href: Href;
  testID: string;
}) {
  const large = useLargeText();
  return (
    <ZSPressable
      onPress={() => router.push(href)}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`${title}: ${caption}`}
      style={[styles.row, large && styles.rowStacked]}
    >
      <AnimalPhoto kind={photo} width={RECIPE_PHOTO} height={RECIPE_PHOTO} radius="md" />
      <View style={large ? styles.rowTextStacked : styles.rowText}>
        <ZSText variant="subtitle1">{title}</ZSText>
        <ZSText variant="caption" color="textSecondary">{caption}</ZSText>
      </View>
      {large ? null : <Chevron />}
    </ZSPressable>
  );
}

export default function Home() {
  const { top: topInset } = useSafeAreaInsets();
  const { ink, accent, onAccent, faint, face } = useGlyphColors();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ZSScreen
        backgroundColor="background"
        style={[styles.container, { paddingTop: topInset > 0 ? TOP_GAP : TOP_GAP_WITHOUT_INSET }]}
      >
        <View style={styles.intro}>
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <ZSText variant="h1" emphasized accessibilityRole="header">ZS-UI</ZSText>
              <ZSText variant="caption" emphasized color="textSecondary" style={TABULAR}>
                {`v${LIB_VERSION}`}
              </ZSText>
            </View>
            <HeaderRight />
          </View>
          <ZSText variant="body2" color="textSecondary">
            컴포넌트 예제 카탈로그 · Expo & React Native
          </ZSText>
        </View>

        <CatalogSection label="테마">
          <CatalogGroup>
            <CatalogRow
              title="테마 예제"
              caption="테마 색 · 글자 스타일 · 다크·고대비"
              glyph={<ThemeGlyph />}
              href="/ThemeExample"
            />
          </CatalogGroup>
        </CatalogSection>

        <CatalogSection label="레이아웃">
          <GridRow>
            <GridCard title="ZSScreen" caption="키보드 · 당겨서 새로고침" glyph={<BoxGlyph color={ink} />} href="/ZSScreenExample" />
            <GridCard title="ZSText" caption="h1~h4 · body · caption 등 11종" glyph={<TextGlyph color={ink}>Aa</TextGlyph>} href="/ZSTextExample" />
          </GridRow>
          <GridRow>
            <GridCard title="ZSTextField" caption="outlined · inbox · underline" glyph={<FieldGlyph color={ink} />} href="/ZSTextFieldExample" />
            <GridCard title="ZSButton" caption="filled · tonal · outlined · text" glyph={<PillGlyph color={accent} />} href="/ButtonExample" />
          </GridRow>
          <GridRow>
            <GridCard title="Selection" caption="라디오 · 체크박스 (네이티브)" glyph={<RadioGlyph color={ink} />} href="/SelectionExample" />
            <GridCard title="ZSSkeleton" caption="shimmer 로딩" glyph={<LinesGlyph strong={ink} weak={faint} />} href="/ZSSkeletonExample" />
          </GridRow>
          <GridRow>
            <GridCard title="ZSSegmentedControl" caption="세그먼트 컨트롤" glyph={<SegmentGlyph thumb={face} track={faint} />} href="/ZSSegmentedControlExample" />
            <GridCard title="ZSChip" caption="필터 칩 · 고르면 primary 면 + 체크" glyph={<ChipGlyph fill={accent} mark={onAccent} />} href="/ZSChipExample" />
          </GridRow>
          <GridRow>
            <GridCard title="ZSSelect" caption="pop-up · exposed dropdown" glyph={<DropdownGlyph color={ink} />} href="/ZSSelectExample" />
            <GridCard title="ZSSwitch" caption="네이티브 스위치" glyph={<SwitchGlyph track={accent} thumb={onAccent} />} href="/SwitchExample" />
          </GridRow>
          <CatalogGroup>
            <CatalogRow
              title="ZSCard"
              caption="elevated · filled · outlined · 누를 수 있는 카드 · 미디어"
              glyph={<CardGlyph face={accent} line={onAccent} />}
              href="/ZSCardExample"
              testID="card-example-card"
            />
            <CatalogRow
              title="ZSBanner"
              caption="인라인 상태 메시지 · 액션 · 닫기"
              glyph={<MessageGlyph mark={ink} line={faint} />}
              href="/ZSBannerExample"
            />
            <CatalogRow title="ZSTooltip" caption="인라인 팁 말풍선" glyph={<TooltipGlyph bubble={ink} dot={face} />} href="/TooltipExample" />
            <CatalogRow
              title="ZSPaneLayout"
              caption="목록 · 상세 2단 · hide/stack · pane 스크롤"
              glyph={<FoldGlyph color={ink} />}
              href="/lab/pane-layout"
              testID="pane-layout-card"
            />
          </CatalogGroup>
        </CatalogSection>

        <CatalogSection label="내비게이션">
          <CatalogGroup>
            <CatalogRow title="ZSTabNavigator" caption="아이콘 · 뱃지 · 검색 · 탭 옵션" glyph={<TabGlyph active={ink} idle={faint} />} href="/lab/zs-tab-navigator" testID="tab-navigator-card" />
          </CatalogGroup>
        </CatalogSection>

        <CatalogSection label="오버레이">
          <GridRow>
            <GridCard title="Overlay" caption="Alert · Sheet · Snackbar" glyph={<PillGlyph color={accent} />} href="/OverlayExample" />
            <GridCard title="Menu" caption="네이티브 메뉴" glyph={<MenuGlyph colors={[ink, ink, faint]} />} href="/MenuExample" />
          </GridRow>
          <CatalogGroup>
            <CatalogRow
              title="GlobalOverlay"
              caption="컴포넌트 밖 어디서든 overlay 호출 · GlobalOverlay.show()"
              glyph={<TextGlyph color={ink}>{'{ }'}</TextGlyph>}
              href="/GlobalOverlayExample"
            />
          </CatalogGroup>
        </CatalogSection>

        <CatalogSection label="이펙트">
          <CatalogGroup>
            <CatalogRow
              title="기본 프리미티브"
              caption="ZSBox · shadow · Portal"
              glyph={<TextGlyph color={ink}>UI</TextGlyph>}
              href="/PrimitiveExample"
            />
            <CatalogRow
              title="ZSBorderBeam"
              caption="테두리 광선 · pulse 글로우"
              glyph={<BeamGlyph from={faint} to={accent} />}
              href="/BorderBeamExample"
            />
          </CatalogGroup>
        </CatalogSection>

        <CatalogSection label="달력">
          <CatalogGroup>
            <CatalogRow
              title="ZSCalendar"
              caption="가장 짧은 사용법 · events 배열 하나 · 아젠다 연동"
              glyph={<CalendarGlyph frame={ink} mark={accent} />}
              href="/ZSCalendarExample"
              testID="calendar-basic-card"
            />
            <CatalogRow
              title="ZSCalendar 심화"
              caption="바라봄 일기 달력 · 커스텀 헤더 · 날짜 선택기 · mock API"
              glyph={<CalendarGlyph frame={ink} mark={accent} />}
              href="/ZSCalendarAdvancedExample"
              testID="calendar-card"
            />
            <CatalogRow
              title="ZSCalendar 폴더블"
              caption="하단 탭 ↔ 레일 · 접힘선 기준 달력 | 기록 2단 · 탭 간 상태 공유"
              glyph={<FoldGlyph color={ink} />}
              href="/ZSCalendarFoldableExample"
              testID="calendar-foldable-card"
            />
          </CatalogGroup>
        </CatalogSection>

        <CatalogSection label="화면 레시피">
          <CatalogGroup ruleInset={RECIPE_TEXT_START}>
            <RecipeRow
              title="반려동물 등록"
              caption="3단계 · 필수·선택 정보 · 고르기 시트 · 완료"
              photo="kkami"
              href="/friends/register"
              testID="recipe-register-card"
            />
            <RecipeRow
              title="건강수첩 기록"
              caption="수첩 고르기 · 분류별 작성(체중·대소변·메모…) · 머리 문장·메모 탭"
              photo="bori"
              href="/diary"
              testID="recipe-diary-card"
            />
            <RecipeRow
              title="건강수첩 모아보기"
              caption="일간·주간·월간 · 체중 추이 · 막대·원 그래프 · 빈 칸 안내"
              photo="nabi"
              href="/diary/overview"
              testID="recipe-overview-card"
            />
          </CatalogGroup>
        </CatalogSection>

        <CatalogSection label="2.0 Lab">
          <CatalogGroup>
            <CatalogRow
              title="2.0 Lab"
              caption="2.0 기능 단위 검증 · 폴더블 · 네이티브 내비게이션"
              glyph={<FoldGlyph color={ink} />}
              href="/lab"
              testID="lab-entry"
            />
          </CatalogGroup>
        </CatalogSection>
      </ZSScreen>
    </>
  );
}

const TOP_GAP = GAP.sm;
const TOP_GAP_WITHOUT_INSET = GAP.xl;
const GLYPH_SLOT = 24;
const GLYPH_TEXT_START = ROW_INSET + GLYPH_SLOT + GAP.lg;
const RECIPE_PHOTO = 48;
const RECIPE_TEXT_START = ROW_INSET + RECIPE_PHOTO + GAP.lg;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: PAGE_INSET,
    paddingBottom: GAP['3xl'] + GAP.sm,
    gap: GAP['2xl'],
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleRow: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    gap: GAP.sm,
  },
  intro: {
    width: '100%',
    gap: GAP.xs,
  },
  section: {
    width: '100%',
    gap: GAP.sm,
  },
  sectionLabel: {
    paddingHorizontal: GAP.xs,
  },
  group: {
    width: '100%',
    overflow: 'hidden',
  },
  rule: {
    height: RULE,
  },
  row: {
    width: '100%',
    minHeight: ROW_HEIGHT.double,
    flexDirection: 'row',
    alignItems: 'center',
    gap: GAP.lg,
    paddingHorizontal: ROW_INSET,
    paddingVertical: GAP.md,
  },
  rowText: {
    flex: 1,
    gap: GAP.xxs,
  },
  rowStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: GAP.sm,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowTextStacked: {
    gap: GAP.xxs,
  },
  glyphSlot: {
    width: GLYPH_SLOT,
    height: GLYPH_SLOT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyphSlotStart: {
    height: GLYPH_SLOT,
    justifyContent: 'center',
  },
  gridRow: {
    width: '100%',
    flexDirection: 'row',
    gap: GAP.sm,
  },
  gridRowStacked: {
    flexDirection: 'column',
  },
  gridSlot: {
    flex: 1,
  },
  gridCard: {
    width: '100%',
    flexGrow: 1,
    padding: GAP.lg,
    gap: GAP.md,
  },
  gridText: {
    gap: GAP.xxs,
  },
});
