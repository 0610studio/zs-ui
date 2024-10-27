import React, { useCallback, useEffect, useMemo } from 'react';
import { Dimensions, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TouchableOpacity, BackHandler } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { AlertActions, ShowAlertProps } from '../../model/types';
import { useNotify } from '../../model/useNotify';
import { useTheme } from '../../model/useThemeProvider';
import { ThemeBackground } from '../../theme';
import { ZSText } from '../../ui';
import ModalBackground from '../ui/ModalBackground';
import ViewAtom from '../../ui/atoms/ViewAtom';

const modalWidth = Dimensions.get('window').width - 60;

function AlertNotify({
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
  const { alertVisible, setAlertVisible } = useNotify();
  const { palette: { background, text, primary: primaryColor } } = useTheme();

  const styles = useMemo(
    () => createStyles({ background }),
    [background, text, primaryColor]
  );

  // 버튼 클릭 핸들러 함수, 콜백 메모이제이션으로 성능 최적화
  const handleButtonPress = useCallback(
    (onPressFunction?: () => void) => () => {
      if (onPressFunction) {
        onPressFunction();
      }
      setAlertVisible(false);
    },
    [setAlertVisible]
  );

  // 뒤로가기 버튼 핸들러 함수
  const backPressHandler = useCallback(() => {
    if (alertVisible) {
      setAlertVisible(false);
      return true;
    }
    return false;
  }, [alertVisible, setAlertVisible]);

  // 뒤로가기 버튼 리스너 설정
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backPressHandler);
    return () => backHandler.remove();
  }, [backPressHandler]);

  // content를 useMemo로 감싸서 불필요한 재렌더링 방지
  const content = useMemo(() => {
    const { primary, secondary } = actions || {} as AlertActions;

    return (
      <Animated.View
        entering={FadeInDown.duration(300)}
        exiting={FadeOutDown.duration(100)}
      >
        <Pressable style={[styles.contentContainer, { width: modalWidth }]}>
          {title && (
            <ZSText typo='title.2' style={[styles.title, titleStyle]}>{title}</ZSText>
          )}
          {informative && (
            <ZSText typo='body.3' style={[styles.informative, informativeStyle]}>{informative}</ZSText>
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
                    <ZSText typo='subTitle.2' style={[secondaryButtonTextStyle]}>{secondary.label}</ZSText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: primaryColor.main }, primaryButtonStyle]}
                    onPress={handleButtonPress(primary?.onPress)}
                  >
                    <ZSText typo='subTitle.2' color='white' style={[secondaryButtonTextStyle]}>{primary?.label}</ZSText>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  onPress={handleButtonPress(primary?.onPress)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: primaryColor.main }, primaryButtonStyle]}
                    onPress={handleButtonPress(primary?.onPress)}
                  >
                    <ZSText typo='subTitle.2' color='white' style={[secondaryButtonTextStyle]}>{primary?.label || '확인'}</ZSText>
                  </TouchableOpacity>
                </TouchableOpacity>
              )}
            </ViewAtom>
          )}
        </Pressable>
      </Animated.View>
    );
  }, [title, informative, actions, handleButtonPress, titleStyle, informativeStyle, secondaryButtonStyle, primaryButtonStyle, secondaryButtonTextStyle, primaryButtonTextStyle, singleButtonTextStyle]);

  return alertVisible ? (
    <ModalBackground onPress={() => { if (isBackgroundTouchClose) setAlertVisible(false); }}>
      <KeyboardAvoidingView
        style={styles.avoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled
      >
        {content}
      </KeyboardAvoidingView>
    </ModalBackground>
  ) : null;
}

export default AlertNotify;

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
      paddingHorizontal: 20
    },
  });

