import React, { forwardRef } from 'react';
import { ScrollView, ScrollViewProps } from 'react-native';

type ScrollViewAtomProps = ScrollViewProps;

const ScrollViewAtom = forwardRef<ScrollView, ScrollViewAtomProps>(function ScrollViewAtom(
  { children, style, ...props }, ref
) {
  return (
    <ScrollView ref={ref} {...props} style={style}>
      {children}
    </ScrollView>
  );
});

export default ScrollViewAtom;
