import { mixHex, toRgbHex } from '../hexColor';

const MAX_LIFT = 0.13;
const MIN_CONTRAST = 4.5;
const SEARCH_STEPS = 12;

function channel(hex: string, offset: number): number {
  const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  return 0.2126 * channel(hex, 1) + 0.7152 * channel(hex, 3) + 0.0722 * channel(hex, 5);
}

function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (light + 0.05) / (dark + 0.05);
}

export function placeholderColor(textSecondary: string, face: string): string {
  const from = toRgbHex(textSecondary);
  const to = toRgbHex(face);
  if (from === null || to === null || contrast(from, to) < MIN_CONTRAST) return textSecondary;
  const lifted = (amount: number) => mixHex(to, from, amount) ?? from;
  if (contrast(lifted(MAX_LIFT), to) >= MIN_CONTRAST) return lifted(MAX_LIFT);
  let low = 0;
  let high = MAX_LIFT;
  for (let step = 0; step < SEARCH_STEPS; step += 1) {
    const middle = (low + high) / 2;
    if (contrast(lifted(middle), to) >= MIN_CONTRAST) low = middle;
    else high = middle;
  }
  return lifted(low);
}
