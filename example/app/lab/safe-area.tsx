import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ZSScreen, ZSText, useTheme } from '@0610studio/zs-ui';
import CtaButton from '../../src/ui/CtaButton';
import ScreenHeader from '../../src/ui/ScreenHeader';

const ROWS = Array.from({ length: 14 }, (_, index) => index + 1);

export default function LabSafeArea() {
  const { colors } = useTheme();

  return (
    <>
      <ScreenHeader title="Safe Area" background={colors.surface1} />
      <Stack.Screen options={{ headerTransparent: false, headerStyle: { backgroundColor: colors.surface1 } }} />
      <ZSScreen
        style={[styles.container, { backgroundColor: colors.surface1 }]}
        bottomComponent={
          <View style={styles.cta} testID="lab-safe-area-cta">
            <CtaButton
              disabled={false}
              primaryButtonText="하단 CTA"
              onPrimaryButtonPress={() => {}}
              backgroundColor={colors.surface1}
            />
          </View>
        }
      >
        <ContainerInsets />
        {ROWS.map((row) => (
          <View
            key={row}
            style={[styles.row, { backgroundColor: colors.background, borderColor: colors.border }]}
          >
            <ZSText variant="subtitle2" style={[styles.edge, { color: colors.error }]} testID={row === 1 ? 'lab-safe-area-left' : undefined}>
              LEFT EDGE
            </ZSText>
            <ZSText variant="overline" color="textSecondary" style={styles.rowLabel}>{`row ${row}`}</ZSText>
            <ZSText variant="subtitle2" style={[styles.edge, styles.edgeEnd, { color: colors.info }]} testID={row === 1 ? 'lab-safe-area-right' : undefined}>
              RIGHT EDGE
            </ZSText>
          </View>
        ))}
      </ZSScreen>
    </>
  );
}

function ContainerInsets() {
  const insets = useSafeAreaInsets();
  return (
    <ZSText variant="label" color="textSecondary" style={styles.caption} testID="lab-safe-area-insets">
      {`container insets top ${Math.round(insets.top)} · left ${Math.round(insets.left)} · right ${Math.round(insets.right)} · bottom ${Math.round(insets.bottom)}`}
    </ZSText>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    paddingVertical: 12,
  },
  row: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  edge: { flex: 1 },
  edgeEnd: { textAlign: 'right' },
  rowLabel: { flexShrink: 0 },
  caption: { paddingHorizontal: 20 },
  cta: {
    paddingTop: 8,
  },
});
