import {
  DEFAULT_MAX_CONTENT_WIDTH,
  chipRect,
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
    expect(Number.isFinite(metrics.rowsHeight)).toBe(true);
  });

  it('행 높이는 min/max 로 클램프된다', () => {
    const narrow = computeGridLayout({ containerWidth: 210, rowCount: 6 });
    expect(narrow.rowHeight).toBe(52);
    const wide = computeGridLayout({ containerWidth: 700, rowCount: 6, maxContentWidth: false });
    expect(wide.rowHeight).toBe(76);
  });

  it('rowsHeight 는 요일 헤더를 뺀 행 높이 × 행 수', () => {
    const metrics = computeGridLayout({ containerWidth: 350, rowCount: 6 });
    expect(metrics.rowsHeight).toBe(metrics.rowHeight * 6);
  });
});

describe('ZSCalendar core/layout — 셀 폭 단계 조정', () => {
  it('소형폰(320pt)에서 dot 개수와 폰트가 줄어든다', () => {
    const small = computeGridLayout({ containerWidth: 320, rowCount: 6 });
    const tablet = computeGridLayout({ containerWidth: 520, rowCount: 6 });
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
  const metrics = computeGridLayout({ containerWidth: 350, rowCount: 5, maxContentWidth: false });

  it('cellRect 은 주 행 영역(0,0) 기준으로 격자를 빈틈없이 채운다', () => {
    const first = cellRect(metrics, 0, 0);
    expect(first).toEqual({ x: 0, y: 0, width: 50, height: metrics.rowHeight });
    const last = cellRect(metrics, 4, 6);
    expect(last.x + last.width).toBe(metrics.gridWidth);
    expect(last.y + last.height).toBe(metrics.rowsHeight);
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

  it('폰 폭에서 선택 원은 지름 40 이고, dot 두 줄까지 칸 안에 머문다', () => {
    [342, 353, 390].forEach((width) => {
      const m = computeGridLayout({ containerWidth: width, rowCount: 6 });
      expect(m.selectionRadius * 2).toBe(40);
      const secondRowBottom = m.dotCenterOffsetY + (m.dotRadius * 2 + m.dotGap) / 2 + m.dotRadius;
      expect(secondRowBottom).toBeLessThanOrEqual(m.rowHeight);
    });
  });

  it('선택 원과 dot 줄이 어떤 셀 크기에서도 겹치지 않는다', () => {
    [240, 320, 375, 390, 430, 520, 700, 1024].forEach((width) => {
      const m = computeGridLayout({ containerWidth: width, rowCount: 6 });
      expect(m.dotCenterOffsetY - m.dayCenterOffsetY).toBeGreaterThan(m.selectionRadius + m.dotRadius);
      expect(m.dotCenterOffsetY + m.dotRadius).toBeLessThanOrEqual(m.rowHeight);
    });
  });
});

describe('ZSCalendar core/layout — label 표시', () => {
  it('높이를 주지 않으면 칩 두 줄이 들어가는 최소 행 높이다', () => {
    const m = computeGridLayout({ containerWidth: 335, rowCount: 6, eventDisplay: 'label' });
    expect(m.eventDisplay).toBe('label');
    expect(m.chipsPerCell).toBe(2);
    expect(m.rowHeight).toBe(m.chipTop + m.chipHeight * 2 + m.chipGap + 4);
  });

  it('주어진 높이를 보이는 달의 주 수로 나눠 채우고, 칩 줄 수가 늘어난다', () => {
    const five = computeGridLayout({ containerWidth: 335, rowCount: 6, eventDisplay: 'label', availableRowsHeight: 600, fillRowCount: 5 });
    expect(five.rowHeight).toBe(120);
    expect(five.chipsPerCell).toBe(Math.floor((120 - five.chipTop - 4 + five.chipGap) / (five.chipHeight + five.chipGap)));
    expect(five.chipsPerCell).toBeGreaterThanOrEqual(4);
    expect(five.rowsHeight).toBe(120 * 6);
    const six = computeGridLayout({ containerWidth: 335, rowCount: 6, eventDisplay: 'label', availableRowsHeight: 600, fillRowCount: 6 });
    expect(six.rowHeight).toBe(100);
  });

  it('높이가 모자라면 최소 행 높이, 너무 크면 상한에서 멈춘다', () => {
    const short = computeGridLayout({ containerWidth: 335, rowCount: 6, eventDisplay: 'label', availableRowsHeight: 120, fillRowCount: 6 });
    const min = computeGridLayout({ containerWidth: 335, rowCount: 6, eventDisplay: 'label' });
    expect(short.rowHeight).toBe(min.rowHeight);
    const tall = computeGridLayout({ containerWidth: 335, rowCount: 6, eventDisplay: 'label', availableRowsHeight: 3000, fillRowCount: 4 });
    expect(tall.rowHeight).toBe(180);
  });

  it('칩은 숫자 띠 아래에서 셀 폭 안에 쌓이고 마지막 줄이 셀 밖으로 나가지 않는다', () => {
    [280, 335, 375, 520, 752].forEach((width) => {
      const m = computeGridLayout({ containerWidth: width, rowCount: 6, eventDisplay: 'label', availableRowsHeight: 560, fillRowCount: 5, maxContentWidth: false });
      const cell = cellRect(m, 1, 3);
      const first = chipRect(m, 1, 3, 0);
      const last = chipRect(m, 1, 3, m.chipsPerCell - 1);
      expect(first.x).toBeGreaterThan(cell.x);
      expect(first.x + first.width).toBeLessThan(cell.x + cell.width);
      expect(first.y).toBeGreaterThanOrEqual(cell.y + m.dayCenterOffsetY + m.selectionRadius - 1);
      expect(last.y + last.height).toBeLessThanOrEqual(cell.y + cell.height);
    });
  });

  it('선택 카드·오늘 원은 숫자 띠 안에서 숫자만 감싼다 — 첫 칩과 겹치지 않는다', () => {
    [280, 335, 375, 520, 752].forEach((width) => {
      const m = computeGridLayout({ containerWidth: width, rowCount: 6, eventDisplay: 'label', maxContentWidth: false });
      expect(m.dayCenterOffsetY - m.selectionRadius).toBeGreaterThanOrEqual(3);
      expect(m.dayCenterOffsetY + m.selectionRadius).toBeLessThanOrEqual(m.chipTop - 3);
      expect(m.selectionRadius * 2).toBeGreaterThan(m.dayFontSize + 6);
    });
  });

  it('좁은 셀일수록 칩 글자가 작다', () => {
    const narrow = computeGridLayout({ containerWidth: 300, rowCount: 6, eventDisplay: 'label' });
    const wide = computeGridLayout({ containerWidth: 520, rowCount: 6, eventDisplay: 'label' });
    expect(narrow.labelFontSize).toBeLessThan(wide.labelFontSize);
  });

  it('dot 표시는 높이를 주어도 행 높이가 바뀌지 않는다', () => {
    const base = computeGridLayout({ containerWidth: 350, rowCount: 6 });
    const withHeight = computeGridLayout({ containerWidth: 350, rowCount: 6, availableRowsHeight: 900, fillRowCount: 5 });
    expect(withHeight.rowHeight).toBe(base.rowHeight);
    expect(withHeight.eventDisplay).toBe('dot');
  });
});

describe('ZSCalendar core/layout — 시스템 글자 크기', () => {
  it('기본(1)은 이전과 같다', () => {
    expect(computeGridLayout({ containerWidth: 390, rowCount: 6, fontScale: 1 })).toEqual(computeGridLayout({ containerWidth: 390, rowCount: 6 }));
  });

  it('날짜 숫자는 1.5배, 칩 글자는 1.3배까지 커지고 0.85배까지 작아진다', () => {
    const base = computeGridLayout({ containerWidth: 420, rowCount: 6 });
    expect(computeGridLayout({ containerWidth: 420, rowCount: 6, fontScale: 1.2 }).dayFontSize).toBe(Math.round(base.dayFontSize * 1.2));
    expect(computeGridLayout({ containerWidth: 420, rowCount: 6, fontScale: 3.571 }).dayFontSize).toBe(Math.round(base.dayFontSize * 1.5));
    expect(computeGridLayout({ containerWidth: 420, rowCount: 6, fontScale: 0.5 }).dayFontSize).toBe(Math.round(base.dayFontSize * 0.85));
    const label = computeGridLayout({ containerWidth: 420, rowCount: 6, eventDisplay: 'label' });
    expect(computeGridLayout({ containerWidth: 420, rowCount: 6, eventDisplay: 'label', fontScale: 2 }).labelFontSize).toBe(Math.round(label.labelFontSize * 1.3));
  });

  it('글자가 커지면 행이 늘어나고, 두 자리 숫자는 칸 안에 든다', () => {
    const base = computeGridLayout({ containerWidth: 382, rowCount: 6 });
    const big = computeGridLayout({ containerWidth: 382, rowCount: 6, fontScale: 2 });
    expect(big.rowHeight).toBeGreaterThan(base.rowHeight);
    [240, 320, 382, 520].forEach((width) => {
      const m = computeGridLayout({ containerWidth: width, rowCount: 6, fontScale: 3.571 });
      expect(m.dayFontSize * 1.2).toBeLessThanOrEqual(m.cellWidth - 8 + 1);
    });
  });

  it('어떤 글자 크기에서도 선택 원이 칸 안에 있고 dot 줄과 겹치지 않는다', () => {
    [0.85, 1, 1.3, 1.5, 2, 3.571].forEach((fontScale) => {
      [240, 320, 390, 520, 1024].forEach((width) => {
        const m = computeGridLayout({ containerWidth: width, rowCount: 6, fontScale });
        expect(m.selectionRadius * 2).toBeLessThanOrEqual(m.cellWidth);
        expect(m.dayCenterOffsetY - m.selectionRadius).toBeGreaterThan(0);
        expect(m.dayCenterOffsetY + m.selectionRadius).toBeLessThanOrEqual(m.rowHeight);
        expect(m.dotCenterOffsetY - m.dayCenterOffsetY).toBeGreaterThan(m.selectionRadius + m.dotRadius);
        expect(m.dotCenterOffsetY + m.dotRadius).toBeLessThanOrEqual(m.rowHeight);
        expect(m.dayFontSize * 0.75).toBeLessThan(m.selectionRadius * 2);
      });
    });
  });
});
