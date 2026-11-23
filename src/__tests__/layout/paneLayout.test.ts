import { MATERIAL_PANE_SPACER, PANE_MIN_WIDTH, resolvePaneArrangement } from '../../layout/paneLayout';

describe('resolvePaneArrangement', () => {
  it('compact 창은 폭과 무관하게 1단', () => {
    expect(resolvePaneArrangement({ widthClass: 'compact', width: 900, primaryFraction: 0.4, dividerWidth: 0 })).toEqual({ mode: 'single' });
  });

  it('넓은 창은 비율로 나눈다 (구분선 폭 제외)', () => {
    expect(resolvePaneArrangement({ widthClass: 'expanded', width: 1210, primaryFraction: 0.4, dividerWidth: 10 })).toEqual({
      mode: 'split',
      basis: 'fraction',
      primaryWidth: 480,
      secondaryWidth: 720,
      gap: 0,
    });
  });

  it('두 pane 이 최소 폭을 확보하지 못하면 1단', () => {
    expect(resolvePaneArrangement({ widthClass: 'medium', width: PANE_MIN_WIDTH * 2 - 1, primaryFraction: 0.5, dividerWidth: 0 })).toEqual({ mode: 'single' });
  });

  it('비율이 극단이어도 각 pane 최소 폭을 지킨다', () => {
    const narrow = resolvePaneArrangement({ widthClass: 'expanded', width: 1000, primaryFraction: 0.1, dividerWidth: 0 });
    expect(narrow).toMatchObject({ mode: 'split', primaryWidth: PANE_MIN_WIDTH, secondaryWidth: 1000 - PANE_MIN_WIDTH });
    const wide = resolvePaneArrangement({ widthClass: 'expanded', width: 1000, primaryFraction: 0.95, dividerWidth: 0 });
    expect(wide).toMatchObject({ mode: 'split', primaryWidth: 1000 - PANE_MIN_WIDTH, secondaryWidth: PANE_MIN_WIDTH });
  });

  it('M3 spacer(24) 를 주면 그만큼 비우고 gap 으로 돌려준다', () => {
    expect(MATERIAL_PANE_SPACER).toBe(24);
    expect(resolvePaneArrangement({ widthClass: 'expanded', width: 1224, primaryFraction: 0.4, dividerWidth: 0, spacing: MATERIAL_PANE_SPACER })).toEqual({
      mode: 'split',
      basis: 'fraction',
      primaryWidth: 480,
      secondaryWidth: 720,
      gap: 24,
    });
  });

  it('간격까지 빼고 두 pane 최소 폭이 안 되면 1단', () => {
    const width = PANE_MIN_WIDTH * 2 + 23;
    expect(resolvePaneArrangement({ widthClass: 'medium', width, primaryFraction: 0.5, dividerWidth: 0 })).toMatchObject({ mode: 'split' });
    expect(resolvePaneArrangement({ widthClass: 'medium', width, primaryFraction: 0.5, dividerWidth: 0, spacing: 24 })).toEqual({ mode: 'single' });
  });

  it('폴더블 내부 화면 레일 옆(Fold7 750 − 레일 96 = 654, 간격 24)은 두 칸이다 — 각 315', () => {
    expect(resolvePaneArrangement({ widthClass: 'medium', width: 654, primaryFraction: 0.5, dividerWidth: 0, spacing: 24 })).toEqual({
      mode: 'split',
      basis: 'fraction',
      primaryWidth: 315,
      secondaryWidth: 315,
      gap: 24,
    });
  });

  it('좌우 inset 을 뺀 폭에 비율을 곱하고 각 pane 에 자기 쪽 inset 을 더한다 (iPhone Duo 레일 84)', () => {
    expect(resolvePaneArrangement({ widthClass: 'expanded', width: 951, primaryFraction: 0.5, dividerWidth: 0, insets: { start: 0, end: 84 } })).toEqual({
      mode: 'split',
      basis: 'fraction',
      primaryWidth: 434,
      secondaryWidth: 951 - 84 - 434 + 84,
      gap: 0,
    });
    expect(resolvePaneArrangement({ widthClass: 'medium', width: 660, primaryFraction: 0.5, dividerWidth: 0, insets: { start: 44, end: 44 } })).toEqual({ mode: 'single' });
  });

  it('큰 화면 창(largeScreen)은 폭 등급과 상관없이 나눈다 — 화면 확대한 Fold7(526dpi, w599dp)은 각 287', () => {
    expect(resolvePaneArrangement({ widthClass: 'compact', width: 598, primaryFraction: 0.5, dividerWidth: 0, spacing: 24, largeScreen: true })).toEqual({
      mode: 'split',
      basis: 'fraction',
      primaryWidth: 287,
      secondaryWidth: 287,
      gap: 24,
    });
  });

  it('큰 화면 창은 pane 을 300 까지 확보하고, 모자라면 240 까지 줄인 뒤 그보다 좁으면 1단', () => {
    expect(resolvePaneArrangement({ widthClass: 'expanded', width: 1000, primaryFraction: 0.4, dividerWidth: 0, largeScreen: true })).toMatchObject({ primaryWidth: 400, secondaryWidth: 600 });
    expect(resolvePaneArrangement({ widthClass: 'medium', width: 700, primaryFraction: 0.2, dividerWidth: 0, largeScreen: true })).toMatchObject({ primaryWidth: 300 });
    expect(resolvePaneArrangement({ widthClass: 'compact', width: 504, primaryFraction: 0.5, dividerWidth: 0, spacing: 24, largeScreen: true })).toMatchObject({ mode: 'split', primaryWidth: 240, secondaryWidth: 240 });
    expect(resolvePaneArrangement({ widthClass: 'compact', width: 503, primaryFraction: 0.5, dividerWidth: 0, spacing: 24, largeScreen: true })).toEqual({ mode: 'single' });
  });

  it('큰 화면 창이 아니면(바형 폰) 폭이 넓어도 1단 — 접힘선 경계 분할만 예외', () => {
    expect(resolvePaneArrangement({ widthClass: 'expanded', width: 900, primaryFraction: 0.5, dividerWidth: 0, spacing: 24, largeScreen: false })).toEqual({ mode: 'single' });
  });

  it('접힘선 경계 분할은 inset 과 무관하게 화면 위치 그대로다', () => {
    const fold = { orientation: 'vertical' as const, start: 475, size: 0, active: true };
    expect(resolvePaneArrangement({ widthClass: 'expanded', width: 951, primaryFraction: 0.5, dividerWidth: 0, fold, insets: { start: 0, end: 84 } })).toMatchObject({
      basis: 'fold',
      primaryWidth: 475,
      secondaryWidth: 476,
    });
  });

  it('비율은 0~1 로 자른다', () => {
    expect(resolvePaneArrangement({ widthClass: 'expanded', width: 1000, primaryFraction: -1, dividerWidth: 0 })).toMatchObject({ primaryWidth: PANE_MIN_WIDTH });
    expect(resolvePaneArrangement({ widthClass: 'expanded', width: 1000, primaryFraction: 3, dividerWidth: 0 })).toMatchObject({ secondaryWidth: PANE_MIN_WIDTH });
  });
});

