import typography from '../../theme/typography';

describe('typography()', () => {
  it('기본 themeFonts가 없는 경우에도 각 variant가 생성된다', () => {
    const t = typography({});
    expect((t.heading[1] as any).fontSize).toBe(36);
    expect((t.title[2] as any).fontSize).toBe(14);
    expect((t.subTitle[3] as any).fontSize).toBe(13);
    expect((t.label[6] as any).fontSize).toBe(10);
    expect((t.caption[4] as any).fontSize).toBe(9);
  });

  it('themeFonts 매핑이 반영된다', () => {
    const themeFonts = {
      100: 'Thin',
      200: 'ExtraLight',
      300: 'Light',
      400: 'Regular',
      500: 'Medium',
      600: 'SemiBold',
      700: 'Bold',
      800: 'ExtraBold',
      900: 'Black',
    } as const;

    const t = typography({ themeFonts });
    expect((t.heading[1] as any).fontFamily).toBe('Bold');
    expect((t.title[5] as any).fontFamily).toBe('Bold');
    expect((t.subTitle[2] as any).fontFamily).toBe('SemiBold');
    expect((t.label[4] as any).fontFamily).toBe('Medium');
    expect((t.body[3] as any).fontFamily).toBe('Regular');
    expect((t.caption[6] as any).fontFamily).toBe('Regular');
  });
});



