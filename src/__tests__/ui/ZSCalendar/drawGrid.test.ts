import { createPicture, matchFont } from 'react-native-skia';
import { drawCalls, paragraphStyles } from '../../__mocks__/react-native-skia';
import { createThemeColors, DEFAULT_COLORS } from '../../../theme/color';
import { RADIUS } from '../../../theme/radius';
import { buildEventIndex, computeGridLayout, dotRegionWidth, resolveCalendarTheme } from '../../../ui/ZSCalendar/core';
import {
  CHIP_RADIUS,
  drawWeekRow,
  getSharedPanePaints,
  type WeekRowParams,
} from '../../../ui/ZSCalendar/skia/drawGrid';
import { nth } from '../../utils/hostQueries';
import { contrastRatio } from '../../utils/contrast';

jest.mock('react-native-skia', () => {
  const actual = jest.requireActual('../../__mocks__/react-native-skia');
  const recordingPaint = () => {
    const state = { style: 0, strokeWidth: 0, color: undefined as unknown, alpha: 1, maskFilter: undefined as unknown };
    return {
      state,
      setAntiAlias: () => undefined,
      setStyle: (style: number) => { state.style = style; },
      setStrokeWidth: (width: number) => { state.strokeWidth = width; },
      setColor: (color: unknown) => { state.color = color; state.alpha = 1; },
      setAlphaf: (alpha: number) => { state.alpha = alpha; },
      getAlphaf: () => state.alpha,
      setMaskFilter: (filter: unknown) => { state.maskFilter = filter; },
    };
  };
  return { ...actual, PaintStyle: { Fill: 0, Stroke: 1 }, Skia: { ...actual.Skia, Paint: recordingPaint } };
});

type PaintState = { style: number; strokeWidth: number; color: unknown; alpha: number; maskFilter: unknown };
const paintState = (paint: unknown) => (paint as { state: PaintState }).state;

const colors = createThemeColors(DEFAULT_COLORS, { mode: 'light', contrastLevel: 0 });
const metrics = computeGridLayout({ containerWidth: 350, rowCount: 1 });
const font = matchFont({ fontSize: metrics.dayFontSize });
const boldFont = matchFont({ fontSize: metrics.dayFontSize, fontWeight: '700' });
const week = ['2026-09-13', '2026-09-14', '2026-09-15', '2026-09-16', '2026-09-17', '2026-09-18', '2026-09-19'];

const params = (override: Partial<WeekRowParams>): WeekRowParams => ({
  week,
  monthKey: '2026-09',
  selectedDate: '2026-09-16',
  today: '2026-09-14',
  index: buildEventIndex([]),
  metrics,
  theme: resolveCalendarTheme(colors, 'light'),
  fonts: { day: font as any, daySelected: boldFont as any },
  firstDayOfWeek: 0,
  ...override,
});

const record = (p: WeekRowParams) => {
  drawCalls.length = 0;
  createPicture((canvas) => drawWeekRow(canvas as any, p, getSharedPanePaints()));
  return [...drawCalls];
};

interface CircleCall { x: number; y: number; r: number; paint: unknown; style: number; color: unknown; alpha: number; strokeWidth: number }
interface RRectCall { rx: number; color: unknown; paint: unknown; maskFilter: unknown; x: number; y: number; width: number; height: number }
interface TextCall { text: string; color: unknown; font: unknown }

const recordArgs = (p: WeekRowParams) => {
  const circles: CircleCall[] = [];
  const rrects: RRectCall[] = [];
  const texts: TextCall[] = [];
  const canvas = {
    drawCircle: (x: number, y: number, r: number, paint: unknown) => {
      const { style, color, alpha, strokeWidth } = paintState(paint);
      circles.push({ x, y, r, paint, style, color, alpha, strokeWidth });
    },
    drawRRect: (rrect: { rx: number; rect: { x: number; y: number; width: number; height: number } }, paint: unknown) =>
      rrects.push({ rx: rrect.rx, color: paintState(paint).color, paint, maskFilter: paintState(paint).maskFilter, ...rrect.rect }),
    drawText: (text: string, _x: number, _y: number, paint: unknown, textFont: unknown) => texts.push({ text, color: paintState(paint).color, font: textFont }),
    save: () => undefined,
    restore: () => undefined,
    translate: () => undefined,
  };
  drawWeekRow(canvas as any, p, getSharedPanePaints());
  return { circles, rrects, texts };
};

