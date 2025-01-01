import React, { useCallback, useMemo } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { AlertActions, ShowAlertProps } from '../../model/types';
import { useOverlay } from '../../model/useOverlay';
import { useTheme } from '../../model/useThemeProvider';
import { ThemeBackground } from '../../theme';
import { ZSText } from '../../ui';
import ModalBackground from '../ui/ModalBackground';
import ViewAtom from '../../ui/atoms/ViewAtom';

const modalWidth = Dimensions.get('window').width - 60;

function AlertOverlay({
  actions,
  title,
  informative,
  isBackgroundTouchClose,
  titleStyle,
  informativeStyle,
  secondaryButtonStyle,
  primaryButtonStyle,
  secondaryButtonTextStyle,
  primaryButtonTextStyle,
  singleButtonTextStyle,
}: ShowAlertProps) {
  const { alertVisible, setAlertVisible } = useOverlay();
  const { palette: { background, text, primary: primaryColor } } = useTheme();

  const styles = useMemo(
    () => createStyles({ background }),
    [background, text, primaryColor]
  );

  const handleButtonPress = useCallback(
    (onPressFunction?: () => void) => () => {
      if (onPressFunction) {
        onPressFunction();
      }
      setAlertVisible(false);
    },
    [setAlertVisible]
  );

  const content = useMemo(() => {
    const { primary, secondary } = actions || {} as AlertActions;

    return (
      <Animated.View
        entering={FadeInDown.duration(300)}
        exiting={FadeOutDown.duration(100)}
        style={[styles.contentContainer, { width: modalWidth }]}
      >
        {title && (
          <ZSText typo='subTitle.1' style={[styles.title, titleStyle]}>{title}</ZSText>
        )}
        {informative && (
          <ZSText typo='body.2' style={[styles.informative, informativeStyle]}>{informative}</ZSText>
        )}
        {actions && (
          <ViewAtom style={styles.buttonContainer}>
            {secondary ? (
              <>
                <TouchableOpacity
                  style={[
                    styles.button,
                    { backgroundColor: background.neutral, marginRight: 8 },
                    secondaryButtonStyle
                  ]}
                  onPress={handleButtonPress(secondary?.onPress)}
                >
                  <ZSText typo='label.2' style={[secondaryButtonTextStyle]}>{secondary.label}</ZSText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, { backgroundColor: primaryColor.main }, primaryButtonStyle]}
                  onPress={handleButtonPress(primary?.onPress)}
                >
                  <ZSText typo='label.2' color='white' style={[secondaryButtonTextStyle]}>{primary?.label || '확인'}</ZSText>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: primaryColor.main }, primaryButtonStyle]}
                onPress={handleButtonPress(primary?.onPress)}
              >
                <ZSText typo='label.2' color='white' style={[secondaryButtonTextStyle]}>{primary?.label || '확인'}</ZSText>
              </TouchableOpacity>
            )}
          </ViewAtom>
        )}
      </Animated.View>
    );
  }, [title, informative, actions, handleButtonPress, titleStyle, informativeStyle, secondaryButtonStyle, primaryButtonStyle, secondaryButtonTextStyle, primaryButtonTextStyle, singleButtonTextStyle]);

  return alertVisible ? (
    <ModalBackground onPress={() => { if (isBackgroundTouchClose) setAlertVisible(false); }}>
      {content}
    </ModalBackground>
  ) : null;
}

export default AlertOverlay;

const createStyles = ({
  background,
}: {
  background: ThemeBackground;
}) =>
  StyleSheet.create({
    title: {
      marginBottom: 8,
      width: '100%',
      paddingHorizontal: 4
    },
    informative: {
      marginTop: 8,
      width: '100%',
      paddingHorizontal: 4
    },
    buttonContainer: {
      flexDirection: 'row',
      width: '100%',
      marginTop: 24,
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    button: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 14,
      borderRadius: 12,
    },
    avoidingView: {
      flex: 1,
      justifyContent: 'center'
    },
    contentContainer: {
      alignItems: 'center',
      backgroundColor: background.base,
      borderRadius: 22,
      paddingBottom: 18,
      paddingTop: 24,
      paddingHorizontal: 20,
      position: 'absolute',
      top: '35%',
    },
  });

