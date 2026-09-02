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

export const Picture = stub('picture');
export const Paint = stub('paint');
export const Circle = stub('circle');
export const Path = stub('path');
export const Text = stub('text');

/** 몇 번 그렸는지 테스트에서 확인하는 용도 */
export const drawCalls: string[] = [];

const makePaint = () => ({
  setAntiAlias: () => undefined,
  setColor: () => undefined,
  setStyle: () => undefined,
  setStrokeWidth: () => undefined,
  setAlphaf: () => undefined,
  getAlphaf: () => 1,
  setMaskFilter: () => undefined,
});

export const BlurStyle = { Normal: 0, Solid: 1, Outer: 2, Inner: 3 };

const makePath = () => ({ addRect: () => undefined });

export const Skia = {
  Paint: makePaint,
  Path: { Make: makePath },
  Color: (value: string) => value,
  XYWHRect: (x: number, y: number, width: number, height: number) => ({ x, y, width, height }),
  RRectXY: (rect: { x: number; y: number; width: number; height: number }, rx: number, ry: number) => ({ rect, rx, ry }),
  MaskFilter: { MakeBlur: () => ({ __maskFilter: true }) },
};

const makeCanvas = () => ({
  drawRect: () => drawCalls.push('rect'),
  drawCircle: () => drawCalls.push('circle'),
  drawRRect: () => drawCalls.push('rrect'),
  drawText: () => drawCalls.push('text'),
  save: () => undefined,
  restore: () => undefined,
  translate: () => undefined,
});

export const createPicture = (callback: (canvas: ReturnType<typeof makeCanvas>) => void) => {
  callback(makeCanvas());
  return { __picture: true };
};

const makeFont = (size: number) => ({
  measureText: (text: string) => ({ x: 0, y: -size, width: text.length * size * 0.6, height: size }),
  getTextWidth: (text: string) => text.length * size * 0.6,
});

export const matchFont = (style?: { fontSize?: number }) => makeFont(style?.fontSize ?? 14);
export const useFonts = () => null;
