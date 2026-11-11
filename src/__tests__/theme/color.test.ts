import { Hct, argbFromHex } from '@material/material-color-utilities';
import {
  CONTAINER_CHROMA,
  contrastRatio as themeContrastRatio,
  createThemeColors,
  DEFAULT_COLORS,
  getPaletteColors,
  resolveColor,
  withOpacity,
  type ColorMode,
  type ThemeColorOptions,
  type ThemeColors,
  type ThemeColorsOptions,
} from '../../theme/color';
import { contrastRatio } from '../utils/contrast';

const LIGHT: ThemeColorsOptions = { mode: 'light', contrastLevel: 0 };
const MODES = ['light', 'dark'] as const;
const LEVELS = [0, 0.5, 1] as const;
const SURFACES = ['surface1', 'surface2', 'surface3', 'surface4', 'surface5'] as const;
const DARK_SEED = '#3366ff';

const COLOR_NAMES: (keyof ThemeColors)[] = [
  'primary', 'onPrimary', 'primaryContainer', 'onPrimaryContainer', 'primaryMark',
  'secondary', 'onSecondary', 'secondaryContainer', 'onSecondaryContainer',
  'tertiary', 'onTertiary', 'tertiaryContainer', 'onTertiaryContainer',
  'error', 'onError', 'errorContainer', 'onErrorContainer',
  'success', 'onSuccess', 'successContainer', 'onSuccessContainer',
  'warning', 'onWarning', 'warningContainer', 'onWarningContainer',
  'info', 'onInfo', 'infoContainer', 'onInfoContainer',
  'neutral', 'onNeutral', 'neutralContainer', 'onNeutralContainer',
  'background',
  'surface1', 'surface2', 'surface3', 'surface4', 'surface5',
  'text', 'textSecondary', 'borderStrong', 'border',
  'backgroundInverse', 'textInverse', 'primaryInverse', 'shadow', 'backdrop',
];

const PALETTES = ['primary', 'secondary', 'tertiary', 'error', 'success', 'warning', 'info'] as const;
const STATUSES = ['error', 'success', 'warning', 'info'] as const;
const cap = <T extends string>(name: T) => (name.charAt(0).toUpperCase() + name.slice(1)) as Capitalize<T>;

const hct = (hex: string) => Hct.fromInt(argbFromHex(hex));
const tone = (hex: string) => hct(hex).tone;
const chroma = (hex: string) => hct(hex).chroma;
const hue = (hex: string) => hct(hex).hue;
const theme = (mode: ColorMode, contrastLevel = 0, seeds: ThemeColorOptions = DEFAULT_COLORS) => createThemeColors(seeds, { mode, contrastLevel });
const isGray = (hex: string) => hex.slice(1, 3) === hex.slice(3, 5) && hex.slice(3, 5) === hex.slice(5, 7);

