import React, { useMemo } from 'react';
import { ViewProps, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import AnimatedWrapper from '../atoms/AnimatedWrapper';
import { ViewColorOptions, ShadowLevel } from '../../theme/types';

type Props = ViewProps & {
  isAnimation?: boolean;
  elevationLevel?: ShadowLevel;
  color?: ViewColorOptions;
};

const ZSView: React.FC<Props> = ({ isAnimation = false, elevationLevel = 0, style, children, color, ...rest }) => {
  const { palette } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          backgroundColor: palette.background.base,
        },
      }),
    [palette.background.base],
  );

  return (
    <AnimatedWrapper color={color} isAnimation={isAnimation} elevationLevel={elevationLevel} style={[styles.container, style]} {...rest}>
      {children}
    </AnimatedWrapper>
  );
};

export default ZSView;
