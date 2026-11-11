import { StyleSheet } from 'react-native';
import { useTheme } from '@0610studio/zs-ui';
import ScreenScrollView from '../../../src/ui/kit/ScreenScrollView';
import Segmented from '../../../src/ui/kit/Segmented';
import BarAxisReadout from '../../../src/ui/barAxis/BarAxisReadout';
import { useBarAxisSetting } from '../../../src/model/BarAxisSetting';

export default function LabBarAxisArrangement() {
  const { colors } = useTheme();
  const { barAxis, setBarAxis } = useBarAxisSetting();

  return (
    <ScreenScrollView style={{ backgroundColor: colors.surface1 }} contentContainerStyle={styles.content}>
      <Segmented options={['vertical', 'horizontal'] as const} value={barAxis} onValueChange={setBarAxis} testID="lab-bar-axis-control" />
      <BarAxisReadout testIDPrefix="lab-bar-axis" />
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 24,
  },
});
