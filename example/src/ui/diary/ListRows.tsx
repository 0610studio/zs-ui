import type { ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { MIN_TOUCH_TARGET, ZSPressable, ZSText, useTheme, withOpacity } from '@0610studio/zs-ui';
import { GAP, ROW_HEIGHT, ROW_INSET } from '../kit/layout';

const CLEAR = 20;

export function ClearButton({ label, onPress, testID }: { label: string; onPress: () => void; testID: string }) {
  const { colors } = useTheme();
  const target = Platform.OS === 'android' ? MIN_TOUCH_TARGET.android : MIN_TOUCH_TARGET.ios;
  return (
    <ZSPressable
      onPress={onPress}
      radius="full"
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={testID}
      style={[styles.clearTarget, { width: target, height: target, margin: -(target - CLEAR) / 2 }]}
    >
      <View style={[styles.clear, { backgroundColor: withOpacity(colors.textSecondary, 0.4) }]}>
        <Svg width={10} height={10} viewBox="0 0 24 24">
          <Path d="M5 5l14 14M19 5L5 19" stroke={colors.background} strokeWidth={3.4} strokeLinecap="round" />
        </Svg>
      </View>
    </ZSPressable>
  );
}

export function ValueRow({ children, removeLabel, onRemove, alignTop = false, testID }: { children: ReactNode; removeLabel: string; onRemove: () => void; alignTop?: boolean; testID: string }) {
  return (
    <View style={[styles.row, alignTop ? styles.rowTop : null]} testID={testID}>
      <View style={styles.body}>{children}</View>
      <View style={alignTop ? styles.clearTop : null}>
        <ClearButton label={removeLabel} onPress={onRemove} testID={`${testID}-remove`} />
      </View>
    </View>
  );
}

export function AddRow({ label, onPress, testID }: { label: string; onPress: () => void; testID: string }) {
  const { colors } = useTheme();
  return (
    <ZSPressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} testID={testID} style={styles.pressable}>
      <View style={styles.row}>
        <View style={[styles.plus, { backgroundColor: colors.surface3 }]}>
          <Svg width={18} height={18} viewBox="0 0 24 24">
            <Path d="M12 5v14M5 12h14" stroke={colors.textSecondary} strokeWidth={2} strokeLinecap="round" />
          </Svg>
        </View>
        <ZSText variant="subtitle1" color="textSecondary" style={styles.body}>
          {label}
        </ZSText>
      </View>
    </ZSPressable>
  );
}

const styles = StyleSheet.create({
  pressable: { marginHorizontal: -ROW_INSET, paddingHorizontal: ROW_INSET },
  row: { width: '100%', minHeight: ROW_HEIGHT.single, flexDirection: 'row', alignItems: 'center', gap: GAP.md, paddingVertical: GAP.md },
  rowTop: { alignItems: 'flex-start', paddingVertical: GAP.lg },
  clearTop: { marginTop: 1 },
  body: { flexGrow: 1, flexShrink: 1 },
  plus: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  clearTarget: { alignItems: 'center', justifyContent: 'center' },
  clear: { width: CLEAR, height: CLEAR, borderRadius: CLEAR / 2, alignItems: 'center', justifyContent: 'center' },
});
