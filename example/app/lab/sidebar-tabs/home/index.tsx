import { StyleSheet, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import ScreenScrollView from '../../../../src/ui/kit/ScreenScrollView';
import { ZSChip, ZSSegmentedControl, ZSText, useTheme } from '@0610studio/zs-ui';
import Section from '../../../../src/ui/kit/Section';
import ScreenHeader from '../../../../src/ui/ScreenHeader';
import LabValueRow from '../../../../src/ui/lab/LabValueRow';
import { SIDEBAR_PLACEMENTS, useSidebarPlacement } from '../../../../src/ui/lab/SidebarPlacementContext';

export default function SidebarTabsHome() {
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  const { placement, setPlacement } = useSidebarPlacement();

  return (
    <>
      <ScreenHeader title="iOS 27 사이드바 탭" />
      <ScreenScrollView
        style={{ backgroundColor: colors.surface1 }}
        contentContainerStyle={styles.content}
      >
        <Section label="ios.sidebar" gap={12}>
          <ZSSegmentedControl
            options={SIDEBAR_PLACEMENTS.map((value) => ({ label: value, value }))}
            value={placement}
            onValueChange={setPlacement}
            testID="lab-sidebar-tabs-placement"
          />
          <ZSText variant="label" color="textSecondary">
            사이드바와 탭바 중 하나만 표시할 수 있을 때(대형 iPhone 가로 · 아이폰 듀오 내부) 어느 쪽을 쓸지 정한다. compact 폭은 항상 탭바, iPad는 iPadOS 기본 동작(가로 사이드바 · 세로 탭바)을 따른다. 사이드바를 숨기면 헤더 왼쪽 버튼으로 다시 연다.
          </ZSText>
        </Section>

        <Section label="창" gap={0}>
          <LabValueRow label="placement" value={placement} testID="lab-sidebar-tabs-value" />
          <LabValueRow label="window" value={`${Math.round(width)} × ${Math.round(height)}`} testID="lab-sidebar-tabs-window" isLast />
        </Section>

        <ZSChip label="랩 목록으로" selected={false} onSelectedChange={() => router.dismissTo('/lab')} style={styles.exit} testID="lab-sidebar-tabs-exit" />
      </ScreenScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 24,
  },
  exit: {
    alignSelf: 'flex-start',
  },
});
