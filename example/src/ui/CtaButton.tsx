import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import { useCallback } from 'react';
import { useStyleSheetCreate, useTheme } from 'zs-ui/model';
import { Theme, useOverlay, ZSPressable, ZSText } from 'zs-ui';

interface CtaButtonProps {
  type?: 'single' | 'leftSubTitle' | 'bottomSubTitle';
  backgroundColor?: string;
  // ------------------------------
  primaryButtonText: string;
  onPrimaryButtonPress: () => void;
  secondaryButtonText?: string;
  onSecondaryButtonPress?: () => void;
  // ------------------------------
  disabled?: boolean;
  disabledPressText?: string;
}

function CtaButton({
  onPrimaryButtonPress,
  onSecondaryButtonPress,
  primaryButtonText,
  secondaryButtonText,
  type = 'single',
  disabled,
  backgroundColor,
  disabledPressText,
}: CtaButtonProps) {
  const styles = useStyleSheetCreate(createStyles);
  const { palette } = useTheme();
  const ctaBackgroundColor = backgroundColor || palette.background.base;
  const { showSnackBar } = useOverlay();

  const disabledPress = useCallback(() => {
    if (disabled) {
      showSnackBar({ type: 'error', message: disabledPressText || '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled, disabledPressText]);

  return (
    <View style={[styles.container, { backgroundColor: ctaBackgroundColor }]}>
      <View style={styles.buttonContainer}>
        <View style={styles.rowContainer}>
          {
            type === 'leftSubTitle' && secondaryButtonText && (
              <ZSPressable hitSlop={5} style={styles.leftSubButton} onPress={onSecondaryButtonPress}>
                <ZSText typo='label.1' color='secondary'>{secondaryButtonText}</ZSText>
              </ZSPressable>
            )
          }

          <View style={styles.flex1}>
            <ZSPressable style={styles.button} onPress={disabled ? disabledPress : onPrimaryButtonPress} color={disabled ? 'grey.30' : 'primary'}>
              <ZSText typo='subTitle.1' color={disabled ? 'grey.70' : 'white'}>{primaryButtonText}</ZSText>
            </ZSPressable>
          </View>
        </View>

        {
          type === 'bottomSubTitle' && secondaryButtonText && (
            <ZSPressable style={styles.bottomSubTitle} onPress={onSecondaryButtonPress}>
              <ZSText typo='label.1' color='secondary'>{secondaryButtonText}</ZSText>
            </ZSPressable>
          )
        }
      </View>

      <LinearGradient
        style={styles.background}
        colors={['#ffffff00', ctaBackgroundColor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
    </View>
  );
}

const createStyles = (palette: Theme) => StyleSheet.create({
  flex1: { flex: 1 },
  checkBoxTextStyle: { marginTop: -2 },
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
    paddingHorizontal: 16,
    paddingTop: 15,
    flexDirection: 'column',
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
    height: 30,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    marginTop: -30,
  },
  bottomSubTitle: {
    paddingVertical: 8,
    marginTop: 5,
    paddingHorizontal: 14,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBoxContainer: {
    paddingVertical: 8,
    marginTop: 5,
    paddingHorizontal: 14,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
});

export default CtaButton;
