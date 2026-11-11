import { createComposeColors, createMaterialColorScheme } from '../../native/composeColors';
import { withOpacity } from '../../theme/color';
import { contrastRatio } from '../utils/contrast';
import { createTestTheme } from '../utils/theme';

describe('createComposeColors()', () => {
  const { colors } = createTestTheme();
  const compose = createComposeColors(colors);

  it('채움은 primary + onPrimary — 켠 스위치 트랙·손잡이, 체크박스 칸·체크', () => {
    expect(compose.switch).toMatchObject({ checkedTrackColor: colors.primary, checkedThumbColor: colors.onPrimary, checkedIconColor: colors.primary });
    expect(compose.checkbox).toMatchObject({ checkedColor: colors.primary, checkmarkColor: colors.onPrimary });
  });

  it('얇은 표시는 먹(text) — 고른 라디오. primary 를 얇은 선으로 넘기지 않는다', () => {
    expect(compose.radioButton.selectedColor).toBe(colors.text);
    expect(compose.radioButton.selectedColor).not.toBe(colors.primary);
  });

  it('꺼진 컨트롤의 선·손잡이는 textSecondary — 꺼진 트랙(surface4)과 묶음 면(surface2) 위 3:1(라이트·다크)', () => {
    for (const mode of ['light', 'dark'] as const) {
      const theme = createTestTheme({ mode }).colors;
      const { switch: sw, checkbox, radioButton } = createComposeColors(theme, mode);
      expect(sw).toMatchObject({ uncheckedThumbColor: theme.textSecondary, uncheckedBorderColor: theme.textSecondary, uncheckedTrackColor: theme.surface4 });
      expect(checkbox.uncheckedColor).toBe(theme.textSecondary);
      expect(radioButton.unselectedColor).toBe(theme.textSecondary);
      expect(contrastRatio(sw.uncheckedThumbColor, sw.uncheckedTrackColor)).toBeGreaterThanOrEqual(3);
      expect(contrastRatio(sw.uncheckedBorderColor, theme.surface2)).toBeGreaterThanOrEqual(3);
      expect(contrastRatio(sw.checkedThumbColor, sw.checkedTrackColor)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('비활성은 M3 규칙 — 글자·아이콘 text 38%, 면·선 text 12%', () => {
    expect(compose.disabledText).toBe(withOpacity(colors.text, 0.38));
    expect(compose.checkbox.disabledCheckedColor).toBe(withOpacity(colors.text, 0.38));
    expect(compose.switch.disabledCheckedTrackColor).toBe(withOpacity(colors.text, 0.12));
  });

  it('메뉴 면은 zs-ui 표면, 로더는 iOS 로더와 같은 무채색이다 — 크림(primaryContainer)을 쓰지 않는다', () => {
    expect(compose.menuContainer).toBe(colors.surface3);
    expect(compose.loadingIndicator).toEqual({ color: colors.textSecondary, containerColor: colors.surface4 });
    expect(contrastRatio(compose.loadingIndicator.color, compose.loadingIndicator.containerColor)).toBeGreaterThanOrEqual(3);
  });

  it('시트 뒤 막은 라이트 32%·다크 52% 검정이다', () => {
    expect(compose.bottomSheet.scrimColor).toBe(withOpacity(colors.backdrop, 0.32));
    const dark = createTestTheme({ mode: 'dark' }).colors;
    expect(createComposeColors(dark, 'dark').bottomSheet.scrimColor).toBe(withOpacity(dark.backdrop, 0.52));
  });
});

describe('createMaterialColorScheme()', () => {
  it('Compose 스킴 역할을 zs-ui 색으로 덮는다 — 중립은 무채색, surface1~5 는 surfaceContainerLowest~Highest', () => {
    const { colors } = createTestTheme();
    expect(createMaterialColorScheme(colors, 'light')).toMatchObject({
      primary: colors.primary,
      onPrimary: colors.onPrimary,
      inversePrimary: colors.primaryInverse,
      background: colors.background,
      onBackground: colors.text,
      surface: colors.background,
      onSurface: colors.text,
      onSurfaceVariant: colors.textSecondary,
      outline: colors.borderStrong,
      outlineVariant: colors.border,
      surfaceContainerLowest: colors.surface1,
      surfaceContainerLow: colors.surface2,
      surfaceContainer: colors.surface3,
      surfaceContainerHigh: colors.surface4,
      surfaceContainerHighest: colors.surface5,
      surfaceBright: colors.background,
      surfaceDim: colors.surface5,
      error: colors.error,
      scrim: colors.backdrop,
    });
  });

  it('고도 틴트(surfaceTint)는 투명 — 떠 있는 면에 primary 가 섞이지 않는다', () => {
    const { colors } = createTestTheme();
    expect(createMaterialColorScheme(colors, 'light').surfaceTint).toBe('#00000000');
  });

  it('다크는 가장 밝은 면이 surface5, 가장 어두운 면이 배경이다', () => {
    const { colors } = createTestTheme({ mode: 'dark' });
    expect(createMaterialColorScheme(colors, 'dark')).toMatchObject({ surfaceBright: colors.surface5, surfaceDim: colors.background, surface: colors.background });
  });

  it('M3 fixed 역할은 덮지 않는다(seedColor 팔레트 값)', () => {
    const { colors } = createTestTheme();
    expect(createMaterialColorScheme(colors, 'light')).not.toHaveProperty('primaryFixed');
  });
});
