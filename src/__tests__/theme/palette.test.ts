import palette, { themeFactory } from '../../theme/palette';

describe('palette()', () => {
  it('기본(light) 모드 팔레트를 생성한다', () => {
    const theme = palette();
    expect(theme.mode).toBe('light');
    expect(theme.mainColor.primary).toBe('#ffa20d');
    expect(theme.text.white).toBe('#FFFFFF');
    expect(theme.background.base).toBe('#ffffff');
  });

  it('다크 모드 팔레트를 생성한다', () => {
    const theme = palette({ mode: 'dark' });
    expect(theme.mode).toBe('dark');
    expect(theme.background.neutral).toBe('#3D3D3D');
    expect(theme.text.black).toBe('#000000');
  });
});

describe('themeFactory()', () => {
  it('light.primary.main을 재정의하면 text와 background도 자동으로 반영된다', () => {
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
    expect(theme.mainColor.primary).toBe('#123456');
  });

  it('themeColors로 text와 background를 덮어쓸 수 있다', () => {
    const createPalette = themeFactory({
      light: {
        primary: { main: '#123456' },
      },
    });
    const theme = createPalette({
      mode: 'light',
      themeColors: {
        light: {
          text: { primary: '#789ABC' },
          background: { primary: '#DEF123' },
        } as any,
      },
    });
    expect(theme.mode).toBe('light');
    expect(theme.primary.main).toBe('#123456');
    expect(theme.text.primary).toBe('#789ABC');
    expect(theme.background.primary).toBe('#DEF123');
  });

  it('dark.grey.main을 재정의하면 mainColor도 자동으로 반영된다', () => {
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

  it('themeColors로 mainColor를 덮어쓸 수 있다', () => {
    const createPalette = themeFactory({
      dark: {
        grey: { main: '#0A0A0A' },
      },
    });
    const theme = createPalette({
      mode: 'dark',
      themeColors: {
        dark: {
          mainColor: { grey: '#999999' },
        } as any,
      },
    });
    expect(theme.mode).toBe('dark');
    expect(theme.grey.main).toBe('#0A0A0A');
    expect(theme.mainColor.grey).toBe('#999999');
  });
});



