import React, { memo, useMemo } from 'react';
import { ViewProps, StyleSheet } from 'react-native';
import { useTheme } from '../../model/useThemeProvider';
import AnimatedWrapper from '../atoms/AnimatedWrapper';
import { ShadowLevel } from '../types';
import { ViewColorOptions } from '../../theme';

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

export default memo(ZSView);
