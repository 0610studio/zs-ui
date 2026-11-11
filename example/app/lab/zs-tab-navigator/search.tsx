import { useState } from 'react';
import { StyleSheet } from 'react-native';
import ScreenScrollView from '../../../src/ui/kit/ScreenScrollView';
import { ZSText, ZSTextField, useTheme } from '@0610studio/zs-ui';

const ITEMS = ['기록', '채팅', '설정', '캘린더', '테마'];

export default function LabZSTabsSearch() {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const results = ITEMS.filter((item) => item.includes(query.trim()));

  return (
    <ScreenScrollView
      style={{ backgroundColor: colors.surface1 }}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <ZSText variant="h4" emphasized testID="lab-zs-tab-navigator-search-title">검색</ZSText>
      <ZSTextField label="검색어" value={query} onChangeText={setQuery} testID="lab-zs-tab-navigator-search-input" />
      {results.map((item) => (
        <ZSText key={item} variant="body1">{item}</ZSText>
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
