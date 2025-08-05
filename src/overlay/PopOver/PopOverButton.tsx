import React, { useRef, useCallback } from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useOverlay } from '../../model/useOverlay';
import ZSPressable from '../../ui/ZSPressable';

interface PopOverButtonProps extends ViewProps {
  width: number;
  height: number;
  backgroundColor?: string;
  popOverMenuComponent: React.ReactNode;
}

const PopOverButton: React.FC<PopOverButtonProps> = ({
  width,
  height,
  backgroundColor = 'transparent',
  popOverMenuComponent,
  children,
  ...props
}) => {
  const buttonRef = useRef<View>(null);
  const { showPopOverMenu } = useOverlay();

  const handlePress = useCallback(() => {
    buttonRef.current?.measure((fx, fy, measuredWidth, measuredHeight, pageX, pageY) => {
      if (pageX !== undefined && pageY !== undefined) {
        const rbX = pageX + measuredWidth;
        const rbY = pageY + measuredHeight;

        showPopOverMenu({ px: rbX, py: rbY, component: popOverMenuComponent });
      }
    });
  }, [showPopOverMenu, popOverMenuComponent]);

  return (
    <ZSPressable isAnimation={false} onPress={handlePress} style={styles.pressable}>
      <View
        ref={buttonRef}
        style={[styles.button, { width, height, backgroundColor }]}
        {...props}
      >
        {children}
      </View>
    </ZSPressable>
  );
};

const styles = StyleSheet.create({
  pressable: {
    alignItems: 'flex-start',
  },
  button: {
    justifyContent: 'center',
  },
});

export default PopOverButton;
