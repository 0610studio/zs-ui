import React from 'react';
import { View, ViewProps } from 'react-native';

function ViewAtom({ children, ...props }: ViewProps) {
  return (
    <View {...props}>
      {children}
    </View>
  );
}

export default ViewAtom;
