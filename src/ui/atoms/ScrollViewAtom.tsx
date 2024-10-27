import React, { forwardRef } from 'react';
import { ScrollView, ScrollViewProps } from 'react-native';

type ScrollViewAtomProps = ScrollViewProps;

// scrollViewRef를 제거하고 ref로 대체합니다.
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
