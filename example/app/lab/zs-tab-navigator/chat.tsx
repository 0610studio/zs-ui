import { StyleSheet } from 'react-native';
import ScreenScrollView from '../../../src/ui/kit/ScreenScrollView';
import { ZSChip, ZSText, useTheme } from '@0610studio/zs-ui';
import { useZSTabsBadge } from '../../../src/ui/lab/ZSTabsBadgeContext';

export default function LabZSTabsChat() {
  const { colors } = useTheme();
  const { setUnread } = useZSTabsBadge();
  return (
    <ScreenScrollView
      style={{ backgroundColor: colors.surface1 }}
      contentContainerStyle={styles.content}
    >
      <ZSText variant="h4" emphasized testID="lab-zs-tab-navigator-chat-title">채팅</ZSText>
      <ZSChip label="모두 읽음" onSelectedChange={() => setUnread(0)} selected={false} testID="lab-zs-tab-navigator-read-all" />
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 12,
  },
});
