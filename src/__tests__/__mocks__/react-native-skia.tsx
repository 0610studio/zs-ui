import React from 'react';
import { View } from 'react-native';

const stub = (name: string) =>
  function SkiaStub(props: any) {
    return <View {...props} testID={props.testID ?? `skia-${name}`}>{props.children}</View>;
  };

export const Canvas = stub('canvas');
export const Group = stub('group');
export const RoundedRect = stub('rounded-rect');
export const Rect = stub('rect');
export const SweepGradient = stub('sweep-gradient');
export const LinearGradient = stub('linear-gradient');
export const Blur = stub('blur');
export const vec = (x: number, y: number) => ({ x, y });
