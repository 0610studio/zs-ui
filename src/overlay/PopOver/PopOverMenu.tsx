import React, { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, LayoutChangeEvent, Pressable } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { usePopOver } from "../../model/useOverlay";
import ModalBackground from "../ui/ModalBackground";
import { PopOverMenuProps } from "../../model/types";
import { useTheme } from "../../model";

const WINDOW_HEIGHT = Dimensions.get('window').height;
const WINDOW_WIDTH = Dimensions.get('window').width;

function PopOverMenu({
  px,
  py,
  component
}: PopOverMenuProps): JSX.Element | null {
  const [isContentVisible, setIsContentVisible] = useState<boolean>(false);
  const [contentWidth, setContentWidth] = useState<number>(0);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const { popOverVisible, setPopOverVisible } = usePopOver();
  const timerRef = useRef<number | null>(null);
  const { palette } = useTheme();

  useEffect(() => {
    if (popOverVisible) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        setIsContentVisible(true);
      }, 200);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [popOverVisible]);

  const handleLayout = useCallback((event: LayoutChangeEvent): void => {
    setContentWidth(event.nativeEvent.layout.width || 0);
    setContentHeight(event.nativeEvent.layout.height || 0);
  }, []);

  // 화면 경계를 벗어나는지 확인하고 위치 조정
  const getAdjustedPosition = () => {
    let adjustedX = px;
    let adjustedY = py;

    // 수평 방향 조정
    if (px + contentWidth > WINDOW_WIDTH) {
      adjustedX = WINDOW_WIDTH - contentWidth - 10; // 10px 여백
    }
    if (adjustedX < 0) {
      adjustedX = 10; // 최소 10px 여백
    }

    // 수직 방향 조정
    if (py + contentHeight > WINDOW_HEIGHT) {
      adjustedY = py - contentHeight; // 위쪽으로 표시
    }
    if (adjustedY < 0) {
      adjustedY = 10; // 최소 10px 여백
    }

    return { adjustedX, adjustedY };
  };

  if (!popOverVisible) return null;

  const { adjustedX, adjustedY } = getAdjustedPosition();

  return (
    <ModalBackground
      key={popOverVisible ? 'visiblepo' : 'hiddenpo'}
      modalBgColor={palette.modalBgColor}
      isCenter={false}
      onPress={() => setPopOverVisible(false)}
    >
      {isContentVisible && (
        <Animated.View
          entering={FadeInUp}
          exiting={FadeOutUp}
        >
          <Pressable
            style={{
              position: 'absolute',
              left: adjustedX,
              top: adjustedY,
            }}
            onLayout={handleLayout}
          >
            {component}
          </Pressable>
        </Animated.View>
      )}
    </ModalBackground>
  );
}

export default PopOverMenu;