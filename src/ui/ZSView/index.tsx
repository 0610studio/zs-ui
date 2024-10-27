import React, { memo, useMemo } from 'react';
import { ViewProps, StyleSheet } from 'react-native';
import { useTheme } from '../../model/useThemeProvider';
import AnimatedWrapper from '../atoms/AnimatedWrapper';

type Props = ViewProps & {
  isAnimation?: boolean;
};

const ZSView: React.FC<Props> = ({ isAnimation = false, style, children, ...rest }) => {
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
    <AnimatedWrapper isAnimation={isAnimation} style={[styles.container, style]} {...rest}>
      {children}
    </AnimatedWrapper>
  );
};

export default memo(ZSView);
