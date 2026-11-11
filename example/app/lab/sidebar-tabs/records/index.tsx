import { StyleSheet } from 'react-native';
import ScreenScrollView from '../../../../src/ui/kit/ScreenScrollView';
import ScreenHeader from '../../../../src/ui/ScreenHeader';
import { ZSText, useTheme } from '@0610studio/zs-ui';

export default function SidebarTabsRecords() {
  const { colors } = useTheme();
  return (
    <>
      <ScreenHeader title="기록" />
      <ScreenScrollView
        style={{ backgroundColor: colors.surface1 }}
        contentContainerStyle={styles.content}
      >
        <ZSText variant="h4" emphasized testID="lab-sidebar-tabs-records-title">기록</ZSText>
        <ZSText variant="caption" color="textSecondary">탭 전환이 사이드바와 탭바 양쪽에서 같은 라우트로 동작하는지 확인한다.</ZSText>
      </ScreenScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 12,
  },
});
