import { Contrast, DynamicScheme, Hct, TonalPalette, Variant, argbFromHex, hexFromArgb } from '@material/material-color-utilities';

export type ColorMode = 'light' | 'dark';

export interface ThemeColorOptions {
  primary: string;
  secondary?: string;
  tertiary?: string;
  error?: string;
  success?: string;
  warning?: string;
  info?: string;
  neutral?: string;
}

export interface ThemeColors {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  primaryMark: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;
  success: string;
  onSuccess: string;
  successContainer: string;
  onSuccessContainer: string;
  warning: string;
  onWarning: string;
  warningContainer: string;
  onWarningContainer: string;
  info: string;
  onInfo: string;
  infoContainer: string;
  onInfoContainer: string;
  neutral: string;
  onNeutral: string;
  neutralContainer: string;
  onNeutralContainer: string;
  background: string;
  surface1: string;
  surface2: string;
  surface3: string;
  surface4: string;
  surface5: string;
  text: string;
  textSecondary: string;
  border: string;
  borderStrong: string;
  backgroundInverse: string;
  textInverse: string;
  primaryInverse: string;
  shadow: string;
  backdrop: string;
}

export type ColorName = keyof ThemeColors;

export type PaletteColor = 'primary' | 'secondary' | 'tertiary' | 'error' | 'success' | 'warning' | 'info' | 'neutral';

export const DEFAULT_COLORS: Required<Omit<ThemeColorOptions, 'neutral' | 'secondary' | 'tertiary'>> = {
  primary: '#ffa20d',
  error: '#ff4d6f',
  success: '#4fd165',
  warning: '#ffd700',
  info: '#4981ff',
};

export interface ThemeColorsOptions {
  mode: ColorMode;
  contrastLevel: number;
}

export const CONTAINER_CHROMA = 24;

const TEXT_CONTRAST = 4.5;
const BOUNDARY_CONTRAST = 3;

const NEUTRAL_TONES = {
  light: {
    background: 100,
    surface1: 100,
    surface2: 96.2,
    surface3: 93.6,
    surface4: 90.5,
    surface5: 86.5,
    text: 9,
    textSecondary: 44.5,
    border: 88,
    borderStrong: 60,
    backgroundInverse: 16,
    textInverse: 96,
  },
  dark: {
    background: 6,
    surface1: 6,
    surface2: 13,
    surface3: 18,
    surface4: 23,
    surface5: 28,
    text: 94,
    textSecondary: 66,
    border: 24,
    borderStrong: 46,
    backgroundInverse: 90,
    textInverse: 10,
  },
} as const;

type Curve = readonly [medium: number, high: number];
const CURVE = {
  text: { light: [11, 21], dark: [21, 21] },
  textSecondary: [7, 11],
  border: [3, 5.5],
  borderStrong: [4.5, 7],
  textInverse: [11, 21],
  onContainer: [7, 11],
} as const satisfies Record<string, Curve | Record<ColorMode, Curve>>;

const BRIGHT_SEED_TONE = 60;

const BRIGHT_ACCENT = {
  ink: { chroma: 22, tone: 10 },
  darkPrimary: { chromaScale: 0.87, maxTone: 70 },
  light: { onContainerTone: 36 },
  dark: { onContainerChroma: 40, onContainerTone: 86, inverseTone: 40 },
} as const;

const STATUS = {
  light: { minChroma: 48, containerChroma: 10, containerTone: 95.5, onContainerMinChroma: 40, onContainerTone: 34 },
  dark: { maxChroma: 72, tone: 70, onChroma: 24, onTone: 12, containerChroma: 12, containerTone: 19, onContainerChroma: 28, onContainerTone: 88 },
} as const;
type StatusName = 'error' | 'success' | 'warning' | 'info';
const INFO_CONTAINER_HUE_SHIFT = -14;

const NEUTRAL_ACCENT = {
  light: { main: 12, on: 100, container: 94.5, onContainer: 10 },
  dark: { main: 92, on: 10, container: 22, onContainer: 94 },
} as const;

const BLACK = '#000000';
const WHITE_TONE = 100;

interface Tint {
  hue: number;
  chroma: number;
}

