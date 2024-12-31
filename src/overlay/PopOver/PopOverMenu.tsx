import React, { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, LayoutChangeEvent, Pressable } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { useOverlay } from "../../model/useOverlay";
import ModalBackground from "../ui/ModalBackground";
import { PopOverMenuProps } from "../../model/types";

// 화면 높이 가져오기
const WINDOW_HEIGHT = Dimensions.get('window').height;

function PopOverMenu({
  px,
  py,
  component
}: PopOverMenuProps): JSX.Element | null {
  const [isContentVisible, setIsContentVisible] = useState<boolean>(false);
  const [contentWidth, setContentWidth] = useState<number>(0);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const { popOverVisible, setPopOverVisible } = useOverlay();
  const timerRef = useRef<number | null>(null);

  // 레이아웃 크기 계산
  const handleLayout = useCallback((event: LayoutChangeEvent): void => {
    setContentWidth(event.nativeEvent.layout.width || 0);
    setContentHeight(event.nativeEvent.layout.height || 0);
  }, []);

  // PopOver가 보일 때 콘텐츠를 딜레이 후 보여줌
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

  // 화면 크기에 따른 위치 조정
  const isVerticalOverflow = WINDOW_HEIGHT < (py + contentHeight);
  const isHorizontalOverflow = Dimensions.get('window').width > (px + contentWidth);

  if (!popOverVisible) return null;

  return (
    <ModalBackground isCenter={false} onPress={() => setPopOverVisible(false)}>
      {isContentVisible && (
        <Animated.View
          entering={FadeInUp}
          exiting={FadeOutUp}
        >
          {/* PopOver의 위치를 세밀하게 조정 */}
          <Pressable
            style={{
              position: 'absolute',
              top: py - (isVerticalOverflow ? (contentHeight + 10) : 0),
              left: px - contentWidth + (isHorizontalOverflow ? contentWidth : 0),
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
