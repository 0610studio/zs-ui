import { createContext, useContext, useEffect, useId } from 'react';
import type { HostInstance, TextLayoutEvent } from 'react-native';

export type TextLayoutLine = TextLayoutEvent['nativeEvent']['lines'][number];

export interface ShimmerShape {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
}

export interface SkeletonShapeRegistry {
  reportText: (key: string, node: HostInstance, lines: readonly TextLayoutLine[]) => void;
  remove: (key: string) => void;
}

export const SkeletonShapeContext = createContext<SkeletonShapeRegistry | null>(null);

export function useSkeletonTextLayout(onTextLayout?: (event: TextLayoutEvent) => unknown) {
  const registry = useContext(SkeletonShapeContext);
  const key = useId();
  useEffect(() => (registry ? () => registry.remove(key) : undefined), [registry, key]);
  if (!registry) return onTextLayout;
  return (event: TextLayoutEvent) => {
    onTextLayout?.(event);
    const node = event.currentTarget;
    if (typeof node !== 'number') registry.reportText(key, node, event.nativeEvent.lines);
  };
}

export function lineShapes(lines: readonly TextLayoutLine[], left: number, top: number, radius: number): ShimmerShape[] {
  return lines
    .filter((line) => line.width > 0 && line.height > 0)
    .map((line) => ({ x: left + line.x, y: top + line.y, width: line.width, height: line.height, radius: Math.min(radius, line.height / 2) }));
}

export function sameShapes(a: readonly ShimmerShape[] | undefined, b: readonly ShimmerShape[]): boolean {
  if (!a || a.length !== b.length) return false;
  return a.every((shape, i) => {
    const other = b[i];
    return other !== undefined && shape.x === other.x && shape.y === other.y && shape.width === other.width && shape.height === other.height && shape.radius === other.radius;
  });
}
