import {
  DEFAULT_MAX_CONTENT_WIDTH,
  cellCenter,
  cellRect,
  computeGridLayout,
  dayCenter,
  dotCenter,
} from '../../../ui/ZSCalendar/core/layout';

describe('ZSCalendar core/layout — 반응형 폭 (P4 해소)', () => {
  it('폭을 7등분해 셀 폭을 만든다', () => {
    const metrics = computeGridLayout({ containerWidth: 350, rowCount: 5, maxContentWidth: false });
    expect(metrics.gridWidth).toBe(350);
    expect(metrics.cellWidth).toBe(50);
    expect(metrics.offsetX).toBe(0);
  });

  it('태블릿 폭은 maxContentWidth 로 잘리고 가운데 정렬된다', () => {
    const metrics = computeGridLayout({ containerWidth: 1024, rowCount: 5 });
    expect(metrics.gridWidth).toBe(DEFAULT_MAX_CONTENT_WIDTH);
    expect(metrics.offsetX).toBe((1024 - DEFAULT_MAX_CONTENT_WIDTH) / 2);
  });

  it('maxContentWidth=false 면 전폭을 쓴다', () => {
    const metrics = computeGridLayout({ containerWidth: 1024, rowCount: 5, maxContentWidth: false });
    expect(metrics.gridWidth).toBe(1024);
    expect(metrics.offsetX).toBe(0);
  });

  it('폭이 0 이어도(측정 전) 음수나 NaN 이 나오지 않는다', () => {
    const metrics = computeGridLayout({ containerWidth: 0, rowCount: 6 });
    expect(metrics.gridWidth).toBe(0);
    expect(metrics.cellWidth).toBe(0);
    expect(metrics.offsetX).toBe(0);
    expect(Number.isFinite(metrics.totalHeight)).toBe(true);
  });

  it('행 높이는 min/max 로 클램프된다', () => {
    const narrow = computeGridLayout({ containerWidth: 210, rowCount: 6 }); // 셀 폭 30
    expect(narrow.rowHeight).toBe(44);
    const wide = computeGridLayout({ containerWidth: 700, rowCount: 6, maxContentWidth: false }); // 셀 폭 100
    expect(wide.rowHeight).toBe(76);
  });

  it('totalHeight 는 헤더 + 행 높이 × 행 수, rowsHeight 는 행만', () => {
    const metrics = computeGridLayout({ containerWidth: 350, rowCount: 6, weekdayHeaderHeight: 30 });
    expect(metrics.rowsHeight).toBe(metrics.rowHeight * 6);
    expect(metrics.totalHeight).toBe(30 + metrics.rowsHeight);
  });
});

describe('ZSCalendar core/layout — 셀 폭 단계 조정', () => {
  it('소형폰(320pt)에서 dot 개수와 폰트가 줄어든다', () => {
    const small = computeGridLayout({ containerWidth: 320, rowCount: 6 }); // 셀 폭 ≈45.7
    const tablet = computeGridLayout({ containerWidth: 520, rowCount: 6 }); // 셀 폭 ≈74.3
    // 최대 개수는 두 줄에 들어가는 만큼 — 줄당 개수가 폭을 따라간다
    expect(small.maxDots).toBe(small.dotsPerRow * 2);
    expect(tablet.maxDots).toBe(tablet.dotsPerRow * 2);
    expect(small.dotsPerRow).toBeLessThanOrEqual(tablet.dotsPerRow);
    expect(small.dayFontSize).toBeLessThan(tablet.dayFontSize);
    expect(small.dotRadius).toBeLessThan(tablet.dotRadius);
  });

  it('아주 좁은 폭에서도 한 줄에 dot 이 여러 개 들어가고, 두 줄이 카드 안에 머문다', () => {
    const m = computeGridLayout({ containerWidth: 240, rowCount: 6 });
    expect(m.dotsPerRow).toBeGreaterThanOrEqual(3);
    expect(m.maxDots).toBe(m.dotsPerRow * 2);
    // 두 줄일 때 아래 줄 바닥이 행 밖으로 나가지 않는다 (선택 카드 아래 인셋 2 를 남긴다)
    const secondRowBottom = m.dotCenterOffsetY + (m.dotRadius * 2 + m.dotGap) / 2 + m.dotRadius;
    expect(secondRowBottom).toBeLessThanOrEqual(m.rowHeight - 2);
  });

  it('단계 경계에서 값이 단조 증가한다', () => {
    const widths = [240, 300, 340, 400, 460, 520];
    const fontSizes = widths.map((w) => computeGridLayout({ containerWidth: w, rowCount: 5 }).dayFontSize);
    fontSizes.forEach((size, index) => {
      if (index === 0) return;
      expect(size).toBeGreaterThanOrEqual(fontSizes[index - 1] as number);
    });
  });
});

describe('ZSCalendar core/layout — 좌표 계산', () => {
  const metrics = computeGridLayout({ containerWidth: 350, rowCount: 5, weekdayHeaderHeight: 28, maxContentWidth: false });

  it('cellRect 은 주 행 영역(0,0) 기준으로 격자를 빈틈없이 채운다', () => {
    const first = cellRect(metrics, 0, 0);
    expect(first).toEqual({ x: 0, y: 0, width: 50, height: metrics.rowHeight });
    const last = cellRect(metrics, 4, 6);
    expect(last.x + last.width).toBe(metrics.gridWidth);
    expect(last.y + last.height).toBe(metrics.rowsHeight);
  });

  it('cellCenter 는 사각형 한가운데', () => {
    const rect = cellRect(metrics, 2, 3);
    expect(cellCenter(metrics, 2, 3)).toEqual({ x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 });
  });

  it('숫자 중심은 dot 중심보다 위에 있고 둘 다 셀 안에 있다', () => {
    const rect = cellRect(metrics, 1, 2);
    const day = dayCenter(metrics, 1, 2);
    const dot = dotCenter(metrics, 1, 2);
    expect(day.y).toBeLessThan(dot.y);
    expect(day.y).toBeGreaterThan(rect.y);
    expect(dot.y).toBeLessThan(rect.y + rect.height);
  });

  it('선택 원이 셀 밖으로 삐져나오지 않는다', () => {
    [240, 320, 390, 520, 1024].forEach((width) => {
      const m = computeGridLayout({ containerWidth: width, rowCount: 6 });
      expect(m.selectionRadius * 2).toBeLessThanOrEqual(m.cellWidth);
      expect(m.dayCenterOffsetY - m.selectionRadius).toBeGreaterThan(0);
      expect(m.dayCenterOffsetY + m.selectionRadius).toBeLessThanOrEqual(m.rowHeight);
    });
  });

  it('선택 원과 dot 줄이 어떤 셀 크기에서도 겹치지 않는다', () => {
    [240, 320, 375, 390, 430, 520, 700, 1024].forEach((width) => {
      const m = computeGridLayout({ containerWidth: width, rowCount: 6 });
      // dot 을 선택 색으로 덮어쓰지 않고 이벤트 색 그대로 그릴 수 있는 조건
      expect(m.dotCenterOffsetY - m.dayCenterOffsetY).toBeGreaterThan(m.selectionRadius + m.dotRadius);
      // dot 이 셀 아래로 삐져나오지 않는다
      expect(m.dotCenterOffsetY + m.dotRadius).toBeLessThanOrEqual(m.rowHeight);
    });
  });
});
