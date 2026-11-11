import { useCallback, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';

const settle = (prev: number, next: number): number => (Math.abs(prev - next) < 0.5 ? prev : next);

export function useContainerSize({ measureHeight = false }: { measureHeight?: boolean } = {}): {
  width: number;
  height: number;
  onLayout: (event: LayoutChangeEvent) => void;
} {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width: nextWidth, height: nextHeight } = event.nativeEvent.layout;
      setWidth((prev) => settle(prev, nextWidth));
      if (measureHeight) setHeight((prev) => settle(prev, nextHeight));
    },
    [measureHeight],
  );

  return { width, height: measureHeight ? height : 0, onLayout };
}
