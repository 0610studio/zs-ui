import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import { useTheme, ZSPressable, ZSText } from 'zs-ui';

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
  const { palette } = useTheme();
  const ctaBackgroundColor = backgroundColor || palette.background.base;

  return (
    <View style={[styles.container, { backgroundColor: ctaBackgroundColor }]}>
      <View style={styles.buttonContainer}>
        <View style={styles.rowContainer}>
          {
            secondaryButtonText && (
              <ZSPressable hitSlop={5} style={styles.leftSubButton} onPress={() => { onSecondaryButtonPress?.() }}>
                <ZSText typo='label.1' color='secondary'>{secondaryButtonText}</ZSText>
              </ZSPressable>
            )
          }

          <View style={styles.flex1}>
            <ZSPressable
              style={styles.button}
              color={disabled ? 'grey.30' : 'primary'}
              onPress={() => {
                if (disabled) {
                  onDisabledPress?.();
                } else {
                  onPrimaryButtonPress();
                }
              }}>
              <ZSText typo='subTitle.1' color={disabled ? 'grey.70' : 'white'}>{primaryButtonText}</ZSText>
            </ZSPressable>
          </View>
        </View>

        {bottomComponent && bottomComponent}
      </View>

      <LinearGradient
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
    paddingHorizontal: 14,
  },
  button: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 14,
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
