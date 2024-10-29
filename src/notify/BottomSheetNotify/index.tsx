import React, { forwardRef, useImperativeHandle, useMemo } from 'react';
import { StyleSheet, Dimensions, ViewProps, Keyboard } from 'react-native';
import { GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import useBottomSheetNotify from './model/useBottomSheetNotify';
import { BottomSheetNotifyRef } from './types';
import ContentsComponent from './ui/ContentsComponent';
import { useTheme } from '../../model/useThemeProvider';
import { ThemeBackground } from '../../theme';
import ViewAtom from '../../ui/atoms/ViewAtom';
import { ZSView } from '../../ui';

const DEFAULT_BORDER_RADIUS = 24;
const BS_MAX_HEIGHT = Dimensions.get('window').height - 120;

interface Props extends ViewProps {
  marginBottomBS?: number;
  bottomSheetBackgroundColor?: string;
  bottomSheetPadding?: number;
  closeOffset?: number;
  contentsGestureEnable?: boolean;
  isHandleVisible?: boolean;
  bottomSheetMarginX?: number;
  isBottomRadius?: boolean;
  maxHeight?: number;
  isScrollView?: boolean;
  bottomSheetComponent: React.ReactNode;
  showsVerticalScrollIndicator: boolean;
  headerComponent?: React.ReactNode;
}

function BottomSheetNotify(props: Props, ref: React.Ref<BottomSheetNotifyRef>) {
  const {
    marginBottomBS = 15,
    bottomSheetPadding = 20,
    bottomSheetBackgroundColor,
    closeOffset = Dimensions.get('window').height,
    contentsGestureEnable = true,
    isHandleVisible = true,
    bottomSheetMarginX = 10,
    isBottomRadius = true,
    isScrollView = true,
    maxHeight = BS_MAX_HEIGHT,
    bottomSheetComponent,
    showsVerticalScrollIndicator,
    headerComponent
  } = props;

  const {
    HANDLE_HEIGHT,
    bottomSheetVisible,
    bsAnimatedStyle,
    onGestureEvent,
    handleVisible,
    onTapEvent,
    openPosition,
    screenWidth,
    screenHeight,
    panGestureRef,
    listScrollPosition,
    bsModalBgStyle,
    backgroundPressHandler
  } = useBottomSheetNotify({
    bottomSheetPadding,
    closeOffset,
    contentsGestureEnable,
    bottomSheetMarginX,
    isHandleVisible,
  });

  const { palette: { background } } = useTheme();

  const styles = useMemo(
    () => createStyles({ background }),
    [background]
  );

  useImperativeHandle(ref, () => ({
    handleVisible,
  }));

  return bottomSheetVisible && bottomSheetComponent ? (
    <Animated.View
      style={[styles.modalBg, bsModalBgStyle]}
      entering={FadeIn.duration(50)}
      exiting={FadeOut.duration(50)}
      onTouchEnd={backgroundPressHandler} // 외부 터치 시 시트 닫기
    >
      <GestureHandlerRootView style={styles.rootViewWrapper}>
        <GestureDetector gesture={onGestureEvent}>
          <Animated.View
            onTouchEnd={(e) => {
              e.stopPropagation();
              Keyboard.dismiss(); // 키보드 숨김
            }}
            style={[
              styles.sheet,
              {
                width: screenWidth,
                height: screenHeight,
                paddingHorizontal: bottomSheetPadding,
                left: bottomSheetMarginX,
                right: bottomSheetMarginX,
                borderTopLeftRadius: DEFAULT_BORDER_RADIUS,
                borderTopRightRadius: DEFAULT_BORDER_RADIUS,
                borderBottomLeftRadius: isBottomRadius ? DEFAULT_BORDER_RADIUS : 0,
                borderBottomRightRadius: isBottomRadius ? DEFAULT_BORDER_RADIUS : 0,
                backgroundColor: bottomSheetBackgroundColor || background.base,
              },
              bsAnimatedStyle, // 애니메이션 스타일 적용
            ]}
          >
            {isHandleVisible && (
              <ZSView style={[styles.handleContainer, { height: HANDLE_HEIGHT }]}>
                <ViewAtom style={styles.handle} />
              </ZSView>
            )}

            <GestureDetector gesture={onTapEvent}>
              <ContentsComponent
                HANDLE_HEIGHT={HANDLE_HEIGHT}
                panGestureRef={panGestureRef}
                listScrollPosition={listScrollPosition}
                openPosition={openPosition}
                marginBottomBS={marginBottomBS}
                screenHeight={screenHeight}
                bottomSheetComponent={bottomSheetComponent}
                bottomSheetPadding={bottomSheetPadding}
                maxHeight={maxHeight}
                isScrollView={isScrollView}
                showsVerticalScrollIndicator={showsVerticalScrollIndicator}
                headerComponent={headerComponent}
              />
            </GestureDetector>
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Animated.View>
  ) : null;
}


const createStyles = ({
  background,
}: {
  background: ThemeBackground;
}) =>
  StyleSheet.create({
    modalBg: {
      position: 'absolute',
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
      bottom: 0,
    },
    sheet: {
      position: 'absolute',
      zIndex: 9000,
      overflow: 'hidden',
    },
    handleContainer: {
      width: '100%',
      alignItems: 'center',
      paddingTop: 13,
    },
    handle: {
      backgroundColor: background.layer2,
      width: 50,
      height: 4,
      borderRadius: 2,
    },
    rootViewWrapper: {
      width: '100%',
      height: '100%',
    },
  });

export default forwardRef(BottomSheetNotify);
