const EXTENT = 1.52866483;
const CORNER: readonly (readonly [number, number])[][] = [
  [[1.08849323, 0], [0.86840689, 0], [0.66993427, 0.065496]],
  [[0.63149399, 0.074911]],
  [[0.37282392, 0.16905899], [0.16905899, 0.37282392], [0.074911, 0.63149399]],
  [[0.065496, 0.66993427]],
  [[0, 0.86840689], [0, 1.08849323], [0, EXTENT]],
];

type Point = readonly [number, number];
type CornerMap = (u: number, v: number) => Point;

const round = (value: number) => Math.round(value * 1000) / 1000;
const point = ([x, y]: Point) => `${round(x)} ${round(y)}`;

export const continuousCornerExtent = (radius: number): number => radius * EXTENT;

export function continuousRoundedRectPath(x: number, y: number, width: number, height: number, radius: number): string | null {
  if (radius <= 0 || width <= 0 || height <= 0) return null;
  if (continuousCornerExtent(radius) > Math.min(width, height) / 2) return null;

  const r = radius;
  const right = x + width;
  const bottom = y + height;
  const corners: CornerMap[] = [
    (u, v) => [right - u * r, y + v * r],
    (u, v) => [right - v * r, bottom - u * r],
    (u, v) => [x + u * r, bottom - v * r],
    (u, v) => [x + v * r, y + u * r],
  ];

  const commands = [`M${point([x + EXTENT * r, y])}`];
  corners.forEach((map) => {
    commands.push(`L${point(map(EXTENT, 0))}`);
    CORNER.forEach((segment) => {
      const points = segment.map(([u, v]) => point(map(u, v)));
      commands.push(points.length === 1 ? `L${points[0]}` : `C${points.join(' ')}`);
    });
  });
  commands.push('Z');
  return commands.join(' ');
}