describe('createThemeColors()', () => {
  it('테마 색 전부를 #rrggbb 로 만든다', () => {
    const colors = createThemeColors(DEFAULT_COLORS, LIGHT);
    expect(Object.keys(colors).sort()).toEqual([...COLOR_NAMES].sort());
    COLOR_NAMES.forEach((name) => expect(colors[name]).toMatch(/^#[0-9a-f]{6}$/));
  });

  it('기본 시드의 표준 대비 값은 표와 같다(라이트 보조 글자·입력 경계·상태 main 은 대비 하한으로 한 단 진함)', () => {
    expect(theme('light')).toMatchObject({
      primary: '#ffa20d', onPrimary: '#2b1700', primaryContainer: '#fff0e2', onPrimaryContainer: '#794a00', primaryMark: '#e27200',
      secondary: '#7e5624', onSecondary: '#ffffff', secondaryContainer: '#fff0e2', onSecondaryContainer: '#734600',
      neutral: '#1f1f1f', onNeutral: '#ffffff', neutralContainer: '#efefef', onNeutralContainer: '#1b1b1b',
      errorContainer: '#ffeeef', onErrorContainer: '#a30035', infoContainer: '#edf2fe', onInfoContainer: '#0048b5',
      background: '#ffffff', surface1: '#ffffff', surface2: '#f4f4f4', surface3: '#ededed', surface4: '#e4e4e4', surface5: '#d8d8d8',
      text: '#191919', textSecondary: '#666666', border: '#dddddd', borderStrong: '#8d8d8d',
      backgroundInverse: '#282828', textInverse: '#f3f3f3', primaryInverse: '#ffa20d', shadow: '#000000', backdrop: '#000000',
    });
    expect(theme('dark')).toMatchObject({
      primary: '#ea9a2a', onPrimary: '#2b1700', primaryContainer: '#3a2c1c', onPrimaryContainer: '#ffcf99', primaryMark: '#ea9a2a',
      secondary: '#f2bd81', onSecondary: '#472a00', secondaryContainer: '#3a2c1c', onSecondaryContainer: '#ffd6aa',
      neutral: '#e8e8e8', onNeutral: '#1b1b1b', neutralContainer: '#353535', onNeutralContainer: '#eeeeee',
      error: '#ff8796', onError: '#371419', errorContainer: '#3d292b', onErrorContainer: '#ffd2d5',
      success: '#3fc359', warning: '#c9a900', info: '#89a9ff', infoContainer: '#272f3a',
      background: '#131313', surface1: '#131313', surface2: '#222222', surface3: '#2c2c2c', surface4: '#373737', surface5: '#424242',
      text: '#eeeeee', textSecondary: '#a0a0a0', border: '#393939', borderStrong: '#6d6d6d',
      backgroundInverse: '#e2e2e2', textInverse: '#1b1b1b', primaryInverse: '#865300', shadow: '#000000', backdrop: '#000000',
    });
  });

  it('primary 만 줘도 상태 색은 기본 시드로 채운다', () => {
    const onlyPrimary = createThemeColors({ primary: DEFAULT_COLORS.primary }, LIGHT);
    expect(onlyPrimary).toEqual(createThemeColors(DEFAULT_COLORS, LIGHT));
  });

  describe('primary — 채움 색', () => {
    it('밝은 시드(톤 60 이상)는 라이트 primary 가 시드 그대로이고, 그 위 onPrimary 는 시드 색조의 먹이다', () => {
      for (const seed of ['#ffa20d', '#FFD700', '#00a86b']) {
        expect(tone(seed)).toBeGreaterThanOrEqual(60);
        const light = theme('light', 0, { ...DEFAULT_COLORS, primary: seed });
        expect(light.primary).toBe(seed.toLowerCase());
        expect(tone(light.onPrimary)).toBeCloseTo(10, 0);
        expect(Math.abs(hue(light.onPrimary) - hue(seed))).toBeLessThan(10);
        expect(contrastRatio(light.onPrimary, light.primary)).toBeGreaterThanOrEqual(4.5);
      }
    });

    it('밝은 시드의 다크 primary 는 시드 색조·채도 ×0.87·톤 min(시드, 70) 이고 onPrimary 는 라이트와 같은 먹이다', () => {
      const [light, dark] = [theme('light'), theme('dark')];
      const seed = hct(DEFAULT_COLORS.primary);
      expect(Math.abs(hue(dark.primary) - seed.hue)).toBeLessThan(2);
      expect(chroma(dark.primary)).toBeCloseTo(seed.chroma * 0.87, 0);
      expect(tone(dark.primary)).toBeCloseTo(Math.min(seed.tone, 70), 0);
      expect(dark.onPrimary).toBe(light.onPrimary);
      expect(contrastRatio(light.onPrimary, light.primary)).toBeGreaterThanOrEqual(8.5);
      expect(contrastRatio(dark.onPrimary, dark.primary)).toBeGreaterThanOrEqual(7.4);
    });

    it('밝은 시드 primary(면)는 대비 수준과 상관없이 같다 — 대비는 그 위 먹 글자가 맡는다', () => {
      for (const mode of MODES) {
        const [standard, ...higher] = LEVELS.map((contrastLevel) => theme(mode, contrastLevel));
        higher.forEach((colors) => {
          expect(colors.primary).toBe(standard?.primary);
          expect(colors.onPrimary).toBe(standard?.onPrimary);
        });
      }
    });

    it('밝은 시드 primary 는 흰 바탕 위 글자·얇은 선으로 3:1 이 안 된다 — 브랜드 색조 글자는 onPrimaryContainer(4.5:1 이상)', () => {
      for (const contrastLevel of LEVELS) {
        const colors = theme('light', contrastLevel);
        expect(contrastRatio(colors.primary, colors.background)).toBeLessThan(3);
        expect(contrastRatio(colors.onPrimaryContainer, colors.background)).toBeGreaterThanOrEqual(7);
      }
    });

    describe('primaryMark — 주색 표시색', () => {
      it('밝은 시드의 라이트는 채도를 지키며 톤 60 까지만 내린 같은 계열이다 — 호박 #ffa20d → #e27200, 흰 바탕 3:1 이상', () => {
        const colors = theme('light');
        expect(colors.primaryMark).toBe('#e27200');
        expect(tone(colors.primaryMark)).toBeCloseTo(60, 0);
        expect(chroma(colors.primaryMark)).toBeGreaterThanOrEqual(chroma(colors.primary));
        expect(Math.abs(hue(colors.primaryMark) - hue(colors.primary))).toBeLessThanOrEqual(16);
        expect(contrastRatio(colors.primaryMark, colors.background)).toBeGreaterThanOrEqual(3);
        expect(contrastRatio(colors.primary, colors.background)).toBeLessThan(3);
      });

      it.each([
        [0.5, 4.5],
        [1, 7],
      ] as const)('대비 높임(%s)에서는 배경 위 %s:1 까지 더 내린다', (contrastLevel, ratio) => {
        const colors = theme('light', contrastLevel);
        expect(contrastRatio(colors.primaryMark, colors.background)).toBeGreaterThanOrEqual(ratio);
        expect(tone(colors.primaryMark)).toBeLessThan(60);
      });

      it('다크와 진한 시드는 primary 와 같다 — 이미 배경 위 대비가 충분하다', () => {
        LEVELS.forEach((contrastLevel) => {
          const dark = theme('dark', contrastLevel);
          expect(dark.primaryMark).toBe(dark.primary);
          const deep = theme('light', contrastLevel, { ...DEFAULT_COLORS, primary: DARK_SEED });
          expect(deep.primaryMark).toBe(deep.primary);
        });
      });
    });

    it('진한 시드는 지금 규칙 — 라이트 primary 가 배경 대비 4.5:1 톤, 흰 onPrimary, FIDELITY 라 primaryContainer 는 시드 그대로', () => {
      const light = theme('light', 0, { ...DEFAULT_COLORS, primary: DARK_SEED });
      expect(tone(DARK_SEED)).toBeLessThan(60);
      expect(contrastRatio(light.primary, light.background)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(light.primary, light.background)).toBeLessThan(5);
      expect(light.onPrimary).toBe('#ffffff');
      expect(light.primaryContainer).toBe(DARK_SEED);
      expect(Math.abs(hue(light.primary) - hue(DARK_SEED))).toBeLessThan(3);
    });

    it('진한 주황 시드는 색조를 빨강 쪽으로 옮겨 갈색이 되지 않는다(진한 시드 규칙)', () => {
      const seed = '#b35a00';
      expect(tone(seed)).toBeLessThan(60);
      const light = theme('light', 0, { ...DEFAULT_COLORS, primary: seed });
      expect(hue(seed) - hue(light.primary)).toBeCloseTo(Math.min(12, hue(seed) - 40), 0);
    });

    it.each(MODES)('진한 시드 %s primary 는 새 바탕 기준으로 대비 수준별 4.5·7·11:1 을 지킨다', (mode) => {
      const targets = [4.5, 7, 11];
      LEVELS.forEach((contrastLevel, i) => {
        const colors = theme(mode, contrastLevel, { ...DEFAULT_COLORS, primary: DARK_SEED });
        expect(contrastRatio(colors.primary, colors.background)).toBeGreaterThanOrEqual(targets[i] ?? 0);
      });
    });

    it('다크 primaryContainer 는 다른 컨테이너처럼 어두운 톤이라 채움(primary)과 단계가 갈린다', () => {
      const dark = theme('dark');
      expect(tone(dark.primary) - tone(dark.primaryContainer)).toBeGreaterThan(40);
      expect(tone(dark.primaryContainer)).toBeLessThan(30);
      expect(tone(dark.successContainer)).toBeLessThan(30);
      expect(contrastRatio(theme('dark', 1).onPrimaryContainer, theme('dark', 1).primaryContainer)).toBeGreaterThanOrEqual(7);
    });
  });

  it('neutral 은 무채색 회색 4역할이다 — 회색 버튼·primary tonal 면, secondary 시드와 상관없다', () => {
    for (const primary of ['#ffa20d', DARK_SEED]) {
      for (const mode of MODES) {
        for (const secondary of [undefined, '#0f766e']) {
          const colors = theme(mode, 0, { ...DEFAULT_COLORS, primary, ...(secondary ? { secondary } : null) });
          (['neutral', 'onNeutral', 'neutralContainer', 'onNeutralContainer'] as const).forEach((role) => expect(isGray(colors[role])).toBe(true));
          expect(contrastRatio(colors.onNeutral, colors.neutral)).toBeGreaterThanOrEqual(4.5);
          expect(contrastRatio(colors.onNeutralContainer, colors.neutralContainer)).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });

  it('secondary 를 주지 않으면 primary 에서 파생한다(M3) — 같은 색조, tertiary 는 primary 에서 색조를 옮긴다', () => {
    for (const primary of ['#ffa20d', DARK_SEED]) {
      for (const mode of MODES) {
        const colors = theme(mode, 0, { ...DEFAULT_COLORS, primary });
        expect(isGray(colors.secondary)).toBe(false);
        expect(Math.abs(hue(colors.secondary) - hue(primary))).toBeLessThan(15);
        expect(contrastRatio(colors.onSecondary, colors.secondary)).toBeGreaterThanOrEqual(4.5);
        expect(Math.abs(hue(colors.tertiary) - hue(primary))).toBeGreaterThan(60);
      }
    }
  });

  it('primary(밝은 시드)·secondary 파스텔은 상태 색 파스텔과 같은 밝기·옅은 채도다 — 시드를 줘도, 위 글자는 4.5:1 이상', () => {
    for (const mode of MODES) {
      for (const secondary of [undefined, '#0f766e']) {
        const colors = theme(mode, 0, { ...DEFAULT_COLORS, ...(secondary ? { secondary } : null) });
        for (const role of ['primaryContainer', 'secondaryContainer'] as const) {
          expect(tone(colors[role])).toBeCloseTo(tone(colors.errorContainer), 0);
          expect(chroma(colors[role])).toBeLessThanOrEqual(12.5);
          expect(chroma(colors[role])).toBeGreaterThan(2);
        }
        expect(contrastRatio(colors.onPrimaryContainer, colors.primaryContainer)).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(colors.onSecondaryContainer, colors.secondaryContainer)).toBeGreaterThanOrEqual(4.5);
      }
    }
    expect(theme('light', 0, { ...DEFAULT_COLORS, secondary: '#0f766e' }).secondaryContainer).toBe('#e7f5f2');
  });

  it('neutral 시드를 주면 neutral 4역할도 그 색조의 낮은 채도다', () => {
    const tinted = theme('light', 0, { ...DEFAULT_COLORS, neutral: DARK_SEED });
    expect(chroma(tinted.neutralContainer)).toBeGreaterThan(0.5);
    expect(chroma(tinted.neutralContainer)).toBeLessThan(10);
  });

  it('보조·상태 컨테이너는 채도를 같은 상한 아래로 맞춘다 — 형광(연두·민트)과 파스텔이 섞이지 않는다', () => {
    for (const mode of MODES) {
      const colors = theme(mode);
      for (const role of ['secondaryContainer', 'tertiaryContainer', 'errorContainer', 'successContainer', 'warningContainer', 'infoContainer'] as const) {
        expect(chroma(colors[role])).toBeLessThanOrEqual(CONTAINER_CHROMA + 1);
      }
    }
    expect(chroma(theme('light').success)).toBeGreaterThan(CONTAINER_CHROMA + 10);
  });

  it('라이트는 밝은 표면·어두운 글자, 다크는 어두운 표면·밝은 글자다', () => {
    const [light, dark] = [theme('light'), theme('dark')];
    expect(tone(light.background)).toBeGreaterThan(90);
    expect(tone(light.text)).toBeLessThan(15);
    expect(tone(dark.background)).toBeLessThan(10);
    expect(tone(dark.text)).toBeGreaterThan(85);
    expect(tone(light.backgroundInverse)).toBeLessThan(25);
    expect(tone(dark.backgroundInverse)).toBeGreaterThan(85);
  });

  it.each(MODES)('%s 대비 수준을 올리면 글자·테두리와 바탕의 대비가 수준마다 커진다', (mode) => {
    const [standard, medium, high] = LEVELS.map((contrastLevel) => theme(mode, contrastLevel));
    for (const role of ['textSecondary', 'border', 'borderStrong'] as const) {
      const ratios = [standard, medium, high].map((colors) => contrastRatio(colors?.[role] ?? '', colors?.background ?? ''));
      expect(ratios[1]).toBeGreaterThan(ratios[0] ?? 0);
      expect(ratios[2]).toBeGreaterThan(ratios[1] ?? 0);
    }
    expect(contrastRatio(high?.text ?? '', high?.background ?? '')).toBeGreaterThan(contrastRatio(standard?.text ?? '', standard?.background ?? ''));
    expect(contrastRatio(high?.onPrimaryContainer ?? '', high?.primaryContainer ?? '')).toBeGreaterThan(
      contrastRatio(standard?.onPrimaryContainer ?? '', standard?.primaryContainer ?? ''),
    );
    for (const status of STATUSES) {
      expect(contrastRatio(high?.[status] ?? '', high?.surface2 ?? '')).toBeGreaterThan(contrastRatio(standard?.[status] ?? '', standard?.surface2 ?? ''));
    }
  });

  it.each(MODES)('%s 대비 수준 높음은 M3 고대비 목표에 닿는다 — 보조 글자 11:1, 입력 경계 7:1', (mode) => {
    const high = theme(mode, 1);
    expect(contrastRatio(high.textSecondary, high.background)).toBeGreaterThanOrEqual(11 - 0.05);
    expect(contrastRatio(high.borderStrong, high.background)).toBeGreaterThanOrEqual(7 - 0.05);
  });

  it.each(MODES)('%s on* 역할은 짝 역할 위에서 읽힌다(대비 수준 0·0.5·1 모두 4.5:1 이상)', (mode) => {
    for (const contrastLevel of LEVELS) {
      for (const seeds of [DEFAULT_COLORS, { ...DEFAULT_COLORS, primary: DARK_SEED }]) {
        const colors = theme(mode, contrastLevel, seeds);
        for (const name of PALETTES) {
          expect(contrastRatio(colors[`on${cap(name)}`], colors[name])).toBeGreaterThanOrEqual(4.5);
          expect(contrastRatio(colors[`on${cap(name)}Container`], colors[`${name}Container`])).toBeGreaterThanOrEqual(4.5);
        }
        expect(contrastRatio(colors.textInverse, colors.backgroundInverse)).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(colors.primaryInverse, colors.backgroundInverse)).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('neutral 미지정이면 표면·글자가 무채색이다 — 시드 색조가 흰 배경을 물들이지 않는다(두 플랫폼 같음)', () => {
    for (const mode of MODES) {
      const colors = theme(mode);
      for (const role of ['background', 'surface1', 'surface2', 'surface3', 'surface4', 'surface5', 'text', 'textSecondary', 'borderStrong', 'border'] as const) {
        expect(isGray(colors[role])).toBe(true);
      }
    }
    expect(theme('light').surface1).toBe('#ffffff');
  });

  it('neutral 시드를 주면 그 색조로 표면을 만든다(채도는 낮게 제한)', () => {
    const tinted = theme('light', 0, { ...DEFAULT_COLORS, neutral: DARK_SEED });
    expect(chroma(tinted.surface5)).toBeGreaterThan(0.5);
    expect(chroma(tinted.surface5)).toBeLessThan(10);
    expect(hue(tinted.surface5)).toBeGreaterThan(200);
    expect(hue(tinted.surface5)).toBeLessThan(300);
  });

  it('secondary·tertiary·error 시드를 바꾸면 그 역할만 바뀐다', () => {
    const base = theme('light');
    const custom = theme('light', 0, { ...DEFAULT_COLORS, secondary: '#8a2be2', tertiary: '#00a86b', error: '#b00020' });
    expect(custom.secondary).not.toBe(base.secondary);
    expect(custom.tertiary).not.toBe(base.tertiary);
    expect(custom.error).not.toBe(base.error);
    expect(custom.primary).toBe(base.primary);
    expect(custom.background).toBe(base.background);
  });

  it('secondary·tertiary 시드를 주면 M3 스킴 색을 쓰고, 컨테이너 위 글자도 4.5:1 이다(라이트·다크 × 대비 0·0.5·1)', () => {
    for (const seeds of [{ secondary: '#8a2be2', tertiary: '#00a86b' }, { primary: DARK_SEED, secondary: '#ff7a00', tertiary: '#e91e63' }]) {
      for (const mode of MODES) {
        for (const contrastLevel of LEVELS) {
          const custom = theme(mode, contrastLevel, { ...DEFAULT_COLORS, ...seeds });
          expect(chroma(custom.secondary)).toBeGreaterThan(5);
          expect(contrastRatio(custom.onSecondaryContainer, custom.secondaryContainer)).toBeGreaterThanOrEqual(4.5);
          expect(contrastRatio(custom.onTertiaryContainer, custom.tertiaryContainer)).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });

  describe('면 사다리', () => {
    it.each(LEVELS)('라이트(대비 %s)는 흰 페이지(배경 = surface1)이고 surface2~5 가 짙어지며 내려간다', (contrastLevel) => {
      const colors = theme('light', contrastLevel);
      expect(colors.background).toBe('#ffffff');
      expect(colors.surface1).toBe('#ffffff');
      SURFACES.slice(1).forEach((name, i) => expect(tone(colors[name])).toBeLessThan(tone(colors[SURFACES[i] ?? 'surface1'])));
      expect(contrastRatio(colors.surface2, colors.background)).toBeGreaterThanOrEqual(1.08);
    });

    it.each(LEVELS)('다크(대비 %s)는 surface1 이 배경과 같은 페이지 면이고 2~5 는 바탕보다 밝게 오름차순이다', (contrastLevel) => {
      const colors = theme('dark', contrastLevel);
      expect(colors.surface1).toBe(colors.background);
      expect(tone(colors.surface2)).toBeGreaterThan(tone(colors.background) + 5);
      SURFACES.slice(1).forEach((name, i) => expect(tone(colors[name])).toBeGreaterThan(tone(colors[SURFACES[i] ?? 'surface1'])));
    });

    it('다크에서 surface1 을 페이지로, surface2 를 그 위 묶음·카드로 써도 층이 보인다(블라인드 심사 R1 회귀 방지)', () => {
      const dark = theme('dark');
      expect(contrastRatio(dark.surface2, dark.surface1)).toBeGreaterThanOrEqual(1.1);
      expect(contrastRatio(dark.surface2, dark.background)).toBeGreaterThanOrEqual(1.1);
    });

    it('다크 면은 같은 간격으로 밝아진다 — 묶음 → 떠 있는 면 → 그 위, 단 사이 1.12~1.2:1', () => {
      const dark = theme('dark');
      (['surface2', 'surface3', 'surface4', 'surface5'] as const).forEach((name, i) => {
        const below = (['surface1', 'surface2', 'surface3', 'surface4'] as const)[i] ?? 'surface1';
        expect(contrastRatio(dark[name], dark[below])).toBeGreaterThanOrEqual(1.12);
        expect(contrastRatio(dark[name], dark[below])).toBeLessThanOrEqual(1.2);
      });
    });

    it('표준 대비 톤은 라이트 100·100·96.2·93.6·90.5·86.5, 다크 6·6·13·18·23·28 이다(순검정을 쓰지 않는다)', () => {
      const [light, dark] = [theme('light'), theme('dark')];
      const order = ['background', ...SURFACES] as const;
      [100, 100, 96.2, 93.6, 90.5, 86.5].forEach((target, i) => expect(tone(light[order[i] ?? 'background'])).toBeCloseTo(target, 0));
      [6, 6, 13, 18, 23, 28].forEach((target, i) => expect(tone(dark[order[i] ?? 'background'])).toBeCloseTo(target, 0));
    });

    it('면은 대비 수준과 상관없이 같다 — 대비 수준은 글자·테두리만 진하게 한다', () => {
      for (const mode of MODES) {
        const [standard, ...higher] = LEVELS.map((contrastLevel) => theme(mode, contrastLevel));
        higher.forEach((colors) => (['background', ...SURFACES] as const).forEach((name) => expect(colors[name]).toBe(standard?.[name])));
      }
    });
  });

  describe('대비 계약(WCAG) — 라이트·다크 × 대비 수준 0·0.5·1', () => {
    const cases = MODES.flatMap((mode) => LEVELS.map((contrastLevel) => [mode, contrastLevel] as const));

    it.each(cases)('%s(대비 %s) 본문 글자는 바탕과 모든 면 위 7:1 이상', (mode, contrastLevel) => {
      const colors = theme(mode, contrastLevel);
      for (const ground of ['background', ...SURFACES] as const) expect(contrastRatio(colors.text, colors[ground])).toBeGreaterThanOrEqual(7);
    });

    it.each(cases)('%s(대비 %s) 보조 글자는 바탕·surface1~4 위 4.5:1 이상(surface5 는 비활성 채움 전용)', (mode, contrastLevel) => {
      const colors = theme(mode, contrastLevel);
      for (const ground of ['background', 'surface1', 'surface2', 'surface3', 'surface4'] as const) {
        expect(contrastRatio(colors.textSecondary, colors[ground])).toBeGreaterThanOrEqual(4.5);
      }
    });

    it.each(cases)('%s(대비 %s) 입력 칸 경계(borderStrong)는 바탕·묶음 면 위 3:1 이상', (mode, contrastLevel) => {
      const colors = theme(mode, contrastLevel);
      for (const ground of ['background', 'surface1', 'surface2'] as const) expect(contrastRatio(colors.borderStrong, colors[ground])).toBeGreaterThanOrEqual(3);
    });

    it.each(cases)('%s(대비 %s) 상태 색(error·success·warning·info)은 바탕·묶음 면 위 글자로 4.5:1 이상', (mode, contrastLevel) => {
      const colors = theme(mode, contrastLevel);
      for (const status of STATUSES) {
        for (const ground of ['background', 'surface2'] as const) expect(contrastRatio(colors[status], colors[ground])).toBeGreaterThanOrEqual(4.5);
      }
    });

    it.each(cases)('%s(대비 %s) 채움 위 먹 표시(onPrimary/primary)는 7:1 이상 — 선택 칩 체크·탭 캡슐 아이콘이 상태를 말한다', (mode, contrastLevel) => {
      const colors = theme(mode, contrastLevel);
      expect(contrastRatio(colors.onPrimary, colors.primary)).toBeGreaterThanOrEqual(7);
    });
  });

  describe('상태 색', () => {
    it('success·warning·info 는 각 시드로 error 와 같은 톤 규칙의 4역할을 만든다', () => {
      const colors = theme('light');
      const sameAsError = theme('light', 0, { ...DEFAULT_COLORS, success: DEFAULT_COLORS.error });
      expect([sameAsError.success, sameAsError.onSuccess, sameAsError.successContainer, sameAsError.onSuccessContainer]).toEqual([
        colors.error,
        colors.onError,
        colors.errorContainer,
        colors.onErrorContainer,
      ]);
      expect(colors.warning).not.toBe(colors.success);
    });

    it('라이트 main 은 묶음 면(surface2) 위 4.5:1 을 넘는 가장 밝은 톤이고 on 은 흰색이다', () => {
      const colors = theme('light');
      for (const status of STATUSES) {
        expect(contrastRatio(colors[status], colors.surface2)).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(colors[status], colors.surface2)).toBeLessThan(4.6);
        expect(colors[`on${cap(status)}`]).toBe('#ffffff');
      }
    });

    it('다크 main 은 톤 70 이고 on 은 같은 색조의 어두운 먹이다 — 파스텔로 흐려지지 않는다', () => {
      const colors = theme('dark');
      for (const status of STATUSES) {
        expect(tone(colors[status])).toBeCloseTo(70, 0);
        expect(tone(colors[`on${cap(status)}`])).toBeCloseTo(12, 0);
        expect(Math.abs(hue(colors[status]) - hue(DEFAULT_COLORS[status]))).toBeLessThan(3);
      }
    });

    it('info 컨테이너만 색조를 시안 쪽으로 14° 옮긴다', () => {
      const colors = theme('light');
      expect(hue(DEFAULT_COLORS.info) - hue(colors.infoContainer)).toBeCloseTo(14, -1);
      expect(Math.abs(hue(DEFAULT_COLORS.error) - hue(colors.errorContainer))).toBeLessThan(5);
    });
  });
});

describe('contrastRatio() — 내부 대비 함수', () => {
  it('WCAG 2 대비를 잰다(테스트 유틸과 같다)', () => {
    expect(themeContrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(themeContrastRatio('#ffffff', '#ffffff')).toBe(1);
    expect(themeContrastRatio('#ffa20d', '#ffffff')).toBeCloseTo(contrastRatio('#ffa20d', '#ffffff'), 5);
  });
});

describe('getPaletteColors()', () => {
  const colors = createThemeColors(DEFAULT_COLORS, LIGHT);

  it.each(PALETTES)('%s 팔레트 색을 main·onMain·container·onContainer 로 묶는다', (intent) => {
    expect(getPaletteColors(colors, intent)).toEqual({
      main: colors[intent],
      onMain: colors[`on${cap(intent)}`],
      container: colors[`${intent}Container`],
      onContainer: colors[`on${cap(intent)}Container`],
    });
  });
});

describe('withOpacity()', () => {
  it('#rrggbb 에 두 자리 알파를 붙인다', () => {
    expect(withOpacity('#112233', 0.5)).toBe('#11223380');
    expect(withOpacity('#ABCDEF', 0.38)).toBe('#ABCDEF61');
    expect(withOpacity('#000000', 0.12)).toBe('#0000001f');
  });

  it('불투명도는 0~1 로 자른다', () => {
    expect(withOpacity('#112233', 2)).toBe('#112233ff');
    expect(withOpacity('#112233', -1)).toBe('#11223300');
  });

  it('#rrggbb 가 아니면 그대로 돌려준다', () => {
    expect(withOpacity('red', 0.5)).toBe('red');
    expect(withOpacity('#fff', 0.5)).toBe('#fff');
    expect(withOpacity('#11223344', 0.5)).toBe('#11223344');
  });
});

describe('resolveColor()', () => {
  const colors = createThemeColors(DEFAULT_COLORS, LIGHT);

  it('테마 색 이름이면 그 색이다', () => {
    expect(resolveColor(colors, 'primary')).toBe(colors.primary);
    expect(resolveColor(colors, 'surface4')).toBe(colors.surface4);
  });

  it('테마 색 이름이 아니면 직접 지정한 색으로 그대로 쓴다', () => {
    expect(resolveColor(colors, '#123456')).toBe('#123456');
    expect(resolveColor(colors, 'rgba(0, 0, 0, 0.5)')).toBe('rgba(0, 0, 0, 0.5)');
  });

  it('미지정이면 undefined 다', () => {
    expect(resolveColor(colors, undefined)).toBeUndefined();
  });
});
