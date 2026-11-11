import { useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { useVerticalBarEdgeIOS } from 'expo-status-bar';
import ScreenScrollView from '../../../src/ui/kit/ScreenScrollView';
import { ZSBanner, ZSChip, ZSSegmentedControl, ZSText, useDevicePosture, useTheme, useWindowLayout, type BarAxis } from '@0610studio/zs-ui';
import { useBarAxisSetting } from '../../../src/model/BarAxisSetting';
import { useZSTabsBadge } from '../../../src/ui/lab/ZSTabsBadgeContext';

const BAR_AXIS_OPTIONS: { label: string; value: BarAxis }[] = [
  { label: '세로 탭', value: 'vertical' },
  { label: '가로 탭', value: 'horizontal' },
];

const VERTICAL_UNAVAILABLE_MESSAGE =
  Platform.OS === 'ios'
    ? '세로 탭은 옆에 세로 막대가 있는 iPhone Duo에서만 탭 바를 옆으로 옮겨요. 이 기기·방향에서는 가로 탭과 같아요.'
    : '세로 탭은 펼친 폴더블·태블릿처럼 넓은 창에서만 탭 바를 옆 레일로 옮겨요. 지금 창에서는 가로 탭과 같아요.';

const useVerticalBarEdge = Platform.OS === 'ios' ? useVerticalBarEdgeIOS : () => null;

function useVerticalTabsAvailable(): boolean {
  const edge = useVerticalBarEdge();
  const { widthClass, heightClass } = useWindowLayout();
  const { posture } = useDevicePosture();
  if (Platform.OS === 'ios') return edge !== null;
  return widthClass !== 'compact' && heightClass !== 'compact' && posture !== 'tabletop';
}

const ROWS = Array.from({ length: 30 }, (_, index) => index + 1);

export default function LabZSTabsIndex() {
  const { colors } = useTheme();
  const { unread, setUnread, mutedTabs, setMutedTabs } = useZSTabsBadge();
  const { barAxis, setBarAxis } = useBarAxisSetting();
  const verticalAvailable = useVerticalTabsAvailable();
  const [verticalPicked, setVerticalPicked] = useState(false);
  const showVerticalNotice = verticalPicked && barAxis === 'vertical' && !verticalAvailable;

  const handleBarAxisChange = (next: BarAxis) => {
    setBarAxis(next);
    setVerticalPicked(next === 'vertical');
  };

  return (
    <ScreenScrollView
      style={{ backgroundColor: colors.surface1 }}
      contentContainerStyle={styles.content}
      testID="lab-zs-tab-navigator-index-scroll"
    >
      <ZSText variant="h4" emphasized testID="lab-zs-tab-navigator-index-title">기록</ZSText>
      <ZSText variant="caption" color="textSecondary" testID="lab-zs-tab-navigator-unread">{`채팅 미읽음 ${unread}`}</ZSText>
      <ZSChip label="채팅 뱃지 +1" onSelectedChange={() => setUnread(unread + 1)} selected={false} testID="lab-zs-tab-navigator-badge-plus" />
      <ZSChip label="비선택 탭 회색" onSelectedChange={setMutedTabs} selected={mutedTabs} testID="lab-zs-tab-navigator-muted" />
      <ZSSegmentedControl options={BAR_AXIS_OPTIONS} value={barAxis} onValueChange={handleBarAxisChange} testID="lab-zs-tab-navigator-bar-axis" />
      <ZSText variant="caption" color="textSecondary">앱 전체 설정이에요. iPhone Duo와 펼친 폴더블에서 탭 바가 옆 세로 막대·레일 ↔ 아래로 바뀌어요.</ZSText>
      <ZSBanner
        visible={showVerticalNotice}
        status="info"
        title="지금은 달라지는 게 없어요"
        message={VERTICAL_UNAVAILABLE_MESSAGE}
        onClose={() => setVerticalPicked(false)}
        testID="lab-zs-tab-navigator-vertical-notice"
      />
      {ROWS.map((row) => (
        <ZSText key={row} variant="caption">{`기록 ${row}`}</ZSText>
      ))}
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 12,
  },
});
