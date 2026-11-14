import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ZSButton, ZSText, ZSTextField, useTheme } from '@0610studio/zs-ui';
import PeriodFields from '../src/ui/overlay/PeriodFields';

/** formSheet·modal 라우트가 같이 쓰는 입력 폼 — 날짜 칸은 이 라우트를 닫지 않고 위에 날짜 시트를 띄운다 */
export function RouteForm({ heading }: { heading: string }) {
  const { colors } = useTheme();
  const [title, setTitle] = useState('');
  return (
    <SafeAreaView edges={['left', 'right']} style={[styles.container, { backgroundColor: colors.background }]}>
      <ZSText variant="h3" emphasized>
        {heading}
      </ZSText>
      <ZSTextField label="제목" value={title} onChangeText={setTitle} testID="form-sheet-title" />
      <PeriodFields testID="form-sheet-period" />
      <View style={styles.row}>
        <ZSButton title="취소" variant="tonal" color="neutral" style={{ flex: 1 }} fullWidth onPress={() => router.back()} />
        <ZSButton title="저장" style={{ flex: 1 }} fullWidth onPress={() => router.back()} testID="form-sheet-save" />
      </View>
    </SafeAreaView>
  );
}

export default function FormSheetDemo() {
  return <RouteForm heading="새 기록" />;
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 20, padding: 24 },
  row: { flexDirection: 'row', gap: 12 },
});