describe('ZSCalendar skia/drawGrid — 선택 카드·오늘 원', () => {
  const paints = getSharedPanePaints();

  it('선택일은 떠 있는 카드(그림자 두 겹 + 면), 오늘은 회색 채움 원 하나다', () => {
    const calls = record(params({}));
    expect(calls.filter((c) => c === 'rrect')).toHaveLength(3);
    expect(calls.filter((c) => c === 'circle')).toHaveLength(1);
  });

  it('선택 카드는 1.0 처럼 행 높이를 채우는 둥근 사각(모서리 10) — 숫자·점 띠 폭, 넓게 퍼진 그림자 → 아래로 내린 그림자 → 흰 면 순서', () => {
    const { rrects, texts } = recordArgs(params({ today: '2026-10-01' }));
    expect(rrects).toHaveLength(3);
    const [ambient, key, card] = [nth(rrects, 0), nth(rrects, 1), nth(rrects, 2)];
    expect(ambient.paint).toBe(paints.shadowAmbient);
    expect(key.paint).toBe(paints.shadowKey);
    expect(ambient.maskFilter).toBeTruthy();
    expect(key.maskFilter).toBeTruthy();
    expect(card.paint).toBe(paints.fill);
    expect(card).toMatchObject({ rx: 10, y: 2, height: metrics.rowHeight - 4, width: dotRegionWidth(metrics.cellWidth, metrics.selectionRadius), color: colors.surface1 });
    expect(card.x + card.width / 2).toBeCloseTo(metrics.cellWidth * 3.5, 5);
    expect(key.y).toBeGreaterThan(card.y);
    const selected = texts.find((t) => t.text === '16');
    expect(selected?.color).toBe(colors.primaryMark);
    expect(selected?.font).toBe(boldFont);
    expect(contrastRatio(colors.primaryMark, colors.surface1)).toBeGreaterThanOrEqual(3);
  });

  it('다크는 그림자가 안 보여 한 단 밝은 surface5 카드로 띄운다 — 숫자는 표시색', () => {
    const dark = createThemeColors(DEFAULT_COLORS, { mode: 'dark', contrastLevel: 0 });
    const { rrects, texts } = recordArgs(params({ today: '2026-10-01', theme: resolveCalendarTheme(dark, 'dark') }));
    expect(nth(rrects, 2).color).toBe(dark.surface5);
    expect(texts.find((t) => t.text === '16')?.color).toBe(dark.primaryMark);
    expect(contrastRatio(dark.primaryMark, dark.surface5)).toBeGreaterThanOrEqual(3);
  });

  it('오늘은 숫자 자리의 회색(surface4 — 탭 선택 캡슐과 같은 회색) 채움 원 — 숫자는 본문색 굵은 글자다', () => {
    const theme = resolveCalendarTheme(colors, 'light');
    const { circles, texts } = recordArgs(params({ selectedDate: '2026-10-01' }));
    expect(circles).toHaveLength(1);
    const disc = nth(circles, 0);
    expect(disc.style).toBe(0);
    expect(disc.color).toBe(theme.todayBackground);
    expect(disc.color).toBe(colors.surface4);
    expect(disc.alpha).toBe(1);
    expect(disc.r).toBe(metrics.selectionRadius);
    expect(disc.x).toBeCloseTo(metrics.cellWidth * 1.5, 5);
    expect(contrastRatio(colors.text, colors.surface4)).toBeGreaterThanOrEqual(4.5);
    const today = texts.find((t) => t.text === '14');
    expect(today?.color).toBe(colors.text);
    expect(today?.font).toBe(boldFont);
    expect(texts.find((t) => t.text === '15')?.font).toBe(font);
  });

  it('인접 달의 오늘은 숫자처럼 원도 흐리게 그린다', () => {
    const { circles } = recordArgs(params({ selectedDate: '2026-10-01', today: '2026-09-13', monthKey: '2026-10' }));
    expect(nth(circles, 0).alpha).toBeCloseTo(0.45, 5);
  });

  it('카드 → 숫자 순서로 그려 숫자가 카드 위에 얹힌다', () => {
    const calls = record(params({ today: '2026-10-01' }));
    const card = calls.lastIndexOf('rrect');
    expect(calls.slice(card - 2, card + 2)).toEqual(['rrect', 'rrect', 'rrect', 'text']);
  });

  it('선택일이 이 주에 없으면 카드를 그리지 않는다', () => {
    const { circles, rrects } = recordArgs(params({ selectedDate: '2026-10-01' }));
    expect(rrects).toHaveLength(0);
    expect(circles).toHaveLength(1);
    expect(nth(circles, 0).color).toBe(colors.surface4);
  });

  it('고른 날이 오늘이면 선택 카드 하나만 — 회색 원은 그리지 않는다', () => {
    const { circles, rrects, texts } = recordArgs(params({ selectedDate: '2026-09-14' }));
    expect(circles).toHaveLength(0);
    expect(rrects).toHaveLength(3);
    expect(texts.find((t) => t.text === '14')?.color).toBe(colors.primaryMark);
  });

  it('dot 은 한 줄이 차면 다음 줄로 감싸고, 두 줄에 들어가는 만큼만 그린다', () => {
    const many = Array.from({ length: 30 }, (_, i) => ({ id: `e${i}`, date: '2026-09-15', color: `#${String(i).padStart(2, '0')}0000` }));
    const calls = record(params({ index: buildEventIndex(many), selectedDate: '2026-10-01', today: '2026-10-01' }));
    expect(calls.filter((c) => c === 'circle')).toHaveLength(metrics.dotsPerRow * 2);
    expect(metrics.dotsPerRow).toBeGreaterThanOrEqual(5);
    expect(metrics.maxDots).toBe(metrics.dotsPerRow * 2);
  });

  it('dot 은 채움(fill) 칠로 그린다 — 링 칠을 쓰지 않는다', () => {
    const events = buildEventIndex([{ id: 'a', date: '2026-09-15', color: '#ff0000' }]);
    const { circles } = recordArgs(params({ index: events, selectedDate: '2026-10-01', today: '2026-10-01' }));
    expect(circles).toHaveLength(1);
    expect(nth(circles, 0).paint).toBe(getSharedPanePaints().fill);
    expect(nth(circles, 0).style).toBe(0);
  });

  it('색을 주지 않은 일정 점은 보조 글자색(textSecondary) — 호박 점을 쓰지 않고 배경과 3:1 이상이다', () => {
    const events = buildEventIndex([{ id: 'a', date: '2026-09-15' }]);
    const { circles } = recordArgs(params({ index: events, selectedDate: '2026-10-01', today: '2026-10-01' }));
    expect(nth(circles, 0).color).toBe(colors.textSecondary);
    expect(contrastRatio(colors.textSecondary, colors.background)).toBeGreaterThanOrEqual(3);
  });

  it('선택일의 일정 점은 카드 안, 숫자 아래에 그린다 — 카드가 숫자와 점을 함께 담는다', () => {
    const events = buildEventIndex([{ id: 'a', date: '2026-09-16' }]);
    const { circles, rrects } = recordArgs(params({ index: events, today: '2026-10-01' }));
    const [card, dot] = [nth(rrects, 2), nth(circles, 0)];
    expect(dot.color).toBe(colors.textSecondary);
    expect(dot.y).toBeGreaterThan(metrics.dayCenterOffsetY);
    expect(dot.y + dot.r).toBeLessThanOrEqual(card.y + card.height);
    expect(dot.x - dot.r).toBeGreaterThanOrEqual(card.x);
  });

  it('토요일 숫자는 본문색, 일요일은 error 다', () => {
    const { texts } = recordArgs(params({ selectedDate: '2026-10-01', today: '2026-10-01' }));
    expect(texts.find((t) => t.text === '19')?.color).toBe(colors.text);
    expect(texts.find((t) => t.text === '13')?.color).toBe(colors.error);
    expect(texts.find((t) => t.text === '15')?.color).toBe(colors.text);
  });
});

