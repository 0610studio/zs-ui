import React, { useCallback, useMemo } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { AlertActions, ShowAlertProps } from '../../model/types';
import { useAlert } from '../../model/useOverlay';
import { useTheme } from '../../model/useThemeProvider';
import { ThemeBackground } from '../../theme';
import ModalBackground from '../ui/ModalBackground';
import ViewAtom from '../../ui/atoms/ViewAtom';
import { MAX_OVERLAY_WIDTH, Z_INDEX_VALUE } from '../../model/utils';
import ZSText from '../../ui/ZSText';

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
}: ShowAlertProps) {
  const { alertVisible, setAlertVisible } = useAlert();
  const { palette: { background, primary: primaryColor, modalBgColor }, dimensions: { width: windowWidth } } = useTheme();
  const styles = useMemo(() => createStyles({ background }), [background]);
  const modalWidth = windowWidth - 60;
  const { primary, secondary } = actions || {} as AlertActions;

  const handleButtonPress = useCallback((onPressFunction?: () => void) => () => {
    if (onPressFunction) onPressFunction();
    setAlertVisible(false);
  }, [setAlertVisible]);

  return (
    !alertVisible ? null :
      <ModalBackground
        zIndex={Z_INDEX_VALUE.ALERT}
        key={alertVisible ? 'visibleao' : 'hiddenao'}
        modalBgColor={modalBgColor}
        onPress={() => { if (isBackgroundTouchClose) setAlertVisible(false); }}
      >
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
      </ModalBackground>
  )
}

export default AlertOverlay;

const createStyles = ({ background }: { background: ThemeBackground; }) =>
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
      maxWidth: MAX_OVERLAY_WIDTH,
    },
  });

