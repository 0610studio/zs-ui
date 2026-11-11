import React from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SurfaceContext, useSurface } from '../../context/SurfaceContext';
import { useTheme } from '../../context/ThemeContext';
import { contrastRatio, resolveColor, type ColorMode, type ColorName, type ThemeColors } from '../../theme/color';
import { radiusStyle, type RadiusToken } from '../../theme/radius';
import { SHADOW, type ShadowStyles, type ShadowToken } from '../../theme/shadow';
import { CONTENT_INSET, SPACE } from '../../theme/spacing';
import { OPACITY } from '../../theme/state';
import ZSPressable from '../ZSPressable';

export type ZSCardVariant = 'elevated' | 'filled' | 'outlined';

export interface ZSCardProps {
  children?: React.ReactNode;
  variant?: ZSCardVariant;
  onPress?: () => void;
  onLongPress?: () => void;
  actions?: React.ReactNode;
  cornerAction?: React.ReactNode;
  disabled?: boolean;
  radius?: RadiusToken;
  backgroundColor?: ColorName | (string & {});
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

const CARD_SHADOW: ShadowToken = 'sm';
const MIN_BOX_SHADOW_API = 28;

const FILLED_TIERS = ['surface2', 'surface3', 'surface4', 'surface5'] as const;

// filled 는 바탕보다 짙은 면 — 페이지 배경 위 surface2 만큼은 갈리도록, 바탕보다 윗단계 중 가장 가까운 것을 고른다
function filledSurface(colors: ThemeColors, ground: string): string {
  const target = contrastRatio(colors.background, colors.surface2);
  const above = FILLED_TIERS.slice(FILLED_TIERS.findIndex((tier) => colors[tier] === ground) + 1);
  const pick = above.find((tier) => contrastRatio(colors[tier], ground) >= target);
  if (pick) return colors[pick];
  return FILLED_TIERS.map((tier) => colors[tier]).reduce((best, color) => (contrastRatio(color, ground) > contrastRatio(best, ground) ? color : best));
}

function surfaceFor(colors: ThemeColors, mode: ColorMode, variant: ZSCardVariant, ground: string): string {
  if (variant === 'elevated') return mode === 'dark' ? colors.surface3 : colors.surface1;
  if (variant === 'filled') return filledSurface(colors, ground);
  return colors.background;
}

function cardShadow(shadows: ShadowStyles): ViewStyle {
  if (Platform.OS === 'android' && Number(Platform.Version) < MIN_BOX_SHADOW_API) return { elevation: SHADOW[CARD_SHADOW] };
  return shadows[CARD_SHADOW];
}

function ZSCard({
  children,
  variant = 'elevated',
  onPress,
  onLongPress,
  actions,
  cornerAction,
  disabled = false,
  radius = 'lg',
  backgroundColor,
  style,
  contentStyle,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: ZSCardProps) {
  const { colors, mode, shadows } = useTheme();
  const ground = useSurface() ?? colors.background;
  const pressable = onPress !== undefined || onLongPress !== undefined;
  const surface = resolveColor(colors, backgroundColor) ?? surfaceFor(colors, mode, variant, ground);

  const frameStyle = [
    radiusStyle(radius),
    styles.frame,
    { backgroundColor: surface },
    variant === 'outlined' ? { borderWidth: 1, borderColor: colors.border } : null,
    variant === 'elevated' ? cardShadow(shadows) : null,
    disabled ? { opacity: OPACITY.disabledView } : null,
    style,
  ];

  const body = pressable ? (
    <ZSPressable
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      style={[styles.content, disabled ? styles.opaque : null, contentStyle]}
    >
      {children}
    </ZSPressable>
  ) : (
    <View style={[styles.content, contentStyle]}>{children}</View>
  );

  return (
    <SurfaceContext.Provider value={surface}>
    <View testID={testID} style={frameStyle}>
      {body}
      {actions != null ? (
        <View testID={testID ? `${testID}-actions` : undefined} pointerEvents={disabled ? 'none' : 'auto'} style={styles.actions}>
          {actions}
        </View>
      ) : null}
      {cornerAction != null ? (
        <View testID={testID ? `${testID}-corner` : undefined} pointerEvents={disabled ? 'none' : 'box-none'} style={styles.corner}>
          {cornerAction}
        </View>
      ) : null}
    </View>
    </SurfaceContext.Provider>
  );
}

export default React.memo(ZSCard);

const styles = StyleSheet.create({
  frame: { overflow: 'hidden' },
  content: { flexGrow: 1, padding: CONTENT_INSET },
  opaque: { opacity: 1 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center', gap: SPACE.sm, paddingHorizontal: CONTENT_INSET, paddingBottom: CONTENT_INSET },
  corner: { position: 'absolute', top: SPACE.sm, end: SPACE.sm },
});
