import React from 'react';
import { Text, TextProps } from 'react-native';

function TextAtom({ children, ...props }: TextProps) {
  return (
    <Text {...props}>
      {children}
    </Text>
  );
}

export default TextAtom;
