import { useWindowDimensions } from 'react-native';

export const LARGE_FONT_SCALE = 1.5;

export default function useLargeText(): boolean {
  const { fontScale } = useWindowDimensions();
  return fontScale >= LARGE_FONT_SCALE;
}

export function fitSingleWord(text: string) {
  return /\s/.test(text) ? null : { numberOfLines: 1, adjustsFontSizeToFit: true, minimumFontScale: 0.5 };
}
