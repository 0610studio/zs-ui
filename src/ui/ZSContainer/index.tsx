import React, { ReactNode, useState, useEffect } from 'react';
import { ViewProps, KeyboardAvoidingView, StatusBar, StyleSheet, Dimensions, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ViewAtom from '../atoms/ViewAtom';
import ScrollViewAtom from '../atoms/ScrollViewAtom';
import { useTheme } from '../../model/useThemeProvider';

type ZSContainerProps = ViewProps & {
  backgroundColor?: string;
  isLoader?: boolean;
  statusBarColor?: string;
  barStyle?: 'light-content' | 'dark-content';
  edges?: Array<'top' | 'right' | 'bottom' | 'left'>;
  isScrollView?: boolean;
  scrollViewRef?: React.RefObject<ScrollView>;
  topComponent?: ReactNode;
  bottomComponent?: ReactNode;
  showsVerticalScrollIndicator?: boolean;
  loadingComponent?: React.ReactNode;
  keyboardVerticalOffset?: number;
  behavior?: "padding" | "height" | "position" | undefined;
  automaticallyAdjustKeyboardInsets?: boolean;
};

function ZSContainer({
  backgroundColor,
  isLoader = false,
  statusBarColor,
  barStyle = 'dark-content',
  edges = ['top', 'bottom'],
  isScrollView = true,
  scrollViewRef,
  topComponent,
  bottomComponent,
  showsVerticalScrollIndicator = true,
  loadingComponent = <ActivityIndicator />,
  keyboardVerticalOffset,
  behavior,
  automaticallyAdjustKeyboardInsets = true,
  ...props
}: ZSContainerProps) {
  const { palette } = useTheme(); // 테마 사용
  const [isDelayed, setIsDelayed] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDelayed(false);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={[{ backgroundColor: backgroundColor || palette.background.base }, styles.flex1, styles.fullWidth]} edges={edges}>

      {!isDelayed && (
        <KeyboardAvoidingView
          style={[styles.flex1, styles.fullWidth]}
          behavior={behavior}
          keyboardVerticalOffset={keyboardVerticalOffset}
        >
          {topComponent && topComponent}

          {isLoader ? (
            loadingComponent
          ) : isScrollView ? (
            <ScrollViewAtom
              ref={scrollViewRef}
              style={styles.fullWidth}
              bounces={false}
              contentContainerStyle={styles.scrollContainerStyle}
              showsVerticalScrollIndicator={showsVerticalScrollIndicator}
              keyboardShouldPersistTaps="handled"
              automaticallyAdjustKeyboardInsets={automaticallyAdjustKeyboardInsets}
            >
              <ViewAtom style={[styles.flex1, styles.fullWidth, props.style]}>
                {props.children}
              </ViewAtom>
            </ScrollViewAtom>
          ) : (
            <ViewAtom style={[styles.flex1, styles.fullWidth, props.style]}>{props.children}</ViewAtom>
          )}

          {!isLoader && bottomComponent && bottomComponent}
        </KeyboardAvoidingView>
      )}

      <StatusBar barStyle={barStyle} backgroundColor={statusBarColor || palette.background.base} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  fullWidth: { width: Dimensions.get('window').width },
  scrollContainerStyle: { flexGrow: 1, alignItems: 'center', width: Dimensions.get('window').width },
});

export default ZSContainer;
