import React, { useRef, useCallback } from 'react';
import { View, Pressable, ViewProps, StyleSheet } from 'react-native';
import { useNotify } from '../../model/useNotify';

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
  const { showPopOverMenu } = useNotify();

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
    <Pressable onPress={handlePress} style={styles.pressable}>
      <View
        ref={buttonRef}
        style={[styles.button, { width, height, backgroundColor }]}
        {...props}
      >
        {children}
      </View>
    </Pressable>
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
