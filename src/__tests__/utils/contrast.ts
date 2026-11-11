export function luminance(hex: string): number {
  const channel = (i: number) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

export function contrastRatio(a: string, b: string): number {
  const [la, lb] = [luminance(a), luminance(b)];
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export function over(top: string, bottom: string): string {
  const alpha = top.length === 9 ? parseInt(top.slice(7, 9), 16) / 255 : 1;
  const channel = (i: number) =>
    Math.round(parseInt(top.slice(i, i + 2), 16) * alpha + parseInt(bottom.slice(i, i + 2), 16) * (1 - alpha))
      .toString(16)
      .padStart(2, '0');
  return `#${channel(1)}${channel(3)}${channel(5)}`;
}
