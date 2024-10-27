import React from 'react';
import { View, ViewProps } from 'react-native';

type ViewAtomProps = ViewProps & {
};

function ViewAtom({ children, ...props }: ViewAtomProps) {
  return (
    <View {...props}>
      {children}
    </View>
  );
}

export default ViewAtom;
