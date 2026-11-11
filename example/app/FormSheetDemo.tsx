import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ZSButton, ZSText, ZSTextField, useTheme } from '@0610studio/zs-ui';

export default function FormSheetDemo() {
  const { colors } = useTheme();
  const [title, setTitle] = useState('');
  return (
    <SafeAreaView edges={['left', 'right']} style={[styles.container, { backgroundColor: colors.background }]}>
      <ZSText variant="h3" emphasized>새 기록</ZSText>
      <ZSTextField label="제목" value={title} onChangeText={setTitle} testID="form-sheet-title" />
      <View style={styles.row}>
        <ZSButton title="취소" variant="tonal" color="neutral" style={{ flex: 1 }} fullWidth onPress={() => router.back()} />
        <ZSButton title="저장" style={{ flex: 1 }} fullWidth onPress={() => router.back()} testID="form-sheet-save" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 20, padding: 24 },
  row: { flexDirection: 'row', gap: 12 },
});
