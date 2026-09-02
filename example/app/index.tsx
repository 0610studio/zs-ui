import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack, router } from 'expo-router';
import { ZSContainer, ZSPressable, ZSText, ZSView, useTheme } from '@0610studio/zs-ui';
import HeaderRight from '../src/ui/HeaderRight';

const LIB_VERSION: string = require('@0610studio/zs-ui/package.json').version;

/** 외부 아이콘 없이 팔레트 색으로만 구성한 타일 도형 */
function ThemeGlyph() {
  const { palette } = useTheme();
  return (
    <View style={{ flexDirection: 'row' }}>
      <View style={{ width: 9, height: 18, borderTopLeftRadius: 9, borderBottomLeftRadius: 9, backgroundColor: palette.primary.main }} />
      <View style={{ width: 9, height: 18, borderTopRightRadius: 9, borderBottomRightRadius: 9, backgroundColor: palette.grey[80] }} />
    </View>
  );
}

function BoxGlyph({ color }: { color: string }) {
  return <View style={{ width: 14, height: 14, borderWidth: 2, borderColor: color, borderRadius: 4 }} />;
}

function FieldGlyph({ color }: { color: string }) {
  return <View style={{ width: 16, height: 12, borderWidth: 2, borderColor: color, borderRadius: 4 }} />;
}

function PillGlyph({ color }: { color: string }) {
  return <View style={{ width: 16, height: 10, borderRadius: 5, backgroundColor: color }} />;
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
    <View style={{ gap: 2, alignItems: 'flex-start' }}>
      <View style={{ width: 16, height: 4, borderRadius: 2, backgroundColor: strong }} />
      <View style={{ width: 12, height: 4, borderRadius: 2, backgroundColor: weak }} />
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
      <View style={{ width: 8, height: 2, borderRadius: 1, backgroundColor: mark }} />
    </View>
  );
}

function SegmentGlyph({ active, track }: { active: string; track: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2, padding: 2, borderRadius: 8, backgroundColor: track }}>
      <View style={{ width: 10, height: 12, borderRadius: 6, backgroundColor: active }} />
      <View style={{ width: 10, height: 12, borderRadius: 6 }} />
    </View>
  );
}

function TabGlyph({ active, idle }: { active: string; idle: string }) {
  return (
    <View style={{ gap: 3 }}>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        <View style={{ width: 12, height: 3, borderRadius: 2, backgroundColor: active }} />
        <View style={{ width: 12, height: 3, borderRadius: 2, backgroundColor: idle }} />
      </View>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        <View style={{ width: 12, height: 2, borderRadius: 1, backgroundColor: active }} />
        <View style={{ width: 12, height: 2, borderRadius: 1 }} />
      </View>
    </View>
  );
}

function DropdownGlyph({ color }: { color: string }) {
  return (
    <View style={{ width: 20, height: 14, borderWidth: 2, borderColor: color, borderRadius: 4, alignItems: 'flex-end', justifyContent: 'center', paddingRight: 2 }}>
      <View style={{ width: 0, height: 0, borderLeftWidth: 3, borderRightWidth: 3, borderTopWidth: 4, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: color }} />
    </View>
  );
}

function ChipGlyph({ border, fill }: { border: string; fill: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 4, borderRadius: 10, borderWidth: 2, borderColor: border, backgroundColor: fill }}>
      <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: border }} />
      <View style={{ width: 8, height: 3, borderRadius: 2, backgroundColor: border }} />
    </View>
  );
}

function TooltipGlyph({ bubble, dot }: { bubble: string; dot: string }) {
  return (
    <View style={{ alignItems: 'flex-start' }}>
      <View style={{ width: 20, height: 12, borderRadius: 5, backgroundColor: bubble, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 10, height: 2, borderRadius: 1, backgroundColor: dot }} />
      </View>
      <View style={{ marginLeft: 5, width: 0, height: 0, borderLeftWidth: 3, borderRightWidth: 3, borderTopWidth: 4, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: bubble }} />
    </View>
  );
}