const hex = (argb: number) => hexFromArgb(argb);
const palette = (color: string) => TonalPalette.fromInt(argbFromHex(color));
const calm = (source: TonalPalette) => TonalPalette.fromHueAndChroma(source.hue, Math.min(source.chroma, CONTAINER_CHROMA));
const at = (tint: Tint, tone: number) => Hct.from(tint.hue, tint.chroma, tone).toInt();

function luminance(argb: number) {
  const channel = (shift: number) => {
    const c = ((argb >> shift) & 0xff) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(16) + 0.7152 * channel(8) + 0.0722 * channel(0);
}

function contrastOf(a: number, b: number) {
  const [la, lb] = [luminance(a), luminance(b)];
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export function contrastRatio(a: string, b: string): number {
  return contrastOf(argbFromHex(a), argbFromHex(b));
}

function toneFor(tint: Tint, start: number, ground: number, ratio: number): number {
  const meets = (tone: number) => contrastOf(at(tint, tone), ground) >= ratio;
  if (meets(start)) return start;
  const end = Hct.fromInt(ground).tone >= 50 ? 0 : WHITE_TONE;
  if (!meets(end)) return end;
  let [near, far] = [start, end];
  for (let i = 0; i < 20; i += 1) {
    const mid = (near + far) / 2;
    if (meets(mid)) far = mid;
    else near = mid;
  }
  return far;
}

function contrastTarget(standard: number, [medium, high]: Curve, level: number) {
  const t = Math.min(Math.max(level, 0), 1);
  const top = Math.max(standard, high);
  const middle = Math.max(medium, (standard + top) / 2);
  return t <= 0.5 ? standard + (middle - standard) * (t / 0.5) : middle + (top - middle) * ((t - 0.5) / 0.5);
}

function curved(tint: Tint, standardTone: number, ground: number, curve: Curve, level: number): number {
  if (level <= 0) return at(tint, standardTone);
  const standard = contrastOf(at(tint, standardTone), ground);
  return at(tint, toneFor(tint, standardTone, ground, contrastTarget(standard, curve, level)));
}

function neutralPalettes(seeds: ThemeColorOptions) {
  if (seeds.neutral) {
    const hct = Hct.fromInt(argbFromHex(seeds.neutral));
    return {
      neutralPalette: TonalPalette.fromHueAndChroma(hct.hue, Math.min(hct.chroma, 6)),
      neutralVariantPalette: TonalPalette.fromHueAndChroma(hct.hue, Math.min(hct.chroma, 6) + 2),
    };
  }
  return {
    neutralPalette: TonalPalette.fromHueAndChroma(0, 0),
    neutralVariantPalette: TonalPalette.fromHueAndChroma(0, 0),
  };
}

function neutralRoles(seeds: ThemeColorOptions, mode: ColorMode, level: number) {
  const { neutralPalette: neutral, neutralVariantPalette: variant } = neutralPalettes(seeds);
  const tones = NEUTRAL_TONES[mode];
  const surfaces = {
    background: at(neutral, tones.background),
    surface1: at(neutral, tones.surface1),
    surface2: at(neutral, tones.surface2),
    surface3: at(neutral, tones.surface3),
    surface4: at(neutral, tones.surface4),
    surface5: at(neutral, tones.surface5),
  };
  const ground = surfaces.background;
  const textSecondaryFloor = toneFor(variant, tones.textSecondary, surfaces.surface4, TEXT_CONTRAST);
  const borderStrongFloor = toneFor(variant, tones.borderStrong, surfaces.surface2, BOUNDARY_CONTRAST);
  const backgroundInverse = at(neutral, tones.backgroundInverse);
  return {
    ...surfaces,
    text: curved(neutral, tones.text, ground, CURVE.text[mode], level),
    textSecondary: curved(variant, textSecondaryFloor, ground, CURVE.textSecondary, level),
    border: curved(variant, tones.border, ground, CURVE.border, level),
    borderStrong: curved(variant, borderStrongFloor, ground, CURVE.borderStrong, level),
    backgroundInverse,
    textInverse: curved(neutral, tones.textInverse, backgroundInverse, CURVE.textInverse, level),
  };
}

interface SchemePalettes {
  secondary?: TonalPalette;
  tertiary?: TonalPalette;
}

function createScheme(seeds: ThemeColorOptions, options: ThemeColorsOptions, palettes: SchemePalettes) {
  return new DynamicScheme({
    sourceColorHct: Hct.fromInt(argbFromHex(seeds.primary)),
    variant: Variant.FIDELITY,
    contrastLevel: options.contrastLevel,
    isDark: options.mode === 'dark',
    specVersion: '2025',
    secondaryPalette: palettes.secondary,
    tertiaryPalette: palettes.tertiary,
    ...neutralPalettes(seeds),
  });
}

function accentContrast(contrastLevel: number) {
  if (contrastLevel <= 0) return 4.5;
  if (contrastLevel <= 0.5) return 4.5 + (7 - 4.5) * (contrastLevel / 0.5);
  return 7 + (11 - 7) * ((Math.min(contrastLevel, 1) - 0.5) / 0.5);
}

function darkAccentHue(hue: number) {
  if (hue < 40 || hue > 110) return hue;
  return hue - Math.min(12, hue - 40);
}

interface AccentRoles {
  primary: number;
  onPrimary: number;
  primaryContainer?: number;
  onPrimaryContainer?: number;
  primaryInverse?: number;
}

function accentRoles(seed: Hct, backgroundArgb: number, options: ThemeColorsOptions): AccentRoles {
  const backgroundTone = Hct.fromInt(backgroundArgb).tone;
  const ratio = accentContrast(options.contrastLevel);
  if (options.mode === 'light') {
    const tone = Contrast.darker(backgroundTone, ratio);
    const primary = Hct.from(darkAccentHue(seed.hue), seed.chroma, tone < 0 ? Contrast.darkerUnsafe(backgroundTone, ratio) : tone);
    return { primary: primary.toInt(), onPrimary: Hct.from(seed.hue, 0, 100).toInt() };
  }
  const lighter = Contrast.lighter(backgroundTone, ratio);
  const tone = Math.max(80, lighter < 0 ? Contrast.lighterUnsafe(backgroundTone, ratio) : lighter);
  const containerTone = 30 - 10 * Math.min(Math.max(options.contrastLevel, 0), 1);
  return {
    primary: Hct.from(seed.hue, seed.chroma, tone).toInt(),
    onPrimary: Hct.from(seed.hue, Math.min(seed.chroma, CONTAINER_CHROMA), Math.min(20, tone - 60)).toInt(),
    primaryContainer: Hct.from(darkAccentHue(seed.hue), Math.min(seed.chroma, 36), containerTone).toInt(),
    onPrimaryContainer: Hct.from(seed.hue, seed.chroma, Math.max(90, Contrast.lighterUnsafe(containerTone, ratio))).toInt(),
  };
}

function onContainer(tint: Tint, standardTone: number, container: number, level: number) {
  return curved(tint, toneFor(tint, standardTone, container, TEXT_CONTRAST), container, CURVE.onContainer, level);
}

function brightAccentRoles(seed: Hct, seedArgb: number, backgroundInverse: number, mode: ColorMode, level: number): Required<AccentRoles> {
  const ink = at({ hue: seed.hue, chroma: BRIGHT_ACCENT.ink.chroma }, BRIGHT_ACCENT.ink.tone);
  if (mode === 'light') {
    const spec = BRIGHT_ACCENT.light;
    const container = pastelContainer(seed.hue, mode);
    return {
      primary: seedArgb,
      onPrimary: ink,
      primaryContainer: container,
      onPrimaryContainer: onContainer(seed, spec.onContainerTone, container, level),
      primaryInverse: seedArgb,
    };
  }
  const spec = BRIGHT_ACCENT.dark;
  const container = pastelContainer(seed.hue, mode);
  const inverse = { hue: seed.hue, chroma: seed.chroma };
  return {
    primary: at({ hue: seed.hue, chroma: seed.chroma * BRIGHT_ACCENT.darkPrimary.chromaScale }, Math.min(seed.tone, BRIGHT_ACCENT.darkPrimary.maxTone)),
    onPrimary: ink,
    primaryContainer: container,
    onPrimaryContainer: onContainer({ hue: seed.hue, chroma: spec.onContainerChroma }, spec.onContainerTone, container, level),
    primaryInverse: curved(inverse, toneFor(inverse, spec.inverseTone, backgroundInverse, TEXT_CONTRAST), backgroundInverse, CURVE.onContainer, level),
  };
}

const MARK = { tone: 60, hueRange: 16 } as const;
function markContrast(contrastLevel: number) {
  if (contrastLevel <= 0) return BOUNDARY_CONTRAST;
  if (contrastLevel <= 0.5) return BOUNDARY_CONTRAST + (TEXT_CONTRAST - BOUNDARY_CONTRAST) * (contrastLevel / 0.5);
  return TEXT_CONTRAST + (7 - TEXT_CONTRAST) * ((Math.min(contrastLevel, 1) - 0.5) / 0.5);
}

function primaryMarkRole(seed: Hct, primary: number, background: number, mode: ColorMode, level: number): number {
  if (mode === 'dark' || seed.tone < BRIGHT_SEED_TONE) return primary;
  let tint: Tint = { hue: seed.hue, chroma: 0 };
  for (let offset = -MARK.hueRange; offset <= MARK.hueRange; offset += 1) {
    const hue = (((seed.hue + offset) % 360) + 360) % 360;
    const chroma = Hct.from(hue, 200, MARK.tone).chroma;
    if (chroma > tint.chroma) tint = { hue, chroma };
  }
  return at(tint, toneFor(tint, MARK.tone, background, markContrast(level)));
}

function statusRoles(name: StatusName, seed: string, mode: ColorMode, level: number, group: number) {
  const source = Hct.fromInt(argbFromHex(seed));
  const containerHue = name === 'info' ? source.hue + INFO_CONTAINER_HUE_SHIFT : source.hue;
  const ratio = accentContrast(level);
  if (mode === 'light') {
    const spec = STATUS.light;
    const main = { hue: source.hue, chroma: Math.max(source.chroma, spec.minChroma) };
    const container = at({ hue: containerHue, chroma: spec.containerChroma }, spec.containerTone);
    return {
      main: at(main, toneFor(main, WHITE_TONE, group, ratio)),
      onMain: at(main, WHITE_TONE),
      container,
      onContainer: onContainer({ hue: source.hue, chroma: Math.max(source.chroma, spec.onContainerMinChroma) }, spec.onContainerTone, container, level),
    };
  }
  const spec = STATUS.dark;
  const main = { hue: source.hue, chroma: Math.min(source.chroma, spec.maxChroma) };
  const container = at({ hue: containerHue, chroma: spec.containerChroma }, spec.containerTone);
  return {
    main: at(main, toneFor(main, spec.tone, group, ratio)),
    onMain: at({ hue: source.hue, chroma: spec.onChroma }, spec.onTone),
    container,
    onContainer: onContainer({ hue: source.hue, chroma: spec.onContainerChroma }, spec.onContainerTone, container, level),
  };
}

function pastelContainer(hue: number, mode: ColorMode): number {
  const spec = STATUS[mode];
  return at({ hue, chroma: spec.containerChroma }, spec.containerTone);
}

function secondaryRoles(main: number, onMain: number, mode: ColorMode, level: number) {
  const source = Hct.fromInt(main);
  const container = pastelContainer(source.hue, mode);
  const ink =
    mode === 'light'
      ? onContainer({ hue: source.hue, chroma: Math.max(source.chroma, STATUS.light.onContainerMinChroma) }, STATUS.light.onContainerTone, container, level)
      : onContainer({ hue: source.hue, chroma: STATUS.dark.onContainerChroma }, STATUS.dark.onContainerTone, container, level);
  return [main, onMain, container, ink] as const;
}

function neutralAccent(seeds: ThemeColorOptions, mode: ColorMode) {
  const { neutralPalette: neutral } = neutralPalettes(seeds);
  const tones = NEUTRAL_ACCENT[mode];
  return [at(neutral, tones.main), at(neutral, tones.on), at(neutral, tones.container), at(neutral, tones.onContainer)] as const;
}

export function createThemeColors(seeds: ThemeColorOptions, options: ThemeColorsOptions): ThemeColors {
  const { mode, contrastLevel: level } = options;
  const full = { ...DEFAULT_COLORS, ...seeds };
  const sourceArgb = argbFromHex(full.primary);
  const sourceHct = Hct.fromInt(sourceArgb);
  const s = createScheme(full, options, {
    secondary: seeds.secondary ? palette(seeds.secondary) : undefined,
    tertiary: seeds.tertiary ? palette(seeds.tertiary) : undefined,
  });
  const c = createScheme(full, options, { secondary: calm(s.secondaryPalette), tertiary: calm(s.tertiaryPalette) });
  const neutral = neutralRoles(full, mode, level);
  const accent =
    sourceHct.tone >= BRIGHT_SEED_TONE
      ? brightAccentRoles(sourceHct, sourceArgb, neutral.backgroundInverse, mode, level)
      : accentRoles(sourceHct, neutral.background, options);
  const [secondary, onSecondary, secondaryContainer, onSecondaryContainer] = secondaryRoles(s.secondary, s.onSecondary, mode, level);
  const [neutralMain, onNeutral, neutralContainer, onNeutralContainer] = neutralAccent(full, mode);
  const status = (name: StatusName) => statusRoles(name, full[name], mode, level, neutral.surface2);
  const [error, success, warning, info] = [status('error'), status('success'), status('warning'), status('info')];

  return {
    primary: hex(accent.primary),
    onPrimary: hex(accent.onPrimary),
    primaryContainer: hex(accent.primaryContainer ?? s.primaryContainer),
    onPrimaryContainer: hex(accent.onPrimaryContainer ?? s.onPrimaryContainer),
    primaryMark: hex(primaryMarkRole(sourceHct, accent.primary, neutral.background, mode, level)),
    secondary: hex(secondary),
    onSecondary: hex(onSecondary),
    secondaryContainer: hex(secondaryContainer),
    onSecondaryContainer: hex(onSecondaryContainer),
    tertiary: hex(s.tertiary),
    onTertiary: hex(s.onTertiary),
    tertiaryContainer: hex(c.tertiaryContainer),
    onTertiaryContainer: hex(c.onTertiaryContainer),
    error: hex(error.main),
    onError: hex(error.onMain),
    errorContainer: hex(error.container),
    onErrorContainer: hex(error.onContainer),
    success: hex(success.main),
    onSuccess: hex(success.onMain),
    successContainer: hex(success.container),
    onSuccessContainer: hex(success.onContainer),
    warning: hex(warning.main),
    onWarning: hex(warning.onMain),
    warningContainer: hex(warning.container),
    onWarningContainer: hex(warning.onContainer),
    info: hex(info.main),
    onInfo: hex(info.onMain),
    infoContainer: hex(info.container),
    onInfoContainer: hex(info.onContainer),
    neutral: hex(neutralMain),
    onNeutral: hex(onNeutral),
    neutralContainer: hex(neutralContainer),
    onNeutralContainer: hex(onNeutralContainer),
    background: hex(neutral.background),
    surface1: hex(neutral.surface1),
    surface2: hex(neutral.surface2),
    surface3: hex(neutral.surface3),
    surface4: hex(neutral.surface4),
    surface5: hex(neutral.surface5),
    text: hex(neutral.text),
    textSecondary: hex(neutral.textSecondary),
    border: hex(neutral.border),
    borderStrong: hex(neutral.borderStrong),
    backgroundInverse: hex(neutral.backgroundInverse),
    textInverse: hex(neutral.textInverse),
    primaryInverse: hex(accent.primaryInverse ?? s.inversePrimary),
    shadow: BLACK,
    backdrop: BLACK,
  };
}

export function getPaletteColors(colors: ThemeColors, color: PaletteColor) {
  const cap = (color.charAt(0).toUpperCase() + color.slice(1)) as Capitalize<PaletteColor>;
  return {
    main: colors[color],
    onMain: colors[`on${cap}`],
    container: colors[`${color}Container`],
    onContainer: colors[`on${cap}Container`],
  };
}

export function withOpacity(color: string, opacity: number): string {
  const match = /^#([0-9a-f]{6})$/i.exec(color);
  if (!match) return color;
  const alpha = Math.round(Math.min(1, Math.max(0, opacity)) * 255).toString(16).padStart(2, '0');
  return `#${match[1]}${alpha}`;
}

export function resolveColor(colors: ThemeColors, color: ColorName | (string & {}) | undefined): string | undefined {
  if (color === undefined) return undefined;
  return color in colors ? colors[color as ColorName] : color;
}
