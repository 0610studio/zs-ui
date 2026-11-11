import { useState } from 'react';
import { StyleSheet } from 'react-native';
import ScreenScrollView from '../../../src/ui/kit/ScreenScrollView';
import { ZSText, ZSTextField, useTheme } from '@0610studio/zs-ui';

export default function LabZSTabsCompose() {
  const { colors } = useTheme();
  const [memo, setMemo] = useState('');

  return (
    <ScreenScrollView
      style={{ backgroundColor: colors.surface1 }}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <ZSText variant="h4" emphasized testID="lab-zs-tab-navigator-compose-title">글쓰기</ZSText>
      <ZSText variant="caption" color="textSecondary">
        iOS 27 이상에서는 이 탭이 탭 바와 떨어진 강조 탭으로 보인다. 첫 탭을 아래로 스크롤해 탭 바가 줄어도 남는다.
      </ZSText>
      <ZSTextField label="내용" value={memo} onChangeText={setMemo} multiline minRows={3} testID="lab-zs-tab-navigator-compose-input" />
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 12,
  },
});
