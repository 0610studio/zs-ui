import type { ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { MIN_TOUCH_TARGET, ZSPressable, ZSText, useTheme, withOpacity } from '@0610studio/zs-ui';
import ContentIcon from '../kit/ContentIcon';
import { GAP, ROW_HEIGHT, ROW_INSET } from '../kit/layout';

const LEAD = 36;
const CLEAR = 20;

type Props = {
  title: string;
  value?: string;
  placeholder: string;
  leading?: ReactNode | 'plus';
  onPress: () => void;
  onClear?: () => void;
  required?: boolean;
  enabled?: boolean;
  testID: string;
};

export default function PickRow({ title, value, placeholder, leading, onPress, onClear, required = false, enabled = true, testID }: Props) {
  const { colors } = useTheme();
  const target = Platform.OS === 'android' ? MIN_TOUCH_TARGET.android : MIN_TOUCH_TARGET.ios;
  return (
    <ZSPressable
      onPress={onPress}
      disabled={!enabled}
      accessibilityRole="button"
      accessibilityLabel={`${title}${required ? ' 필수' : ''}, ${value ?? placeholder}`}
      testID={testID}
      style={styles.pressable}
    >
      <View style={styles.row}>
        {leading === 'plus' ? (
          <View style={[styles.lead, { backgroundColor: colors.surface3 }]}>
            <Svg width={18} height={18} viewBox="0 0 24 24">
              <Path d="M12 5v14M5 12h14" stroke={colors.textSecondary} strokeWidth={2} strokeLinecap="round" />
            </Svg>
          </View>
        ) : leading ? (
          <View style={[styles.lead, { backgroundColor: colors.background }]}>{leading}</View>
        ) : null}
        <View style={styles.text}>
          <ZSText variant="subtitle1">
            {title}
            {required ? (
              <ZSText variant="caption" emphasized color="error">
                {'  필수'}
              </ZSText>
            ) : null}
          </ZSText>
          <ZSText variant="body2" color={value ? 'text' : 'textSecondary'} emphasized={!!value}>
            {value ?? placeholder}
          </ZSText>
        </View>
        {value && onClear ? (
          <ZSPressable
            onPress={onClear}
            radius="full"
            accessibilityRole="button"
            accessibilityLabel={`${title} 지우기`}
            testID={`${testID}-clear`}
            style={[styles.clearTarget, { width: target, height: target, margin: -(target - CLEAR) / 2 }]}
          >
            <View style={[styles.clear, { backgroundColor: withOpacity(colors.textSecondary, 0.4) }]}>
              <Svg width={10} height={10} viewBox="0 0 24 24">
                <Path d="M5 5l14 14M19 5L5 19" stroke={colors.background} strokeWidth={3.4} strokeLinecap="round" />
              </Svg>
            </View>
          </ZSPressable>
        ) : null}
        {enabled ? <ContentIcon name="chevronRight" size={20} color={colors.textSecondary} /> : null}
      </View>
    </ZSPressable>
  );
}

const styles = StyleSheet.create({
  pressable: { marginHorizontal: -ROW_INSET, paddingHorizontal: ROW_INSET },
  row: { width: '100%', minHeight: ROW_HEIGHT.double, flexDirection: 'row', alignItems: 'center', gap: GAP.md, paddingVertical: GAP.md },
  lead: { width: LEAD, height: LEAD, borderRadius: LEAD / 2, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  text: { flexGrow: 1, flexShrink: 1, gap: GAP.xxs },
  clearTarget: { alignItems: 'center', justifyContent: 'center' },
  clear: { width: CLEAR, height: CLEAR, borderRadius: CLEAR / 2, alignItems: 'center', justifyContent: 'center' },
});
