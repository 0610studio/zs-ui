import React, { useCallback, useEffect, useRef, useState } from "react";
import { LayoutChangeEvent, Pressable, useWindowDimensions } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { usePopOver } from "../../model/useOverlay";
import { BackPriority, useBackHandler } from "../../context/BackHandlerContext";
import ModalBackground from "../ui/ModalBackground";
import { PopOverMenuProps } from "../../model/types";
import { useTheme } from "../../context/ThemeContext";
import { Z_INDEX_VALUE } from "../../model/utils";

const MINIMUM_OFFSET = 10;

function PopOverMenu({
  px,
  py,
  component
}: PopOverMenuProps): React.ReactElement | null {
  const { palette } = useTheme();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [isContentVisible, setIsContentVisible] = useState<boolean>(false);
  const [contentWidth, setContentWidth] = useState<number>(0);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const { popOverVisible, setPopOverVisible } = usePopOver();
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (popOverVisible) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        setIsContentVisible(true);
      }, 200);
    } else {
      setIsContentVisible(false);
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

  useBackHandler(
    () => {
      setPopOverVisible(false);
      return true;
    },
    { enabled: popOverVisible, priority: BackPriority.OVERLAY }
  );

  const getAdjustedPosition = () => {
    let adjustedX = px - contentWidth;
    let adjustedY = py;

    // 오른쪽 화면 이탈 시 메뉴 오른쪽 끝을 화면 안으로 클램프
    if (adjustedX + contentWidth > windowWidth - MINIMUM_OFFSET) {
      adjustedX = windowWidth - contentWidth - MINIMUM_OFFSET;
    }
    if (adjustedX < 0) {
      adjustedX = MINIMUM_OFFSET;
    }

    // 아래쪽 화면 이탈 시 앵커 위쪽으로 플립
    if (py + contentHeight > windowHeight) {
      adjustedY = py - contentHeight - MINIMUM_OFFSET;
    }
    if (adjustedY < 0) {
      adjustedY = MINIMUM_OFFSET;
    }

    return { adjustedX, adjustedY };
  };

  if (!popOverVisible) return null;

  const { adjustedX, adjustedY } = getAdjustedPosition();

  return (
    <ModalBackground
      zIndex={Z_INDEX_VALUE.POPOVER}
      key={popOverVisible ? 'visiblepo' : 'hiddenpo'}
      modalBgColor={palette.modalBgColor}
      position='pop'
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
