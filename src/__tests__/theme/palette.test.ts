import palette, { themeFactory } from '../../theme/palette';

describe('palette()', () => {
  it('기본(light) 모드 팔레트를 생성한다', () => {
    const theme = palette();
    expect(theme.mode).toBe('light');
    expect(theme.mainColor.primary).toBe('#FF9F06');
    expect(theme.text.white).toBe('#FFFFFF');
    expect(theme.background.base).toBe('#FFFFFF');
  });

  it('다크 모드 팔레트를 생성한다', () => {
    const theme = palette({ mode: 'dark' });
    expect(theme.mode).toBe('dark');
    expect(theme.background.neutral).toBe('#3D3D3D');
    expect(theme.text.black).toBe('#000000');
  });
});

describe('themeFactory()', () => {
  it('light.primary.main을 재정의한다', () => {
    const createPalette = themeFactory({
      light: {
        primary: { main: '#123456' },
      },
    });
    const theme = createPalette({ mode: 'light' });
    expect(theme.mode).toBe('light');
    expect(theme.primary.main).toBe('#123456');
    expect(theme.text.primary).toBe('#123456');
    expect(theme.background.primary).toBe('#123456');
  });

  it('dark.grey.main을 재정의하고 mainColor.grey가 반영된다', () => {
    const createPalette = themeFactory({
      dark: {
        grey: { main: '#0A0A0A' },
      },
    });
    const theme = createPalette({ mode: 'dark' });
    expect(theme.mode).toBe('dark');
    expect(theme.grey.main).toBe('#0A0A0A');
    expect(theme.mainColor.grey).toBe('#0A0A0A');
  });
});



