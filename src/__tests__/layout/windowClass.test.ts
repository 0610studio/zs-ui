import { classifyHeight, classifyWidth, isSameWindowLayout, narrowerClass, resolveContentMaxWidth, resolveWindowLayout } from '../../layout/windowClass';

describe('resolveWindowLayout', () => {
  describe('iOS — compact 경계는 size class trait', () => {
    it.each([
      ['iPhone 세로', 402, 874, 'compact', 'regular', 'compact', 'medium'],
      ['iPhone 가로 — 874pt 여도 trait 가 compact 면 compact', 874, 402, 'compact', 'compact', 'compact', 'compact'],
      ['iPhone Pro Max 가로 — regular', 956, 440, 'regular', 'compact', 'expanded', 'compact'],
      ['iPad 11 세로 — regular 이고 840 미만', 834, 1210, 'regular', 'regular', 'medium', 'expanded'],
      ['iPad 11 가로', 1210, 834, 'regular', 'regular', 'expanded', 'medium'],
    ] as const)('%s', (_, width, height, horizontalSizeClass, verticalSizeClass, widthClass, heightClass) => {
      const layout = resolveWindowLayout({ width, height, horizontalSizeClass, verticalSizeClass }, 'ios', true);
      expect(layout.widthClass).toBe(widthClass);
      expect(layout.heightClass).toBe(heightClass);
      expect(layout.platform).toEqual({ os: 'ios', horizontalSizeClass, verticalSizeClass });
      expect(layout.measured).toBe(true);
    });

    it('측정 전 추정값은 폭 기준이고 size class 를 지어내지 않는다', () => {
      const layout = resolveWindowLayout({ width: 402, height: 874 }, 'ios', false);
      expect(layout.widthClass).toBe('compact');
      expect(layout.measured).toBe(false);
      expect(layout.platform).toEqual({ os: 'ios', horizontalSizeClass: null, verticalSizeClass: null });
    });
  });

  describe('Android 네이티브 관찰자 — androidx.window WindowSizeClass', () => {
    it('네이티브가 정한 크기 클래스를 그대로 쓰고 브레이크포인트 하한을 platform 에 싣는다', () => {
      const layout = resolveWindowLayout(
        { width: 749.71, height: 832, widthClass: 'medium', heightClass: 'medium', minWidthDp: 600, minHeightDp: 480 },
        'android',
        true,
      );
      expect(layout).toMatchObject({
        width: 749.71,
        widthClass: 'medium',
        heightClass: 'medium',
        platform: { os: 'android', windowSizeClass: { minWidthDp: 600, minHeightDp: 480 } },
      });
    });

    it('네이티브 값이 폭 기준과 달라도 다시 분류하지 않는다', () => {
      const layout = resolveWindowLayout({ width: 900, height: 400, widthClass: 'medium', heightClass: 'compact' }, 'android', true);
      expect(layout.widthClass).toBe('medium');
      expect(layout.platform).toEqual({ os: 'android', windowSizeClass: { minWidthDp: 0, minHeightDp: 0 } });
    });

    it('측정 전 추정값은 windowSizeClass 를 지어내지 않는다(null)', () => {
      expect(resolveWindowLayout({ width: 411, height: 960 }, 'android', false).platform).toEqual({
        os: 'android',
        windowSizeClass: null,
      });
    });
  });

  describe('Android·Web — Material 3 브레이크포인트', () => {
    it.each([
      [599, 'compact'],
      [600, 'medium'],
      [839, 'medium'],
      [840, 'expanded'],
      [1600, 'expanded'],
    ] as const)('폭 %d → %s', (width, widthClass) => {
      expect(resolveWindowLayout({ width, height: 800 }, 'android', true).widthClass).toBe(widthClass);
    });

    it.each([
      [479, 'compact'],
      [480, 'medium'],
      [900, 'expanded'],
    ] as const)('높이 %d → %s', (height, heightClass) => {
      expect(resolveWindowLayout({ width: 400, height }, 'android', true).heightClass).toBe(heightClass);
    });
  });

  it('가로가 더 길면 landscape', () => {
    expect(resolveWindowLayout({ width: 900, height: 400 }, 'android', true).orientation).toBe('landscape');
    expect(resolveWindowLayout({ width: 400, height: 900 }, 'android', true).orientation).toBe('portrait');
  });
});

