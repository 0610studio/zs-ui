import React from 'react';
import { Text, TextProps } from 'react-native';

type TextAtomProps = TextProps & {
};

function TextAtom({ children, ...props }: TextAtomProps) {
  return (
    <Text {...props}>
      {children}
    </Text>
  );
}

export default TextAtom;
