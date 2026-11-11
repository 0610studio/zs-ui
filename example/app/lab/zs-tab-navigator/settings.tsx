import { StyleSheet } from 'react-native';
import ScreenScrollView from '../../../src/ui/kit/ScreenScrollView';
import { ZSText, useTheme } from '@0610studio/zs-ui';

export default function LabZSTabsSettings() {
  const { colors } = useTheme();
  return (
    <ScreenScrollView
      style={{ backgroundColor: colors.surface1 }}
      contentContainerStyle={styles.content}
    >
      <ZSText variant="h4" emphasized testID="lab-zs-tab-navigator-settings-title">설정</ZSText>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 12,
  },
});