describe('isSameWindowLayout', () => {
  it('같은 값이면 true, 하나라도 다르면 false', () => {
    const a = resolveWindowLayout({ width: 400, height: 800 }, 'android', true);
    expect(isSameWindowLayout(a, { ...a })).toBe(true);
    expect(isSameWindowLayout(a, { ...a, width: 401 })).toBe(false);
    expect(isSameWindowLayout(a, { ...a, measured: false })).toBe(false);
  });
});

describe('readableMaxWidth', () => {
  it("'system' 은 iOS readableContentGuide 폭을 쓴다", () => {
    const layout = resolveWindowLayout(
      { width: 834, height: 1210, horizontalSizeClass: 'regular', verticalSizeClass: 'regular', readableWidth: 672 },
      'ios',
      true,
      'system',
    );
    expect(layout.readableMaxWidth).toBe(672);
  });

  it("'system' 인데 플랫폼 가독 폭이 없으면 Material 3 시트 최대 폭 640", () => {
    expect(resolveWindowLayout({ width: 900, height: 800 }, 'android', true, 'system').readableMaxWidth).toBe(640);
    expect(resolveWindowLayout({ width: 900, height: 800 }, 'android', true).readableMaxWidth).toBe(640);
  });

  it('숫자는 모든 플랫폼에 그대로 적용한다', () => {
    expect(
      resolveWindowLayout({ width: 834, height: 1210, horizontalSizeClass: 'regular', verticalSizeClass: 'regular', readableWidth: 672 }, 'ios', true, 600)
        .readableMaxWidth,
    ).toBe(600);
  });
});

describe('resolveContentMaxWidth', () => {
  const expanded = { widthClass: 'expanded', readableMaxWidth: 896 } as const;
  const medium = { widthClass: 'medium', readableMaxWidth: 818 } as const;
  const compact = { widthClass: 'compact', readableMaxWidth: 370 } as const;

  it("'readable' 은 넓은 창에서 LayoutProvider 가독 폭을 쓴다", () => {
    expect(resolveContentMaxWidth('readable', expanded)).toBe(896);
    expect(resolveContentMaxWidth('readable', medium)).toBe(818);
  });

  it('숫자는 넓은 창에서 그대로 쓴다', () => {
    expect(resolveContentMaxWidth(600, expanded)).toBe(600);
  });

  it("compact 창과 'none' 은 제한하지 않는다", () => {
    expect(resolveContentMaxWidth('readable', compact)).toBeUndefined();
    expect(resolveContentMaxWidth(600, compact)).toBeUndefined();
    expect(resolveContentMaxWidth('none', expanded)).toBeUndefined();
  });
});

describe('classifyWidth', () => {
  it('Material 3 폭 브레이크포인트(600/840)로만 나눈다', () => {
    expect(classifyWidth(599)).toBe('compact');
    expect(classifyWidth(600)).toBe('medium');
    expect(classifyWidth(839)).toBe('medium');
    expect(classifyWidth(840)).toBe('expanded');
  });
});

describe('narrowerClass', () => {
  it('둘 중 좁은 클래스를 고른다', () => {
    expect(narrowerClass('compact', 'medium')).toBe('compact');
    expect(narrowerClass('expanded', 'medium')).toBe('medium');
    expect(narrowerClass('expanded', 'expanded')).toBe('expanded');
  });
});

describe('classifyHeight', () => {
  it('Material 3 높이 브레이크포인트 480/900', () => {
    expect(classifyHeight(479)).toBe('compact');
    expect(classifyHeight(480)).toBe('medium');
    expect(classifyHeight(899)).toBe('medium');
    expect(classifyHeight(900)).toBe('expanded');
  });
});
