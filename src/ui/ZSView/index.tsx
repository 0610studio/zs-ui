import React from 'react';
import { StyleSheet, ViewProps } from 'react-native';
import { useStyleSheetCreate } from '../../model/useStyleSheetCreate';
import AnimatedWrapper from '../atoms/AnimatedWrapper';
import { ViewColorOptions, ShadowLevel } from '../../theme/types';

type Props = ViewProps & {
  isAnimation?: boolean;
  elevationLevel?: ShadowLevel;
  color?: ViewColorOptions;
};

function ZSView({ isAnimation = false, elevationLevel = 0, style, children, color, ...rest }: Props) {
  const styles = useStyleSheetCreate((palette) =>
    StyleSheet.create({
      container: {
        backgroundColor: palette.background.base,
      },
    }),
  );

  return (
    <AnimatedWrapper color={color} isAnimation={isAnimation} elevationLevel={elevationLevel} style={[styles.container, style]} {...rest}>
      {children}
    </AnimatedWrapper>
  );
}

export default React.memo(ZSView);