describe('resolvePaneArrangement 접힘선', () => {
  const base = { widthClass: 'medium', width: 749.7, primaryFraction: 0.4, dividerWidth: 0 } as const;
  const vertical = (start: number, size = 0, active = false) => ({ orientation: 'vertical', start, size, active }) as const;

  it('화면을 가르는(active) 세로 접힘선이면 비율 대신 접힘선 경계로 나눈다', () => {
    expect(resolvePaneArrangement({ ...base, fold: vertical(374.9, 0, true) })).toEqual({
      mode: 'split',
      basis: 'fold',
      primaryWidth: 374.9,
      secondaryWidth: 749.7 - 374.9,
      gap: 0,
    });
  });

  it('평평한(active 아님) 접힘선은 경계로 나누지 않고 일반 규칙(비율·간격)을 따른다 (Fold7 펼침·iPhone Duo)', () => {
    expect(resolvePaneArrangement({ ...base, width: 832, fold: vertical(416) })).toEqual({
      mode: 'split',
      basis: 'fraction',
      primaryWidth: 333,
      secondaryWidth: 499,
      gap: 0,
    });
    expect(resolvePaneArrangement({ ...base, width: 832, spacing: 24, fold: vertical(416) })).toMatchObject({ basis: 'fraction', gap: 24 });
  });

  it('두께가 있는 힌지는 그 폭만큼 비운다', () => {
    const result = resolvePaneArrangement({ ...base, width: 1114, fold: vertical(540, 34, true) });
    expect(result).toEqual({ mode: 'split', basis: 'fold', primaryWidth: 540, secondaryWidth: 540, gap: 34 });
  });

  it('RTL 이면 primary(시작 쪽)는 접힘선 오른쪽', () => {
    expect(resolvePaneArrangement({ ...base, width: 1000, fold: vertical(600, 0, true), rtl: true })).toMatchObject({
      primaryWidth: 400,
      secondaryWidth: 600,
    });
  });

  it('화면을 가르는 접힘선은 좁아도, compact 창이어도 경계로 나눈다 (Android 분리형 힌지)', () => {
    expect(resolvePaneArrangement({ ...base, widthClass: 'compact', width: 540, fold: vertical(260, 20, true) })).toEqual({
      mode: 'split',
      basis: 'fold',
      primaryWidth: 260,
      secondaryWidth: 260,
      gap: 20,
    });
  });

  it('compact 창의 평평한 접힘선은 1단', () => {
    expect(resolvePaneArrangement({ ...base, widthClass: 'compact', fold: vertical(374.9) })).toEqual({ mode: 'single' });
  });

  it('가로 접힘선·레이아웃 밖 접힘선은 무시하고 비율 분할', () => {
    expect(resolvePaneArrangement({ ...base, width: 832, fold: { orientation: 'horizontal', start: 374.9, size: 0, active: true } })).toMatchObject({ basis: 'fraction' });
    expect(resolvePaneArrangement({ ...base, fold: vertical(0, 0, true) })).toMatchObject({ basis: 'fraction' });
    expect(resolvePaneArrangement({ ...base, fold: vertical(749.7, 0, true) })).toMatchObject({ basis: 'fraction' });
  });
});