describe('ZSCalendar skia/drawGrid — label 칩', () => {
  const labelMetrics = computeGridLayout({ containerWidth: 350, rowCount: 6, eventDisplay: 'label', availableRowsHeight: 500, fillRowCount: 5 });
  const labelParams = (events: Parameters<typeof buildEventIndex>[0], override: Partial<WeekRowParams> = {}) =>
    params({ metrics: labelMetrics, index: buildEventIndex(events), selectedDate: '2026-10-01', today: '2026-10-01', ...override });

  it('이벤트마다 칩 배경을 깔고 문구를 한 줄로 그린다 — dot 은 그리지 않는다', () => {
    const calls = record(labelParams([
      { id: 'a', date: '2026-09-15', color: '#D7B8FF', label: '산책 30분' },
      { id: 'b', date: '2026-09-15', color: '#FF9761', label: '병원' },
    ]));
    expect(calls.filter((c) => c === 'rrect')).toHaveLength(2);
    expect(calls).toEqual(expect.arrayContaining(['paragraph:산책 30분', 'paragraph:병원']));
    expect(calls).not.toContain('circle');
  });

  it('칩 반경은 토큰 xs(4)', () => {
    const { rrects } = recordArgs(labelParams([{ id: 'a', date: '2026-09-15', color: '#D7B8FF', label: '산책' }]));
    expect(CHIP_RADIUS).toBe(RADIUS.xs);
    expect(nth(rrects, 0).rx).toBe(RADIUS.xs);
  });

  it('문구는 한 줄 · 말줄임, 글자색은 테마 글자·반전 글자 중 칩 배경과 대비가 큰 쪽', () => {
    paragraphStyles.length = 0;
    record(labelParams([{ id: 'a', date: '2026-09-15', color: '#637381', label: '알람이 아주 긴 문구' }]));
    const style = nth(paragraphStyles, paragraphStyles.length - 1);
    expect(style.maxLines).toBe(1);
    expect(style.ellipsis).toBe('…');
    expect(contrastRatio(colors.textInverse, '#637381')).toBeGreaterThan(contrastRatio(colors.text, '#637381'));
    expect(style.textStyle.color).toBe('#ffffff');
    expect(contrastRatio(style.textStyle.color, '#637381')).toBeGreaterThanOrEqual(4.5);
    expect(style.textStyle.fontSize).toBe(labelMetrics.labelFontSize);

    paragraphStyles.length = 0;
    record(labelParams([{ id: 'a', date: '2026-09-15', color: '#D7B8FF', label: '라이트 밝은 칩' }]));
    expect(nth(paragraphStyles, paragraphStyles.length - 1).textStyle.color).toBe(colors.text);
  });

  it('다크 테마의 밝은 칩은 다크의 어두운 글자(textInverse)', () => {
    const dark = createThemeColors(DEFAULT_COLORS, { mode: 'dark', contrastLevel: 0 });
    paragraphStyles.length = 0;
    record(labelParams([{ id: 'a', date: '2026-09-15', color: '#D7B8FF', label: '다크 밝은 칩' }], { theme: resolveCalendarTheme(dark, 'dark') }));
    expect(nth(paragraphStyles, paragraphStyles.length - 1).textStyle.color).toBe(dark.textInverse);
  });

  it('label 이 없으면 색 칩만 그린다', () => {
    const calls = record(labelParams([{ id: 'a', date: '2026-09-15', color: '#AFF581' }]));
    expect(calls.filter((c) => c === 'rrect')).toHaveLength(1);
    expect(calls.filter((c) => c.startsWith('paragraph:'))).toHaveLength(0);
  });

  it('칸에 다 못 넣으면 마지막 줄이 +n 이다', () => {
    const lines = labelMetrics.chipsPerCell;
    const many = Array.from({ length: lines + 3 }, (_, i) => ({ id: `e${i}`, date: '2026-09-15', label: `기록${i}` }));
    const calls = record(labelParams(many));
    expect(calls.filter((c) => c === 'rrect')).toHaveLength(lines - 1);
    expect(calls).toContain(`paragraph:+${4}`);
  });

  it('선택일은 숫자 자리만 카드로 감싸고 칩은 카드 밖(숫자 띠 아래)에 그린다', () => {
    const calls = record(labelParams([{ id: 'a', date: '2026-09-16', color: '#D7B8FF', label: '산책' }], { selectedDate: '2026-09-16' }));
    const card = calls.indexOf('rrect');
    expect(calls.slice(card, card + 6)).toEqual(['rrect', 'rrect', 'rrect', 'text', 'rrect', 'paragraph:산책']);
  });

  it('숫자를 감싼 카드는 숫자 자리 정사각(selectionRadius × 2, 모서리 9) + 그림자 두 겹 + 흰 면', () => {
    const { circles, rrects } = recordArgs(labelParams([], { selectedDate: '2026-09-16' }));
    expect(circles).toHaveLength(0);
    expect(rrects).toHaveLength(3);
    expect(nth(rrects, 2)).toMatchObject({ rx: 9, width: labelMetrics.selectionRadius * 2, height: labelMetrics.selectionRadius * 2, color: colors.surface1 });
  });

  it('색을 주지 않은 칩은 dotColor(textSecondary) 면에 대비가 큰 글자', () => {
    paragraphStyles.length = 0;
    const { rrects } = recordArgs(labelParams([{ id: 'a', date: '2026-09-15', label: '기본 색 칩' }]));
    expect(nth(rrects, 0).color).toBe(colors.textSecondary);
  });
});
