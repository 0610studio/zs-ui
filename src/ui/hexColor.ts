export const toRgbHex = (color: string): string | null => {
  if (/^#[0-9a-fA-F]{6}$/.test(color)) return color;
  if (/^#[0-9a-fA-F]{3}$/.test(color)) {
    const [r, g, b] = color.slice(1);
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return null;
};

export const withAlpha = (color: string, alphaHex: string): string | null => {
  const rgb = toRgbHex(color);
  return rgb === null ? null : `${rgb}${alphaHex}`;
};

export const mixHex = (top: string, bottom: string, amount: number): string | null => {
  const a = toRgbHex(top);
  const b = toRgbHex(bottom);
  if (a === null || b === null) return null;
  const t = Math.min(1, Math.max(0, amount));
  const channel = (offset: number) => {
    const value = parseInt(b.slice(offset, offset + 2), 16) * (1 - t) + parseInt(a.slice(offset, offset + 2), 16) * t;
    return Math.round(value).toString(16).padStart(2, '0');
  };
  return `#${channel(1)}${channel(3)}${channel(5)}`;
};
