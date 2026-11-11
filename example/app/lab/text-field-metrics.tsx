import { PixelRatio, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ZSScreen, ZSText, ZSTextField, useTheme, type ZSTextFieldVariant } from '@0610studio/zs-ui';
import ScreenHeader from '../../src/ui/ScreenHeader';

const VARIANTS: ZSTextFieldVariant[] = ['outlined', 'inbox', 'underline'];
const SAMPLE = 'Hg이름';

export default function LabTextFieldMetrics() {
  const { colors } = useTheme();
  const { fontScale } = useWindowDimensions();
  const { variant: param } = useLocalSearchParams<{ variant?: string }>();
  const variant = VARIANTS.includes(param as ZSTextFieldVariant) ? (param as ZSTextFieldVariant) : 'outlined';

  return (
    <>
      <ScreenHeader title="TextField Metrics" />
      <ZSScreen style={[styles.container, { backgroundColor: colors.surface1 }]}>
        <ZSText variant="label" color="textSecondary" testID="metric-variant">{`variant ${variant} · fontScale ${fontScale.toFixed(3)} · px ${PixelRatio.get()}`}</ZSText>
        <View style={styles.fields}>
          <ZSTextField variant={variant} label={SAMPLE} defaultValue="" testID="metric-rest" />
          <ZSTextField variant={variant} label={SAMPLE} defaultValue={SAMPLE} testID="metric-filled" />
        </View>
      </ZSScreen>
    </>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16, paddingTop: 24, paddingBottom: 48, paddingHorizontal: 20 },
  fields: { gap: 40 },
});