function MessageGlyph({ accent, line }: { accent: string; line: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <View style={{ width: 9, height: 9, borderRadius: 5, borderWidth: 2, borderColor: accent }} />
      <View style={{ gap: 3 }}>
        <View style={{ width: 15, height: 3, borderRadius: 2, backgroundColor: accent }} />
        <View style={{ width: 10, height: 3, borderRadius: 2, backgroundColor: line }} />
      </View>
    </View>
  );
}

function SwitchGlyph({ track, thumb }: { track: string; thumb: string }) {
  return (
    <View style={{ width: 22, height: 13, borderRadius: 7, backgroundColor: track, justifyContent: 'center', alignItems: 'flex-end', paddingHorizontal: 2 }}>
      <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: thumb }} />
    </View>
  );
}

function FoldGlyph({ color }: { color: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      <View style={{ width: 8, height: 18, borderWidth: 2, borderColor: color, borderTopLeftRadius: 3, borderBottomLeftRadius: 3 }} />
      <View style={{ width: 8, height: 18, borderWidth: 2, borderColor: color, borderTopRightRadius: 3, borderBottomRightRadius: 3 }} />
    </View>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <ZSText typo="subTitle.4" color="secondary" style={styles.sectionLabel}>
      {children}
    </ZSText>
  );
}

function RowCard({ title, caption, tileColor, glyph, href, testID }: {
  title: string;
  caption: string;
  tileColor: string;
  glyph: React.ReactNode;
  href: string;
  testID?: string;
}) {
  const { palette } = useTheme();
  return (
    <ZSPressable
      fullWidth
      onPress={() => router.push(href)}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`${title}: ${caption}`}
    >
      <ZSView color="base" elevationLevel={1} style={styles.rowCard}>
        <View style={[styles.tile, { backgroundColor: tileColor }]}>{glyph}</View>
        <View style={styles.rowCardText}>
          <ZSText typo="subTitle.1">{title}</ZSText>
          <ZSText typo="caption.1" color="secondary">{caption}</ZSText>
        </View>
        <ZSText typo="heading.5" style={{ color: palette.grey[50] }}>›</ZSText>
      </ZSView>
    </ZSPressable>
  );
}

function GridCard({ title, caption, tileColor, glyph, href, testID }: {
  title: string;
  caption: string;
  tileColor: string;
  glyph: React.ReactNode;
  href: string;
  testID?: string;
}) {
  return (
    <View style={styles.gridSlot}>
      <ZSPressable
        fullWidth
        onPress={() => router.push(href)}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={`${title}: ${caption}`}
      >
        <ZSView color="base" elevationLevel={1} style={styles.gridCard}>
          <View style={[styles.tile, styles.gridTile, { backgroundColor: tileColor }]}>{glyph}</View>
          <View style={{ gap: 2 }}>
            <ZSText typo="subTitle.2">{title}</ZSText>
            <ZSText typo="caption.2" color="secondary" numberOfLines={1}>{caption}</ZSText>
          </View>
        </ZSView>
      </ZSPressable>
    </View>
  );
}

