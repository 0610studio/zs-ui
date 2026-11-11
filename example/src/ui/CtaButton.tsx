import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import { OPACITY, useTheme, withOpacity, ZSPressable, ZSText } from '@0610studio/zs-ui';

interface CtaButtonProps {
  primaryButtonText: string;
  onPrimaryButtonPress: () => void;
  disabled?: boolean;
  backgroundColor?: string;
  bottomComponent?: React.ReactNode;
  secondaryButtonText?: string;
  onSecondaryButtonPress?: () => void;
  onDisabledPress?: () => void;
}

function CtaButton({
  onPrimaryButtonPress,
  primaryButtonText,
  disabled = false,
  backgroundColor,
  bottomComponent,
  secondaryButtonText,
  onSecondaryButtonPress,
  onDisabledPress,
}: CtaButtonProps) {
  const { colors } = useTheme();
  const ctaBackgroundColor = backgroundColor || colors.surface1;

  return (
    <View style={[styles.container, { backgroundColor: ctaBackgroundColor }]}>
      <View style={styles.buttonContainer}>
        <View style={styles.rowContainer}>
          {
            secondaryButtonText && (
              <ZSPressable hitSlop={5} style={styles.leftSubButton} onPress={() => { onSecondaryButtonPress?.() }}>
                <ZSText variant='body2' color='textSecondary'>{secondaryButtonText}</ZSText>
              </ZSPressable>
            )
          }

          <View style={styles.flex1}>
            <ZSPressable
              style={styles.button}
              radius="full"
              backgroundColor={disabled ? withOpacity(colors.text, OPACITY.disabledBackground) : 'primary'}
              onPress={() => {
                if (disabled) {
                  onDisabledPress?.();
                } else {
                  onPrimaryButtonPress();
                }
              }}>
              <ZSText variant='subtitle1' emphasized color={disabled ? withOpacity(colors.text, OPACITY.disabled) : 'onPrimary'}>{primaryButtonText}</ZSText>
            </ZSPressable>
          </View>
        </View>

        {bottomComponent}
      </View>

      <LinearGradient
        pointerEvents="none"
        style={styles.background}
        colors={[`${ctaBackgroundColor}00`, `${ctaBackgroundColor}dd`, ctaBackgroundColor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  container: { width: '100%', paddingBottom: 10 },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    width: '100%',
  },
  leftSubButton: {
    paddingVertical: 16,
    paddingHorizontal: 28,
  },
  buttonContainer: {
    width: '100%',
    paddingTop: 15,
    flexDirection: 'column',
    paddingHorizontal: 20,
  },
  button: {
    width: '100%',
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  background: {
    width: '100%',
    height: 20,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    marginTop: -19,
  },
});

export default CtaButton;