describe('resolvePaneArrangement 테이블탑', () => {
  const base = { widthClass: 'medium', width: 832, height: 700, primaryFraction: 0.4, dividerWidth: 0 } as const;
  const horizontal = (active: boolean, size = 0) => ({ orientation: 'horizontal', start: 258.9, size, active }) as const;

  it('tabletop 을 켜면 화면을 가르는 가로 접힘선 위·아래로 나눈다', () => {
    expect(resolvePaneArrangement({ ...base, tabletop: true, fold: horizontal(true) })).toEqual({
      mode: 'stacked',
      primaryHeight: 258.9,
      secondaryHeight: 700 - 258.9,
      gap: 0,
    });
    expect(resolvePaneArrangement({ ...base, tabletop: true, fold: horizontal(true, 24) })).toMatchObject({ gap: 24, secondaryHeight: 700 - 258.9 - 24 });
  });

  it('기본(끔)은 재배치하지 않는다 — 가로 접힘선은 비율 분할', () => {
    expect(resolvePaneArrangement({ ...base, fold: horizontal(true) })).toMatchObject({ mode: 'split', basis: 'fraction' });
  });

  it('평평한 가로 접힘선·높이를 모를 때·세로 접힘선은 테이블탑이 아니다', () => {
    expect(resolvePaneArrangement({ ...base, tabletop: true, fold: horizontal(false) })).toMatchObject({ mode: 'split' });
    expect(resolvePaneArrangement({ ...base, height: undefined, tabletop: true, fold: horizontal(true) })).toMatchObject({ mode: 'split' });
    expect(
      resolvePaneArrangement({ ...base, tabletop: true, fold: { orientation: 'vertical', start: 416, size: 0, active: true } }),
    ).toMatchObject({ mode: 'split', basis: 'fold' });
  });
});
