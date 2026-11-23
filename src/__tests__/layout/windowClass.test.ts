import { classifyHeight, classifyWidth, isSameWindowLayout, narrowerClass, resolveContentMaxWidth, resolveLargeScreen, resolveWindowLayout } from '../../layout/windowClass';

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

describe('resolveLargeScreen — 큰 화면 창(밀도·글자 크기와 무관)', () => {
  const fold = (orientation: 'vertical' | 'horizontal', x: number, y: number, width: number, height: number) =>
    ({ type: 'fold' as const, x, y, width, height, orientation, state: 'flat' as const, active: false });

  it('iOS 는 가로 크기 등급 regular 만 큰 화면 — iPad·펼친 Duo 는 true, iPhone 은 false', () => {
    expect(resolveLargeScreen({ width: 834, height: 1194, horizontalSizeClass: 'regular', verticalSizeClass: 'regular' }, 'ios')).toBe(true);
    expect(resolveLargeScreen({ width: 951, height: 760, horizontalSizeClass: 'regular', verticalSizeClass: 'regular' }, 'ios')).toBe(true);
    expect(resolveLargeScreen({ width: 440, height: 956, horizontalSizeClass: 'compact', verticalSizeClass: 'regular' }, 'ios')).toBe(false);
  });

  it('Android 네이티브가 기기 고유 밀도 크기를 주면 그 짧은 변 600dp 로만 정한다', () => {
    // 화면 확대한 Fold7(현재 599dp, 고유 밀도 420 기준 749.7dp) — 큰 화면
    expect(resolveLargeScreen({ width: 598.6, height: 664, stableWidth: 749.7, stableHeight: 832 }, 'android')).toBe(true);
    // 화면을 극단적으로 축소한 바형 폰(현재 664dp 이지만 고유 밀도 기준 411dp) — 큰 화면 아님
    expect(resolveLargeScreen({ width: 664, height: 1491, stableWidth: 411.4, stableHeight: 923.4 }, 'android')).toBe(false);
    // 화면 확대한 8인치 태블릿(현재 560dp, 고유 기준 800dp)
    expect(resolveLargeScreen({ width: 560, height: 896, stableWidth: 800, stableHeight: 1280 }, 'android')).toBe(true);
    // 바형 폰 가로(고유 기준 짧은 변 411)
    expect(resolveLargeScreen({ width: 914, height: 411, stableWidth: 914, stableHeight: 411 }, 'android')).toBe(false);
  });

  it('고유 밀도 크기가 없는 이전 네이티브: 책처럼 펼친 폴더블(접힘선 + 비율 ≤ 1.6)은 화면 확대해도 큰 화면', () => {
    expect(resolveLargeScreen({ width: 598.6, height: 664, displayFeatures: [fold('vertical', 299.3, 0, 0, 664)] }, 'android')).toBe(true);
    expect(resolveLargeScreen({ width: 749.7, height: 832, displayFeatures: [fold('vertical', 374.9, 0, 0, 832)] }, 'android')).toBe(true);
    // 같은 폭이라도 접힘선이 없으면(바형 폰 분할 창 등) 아님
    expect(resolveLargeScreen({ width: 598.6, height: 664 }, 'android')).toBe(false);
    // 위아래로 여는 Flip(가로 접힘선, 비율 약 2.3)은 아님
    expect(resolveLargeScreen({ width: 411.4, height: 960, displayFeatures: [fold('horizontal', 0, 480, 411.4, 0)] }, 'android')).toBe(false);
  });

  it('고유 밀도 크기가 없는 이전 네이티브: 태블릿(짧은 변 ≥ 600, 폰 비율 아님)은 큰 화면, 바형 폰은 어떤 밀도에서도 아님', () => {
    expect(resolveLargeScreen({ width: 800, height: 1280 }, 'android')).toBe(true);
    expect(resolveLargeScreen({ width: 600, height: 1067 }, 'android')).toBe(true);
    expect(resolveLargeScreen({ width: 1280, height: 800 }, 'android')).toBe(true);
    // 극단적으로 축소한 바형 폰(짧은 변 664, 비율 2.24)·바형 폰 가로
    expect(resolveLargeScreen({ width: 664, height: 1491 }, 'android')).toBe(false);
    expect(resolveLargeScreen({ width: 914, height: 411 }, 'android')).toBe(false);
  });

  it('resolveWindowLayout 이 largeScreen 을 채우고 같은지 비교에 넣는다', () => {
    const fold7 = resolveWindowLayout({ width: 598.6, height: 664, widthClass: 'compact', heightClass: 'medium', displayFeatures: [fold('vertical', 299.3, 0, 0, 664)] }, 'android', true);
    expect(fold7).toMatchObject({ widthClass: 'compact', largeScreen: true });
    const phone = resolveWindowLayout({ width: 598.6, height: 664, widthClass: 'compact', heightClass: 'medium' }, 'android', true);
    expect(phone.largeScreen).toBe(false);
    expect(isSameWindowLayout(fold7, phone)).toBe(false);
  });
});