export default function Home() {
  const { palette } = useTheme();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ZSContainer style={[styles.container, { backgroundColor: palette.background.layer2 }]}>
        {/* 홈 헤더: 타이틀 + 버전 뱃지 + 테마 토글 */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <ZSText typo="heading.3">ZS-UI</ZSText>
            <View style={[styles.versionBadge, { backgroundColor: palette.primary[10] }]}>
              <ZSText typo="caption.2" style={{ color: palette.primary[60], fontWeight: '700' }}>
                v{LIB_VERSION}
              </ZSText>
            </View>
          </View>
          <HeaderRight />
        </View>
        <ZSText typo="body.3" color="secondary" style={styles.headerCaption}>
          컴포넌트 예제 카탈로그 · Expo {'&'} React Native
        </ZSText>

        <SectionLabel>테마</SectionLabel>
        <RowCard
          title="테마 예제"
          caption="palette · themeFactory · 다크모드"
          tileColor={palette.primary[10]}
          glyph={<ThemeGlyph />}
          href="/ThemeExample"
        />

        <SectionLabel>웹 검증</SectionLabel>
        <RowCard
          title="Web Example"
          caption="로컬 소스 · 반응형 · E2E 검증"
          tileColor={palette.success[10]}
          glyph={<ZSText typo="subTitle.4" style={{ color: palette.success[90] }}>WEB</ZSText>}
          href="/WebExample"
          testID="web-example-card"
        />

        <SectionLabel>레이아웃</SectionLabel>
        <View style={styles.gridRow}>
          <GridCard title="ZSContainer" caption="키보드 · 스크롤 대응" tileColor={palette.information[10]} glyph={<BoxGlyph color={palette.information[50]} />} href="/ZSContainerExample" />
          <GridCard title="ZSText" caption="typo 36종 변형" tileColor={palette.secondary[10]} glyph={<ZSText typo="subTitle.2" style={{ color: palette.secondary[60] }}>Aa</ZSText>} href="/ZSTextExample" />
        </View>
        <View style={styles.gridRow}>
          <GridCard title="ZSTextField" caption="플로팅 라벨 · 3 boxStyle" tileColor={palette.primary[10]} glyph={<FieldGlyph color={palette.primary[60]} />} href="/ZSTextFieldExample" />
          <GridCard title="Button" caption="solid · pastel · stroke" tileColor={palette.danger[10]} glyph={<PillGlyph color={palette.danger[50]} />} href="/ButtonExample" />
        </View>
        <View style={styles.gridRow}>
          <GridCard title="Selection" caption="라디오 · 체크박스" tileColor={palette.success[10]} glyph={<RadioGlyph color={palette.success[60]} />} href="/SelectionExample" />
          <GridCard title="ZSSkeleton" caption="shimmer 로딩" tileColor={palette.grey[10]} glyph={<LinesGlyph strong={palette.grey[40]} weak={palette.grey[30]} />} href="/ZSSkeletonExample" />
        </View>
        <View style={styles.gridRow}>
          <GridCard title="ZSSegmented" caption="탭 · 슬라이딩 세그먼트" tileColor={palette.warning[10]} glyph={<SegmentGlyph active={palette.warning[60]} track={palette.warning[20]} />} href="/ZSSegmentedExample" />
          <GridCard title="ZSChip" caption="필터 · 선택 토글" tileColor={palette.primary[10]} glyph={<ChipGlyph border={palette.primary[60]} fill={palette.primary[10]} />} href="/ZSChipExample" />
        </View>
        <View style={styles.gridRow}>
          <GridCard title="ZSTab" caption="하단 인디케이터 탭" tileColor={palette.primary[10]} glyph={<TabGlyph active={palette.primary[50]} idle={palette.grey[40]} />} href="/ZSTabExample" />
          <GridCard title="ZSDropdown" caption="선택형 입력 · 시트 트리거" tileColor={palette.information[10]} glyph={<DropdownGlyph color={palette.information[60]} />} href="/ZSDropdownExample" />
        </View>
        <View style={styles.gridRow}>
          <GridCard title="ZSSwitch" caption="토글 스위치 · 커스텀 색상" tileColor={palette.success[10]} glyph={<SwitchGlyph track={palette.success[50]} thumb={palette.background.base} />} href="/SwitchExample" />
          <GridCard title="ZSTooltip" caption="말풍선 · 플로팅 안내" tileColor={palette.information[10]} glyph={<TooltipGlyph bubble={palette.information[60]} dot={palette.information[10]} />} href="/TooltipExample" />
        </View>
        <RowCard
          title="ZSMessageBar"
          caption="인라인 상태 메시지 · 액션 · 닫기"
          tileColor={palette.warning[10]}
          glyph={<MessageGlyph accent={palette.warning[60]} line={palette.warning[30]} />}
          href="/ZSMessageBarExample"
        />

        <SectionLabel>오버레이</SectionLabel>
        <View style={styles.gridRow}>
          <GridCard title="Overlay" caption="Alert · Sheet · Snackbar" tileColor={palette.primary[10]} glyph={<PillGlyph color={palette.primary[50]} />} href="/OverlayExample" />
          <GridCard title="PopOver" caption="anchor 메뉴" tileColor={palette.information[10]} glyph={<MenuGlyph colors={[palette.information[50], palette.information[30], palette.information[20]]} />} href="/PopOverExample" />
        </View>
        <ZSPressable fullWidth onPress={() => router.push('/GlobalOverlayExample')}>
          <View style={[styles.globalCard, { backgroundColor: palette.grey[80] }]}>
            <View style={{ flex: 1, gap: 2 }}>
              <ZSText typo="subTitle.2" style={{ color: palette.grey[5] }}>GlobalOverlay</ZSText>
              <ZSText typo="caption.2" style={{ color: palette.grey[40] }}>컴포넌트 밖 어디서든 overlay 호출</ZSText>
            </View>
            <View style={[styles.globalBadge, { backgroundColor: palette.primary.main }]}>
              <ZSText typo="caption.2" color="white">GlobalOverlay.show()</ZSText>
            </View>
          </View>
        </ZSPressable>

        <SectionLabel>이펙트</SectionLabel>
        <RowCard
          title="기본 프리미티브"
          caption="ZSView · AnimatedWrapper · Portal"
          tileColor={palette.primary[10]}
          glyph={<ZSText typo="subTitle.3" style={{ color: palette.primary[70] }}>UI</ZSText>}
          href="/PrimitiveExample"
        />
        <RowCard
          title="ZSBorderBeam"
          caption="테두리 광선 · pulse 글로우"
          tileColor={palette.information[10]}
          glyph={<BeamGlyph from={palette.primary.main} to={palette.secondary.main} />}
          href="/BorderBeamExample"
        />

        <SectionLabel>달력</SectionLabel>
        <RowCard
          title="ZSCalendar"
          caption="가장 짧은 사용법 · events 배열 하나 · 아젠다 연동"
          tileColor={palette.primary[10]}
          glyph={<CalendarGlyph frame={palette.primary[60]} mark={palette.primary[40]} />}
          href="/ZSCalendarExample"
          testID="calendar-basic-card"
        />
        <RowCard
          title="ZSCalendar 심화"
          caption="바라봄 일기 달력 · 커스텀 헤더 · 날짜 선택기 · mock API"
          tileColor={palette.warning[10]}
          glyph={<CalendarGlyph frame={palette.warning[70]} mark={palette.warning[50]} />}
          href="/ZSCalendarAdvancedExample"
          testID="calendar-card"
        />

        <SectionLabel>폴더블</SectionLabel>
        <RowCard
          title="useFoldingState"
          caption="폴더블 상태 감지"
          tileColor={palette.secondary[10]}
          glyph={<FoldGlyph color={palette.secondary[60]} />}
          href="/FoldableDevice"
        />
        <RowCard
          title="폴더블 레이아웃"
          caption="언폴딩 시 2-pane 구성"
          tileColor={palette.secondary[10]}
          glyph={<FoldGlyph color={palette.secondary[60]} />}
          href="/FoldableExample"
        />
      </ZSContainer>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 68,
    paddingBottom: 40,
    gap: 12,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  versionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
  },
  headerCaption: {
    marginBottom: 12,
  },
  sectionLabel: {
    letterSpacing: 1.5,
    marginTop: 12,
    marginLeft: 4,
  },
  rowCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 14,
    padding: 16,
  },
  rowCardText: {
    flex: 1,
    gap: 2,
  },
  tile: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
  },
  gridSlot: {
    flex: 1,
  },
  gridCard: {
    width: '100%',
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  gridTile: {
    width: 32,
    height: 32,
    borderRadius: 10,
  },
  globalCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    padding: 16,
  },
  globalBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
});
