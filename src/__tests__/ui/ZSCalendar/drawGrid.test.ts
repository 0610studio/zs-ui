import { drawCalls, createPicture, matchFont } from '@shopify/react-native-skia';
import themeFactory from '../../../theme/palette';
import { buildEventIndex, computeGridLayout, resolveCalendarTheme } from '../../../ui/ZSCalendar/core';
import { drawWeekRow, getSharedPanePaints, type WeekRowParams } from '../../../ui/ZSCalendar/skia/drawGrid';

const palette = themeFactory({ mode: 'light' });
const metrics = computeGridLayout({ containerWidth: 350, rowCount: 1 });
const font = matchFont({ fontSize: metrics.dayFontSize });
const week = ['2026-09-13', '2026-09-14', '2026-09-15', '2026-09-16', '2026-09-17', '2026-09-18', '2026-09-19'];

const params = (override: Partial<WeekRowParams>): WeekRowParams => ({
  week,
  monthKey: '2026-09',
  selectedDate: '2026-09-16',
  today: '2026-09-14',
  index: buildEventIndex([]),
  metrics,
  theme: resolveCalendarTheme(palette),
  fonts: { day: font as any, daySelected: font as any },
  firstDayOfWeek: 0,
  ...override,
});

/** 픽처 기록 경로와 같은 캔버스 목으로 그린다 */
const record = (p: WeekRowParams) => {
  drawCalls.length = 0;
  createPicture((canvas) => drawWeekRow(canvas as any, p, getSharedPanePaints()));
  return [...drawCalls];
};

describe('ZSCalendar skia/drawGrid — 선택 카드·오늘 원', () => {
  it('선택일은 그림자와 카드 두 장의 둥근 사각형, 오늘은 채운 원 하나', () => {
    const calls = record(params({}));
    expect(calls.filter((c) => c === 'rrect')).toHaveLength(2);
    expect(calls.filter((c) => c === 'circle')).toHaveLength(1);
  });

  it('그림자 → 카드 → 숫자 순서로 그려 숫자가 카드 위에 얹힌다', () => {
    const calls = record(params({ today: '2026-10-01' }));
    expect(calls).not.toContain('circle');
    const card = calls.lastIndexOf('rrect');
    expect(calls.slice(card - 1, card + 2)).toEqual(['rrect', 'rrect', 'text']);
  });

  it('선택일이 이 주에 없으면 카드를 그리지 않는다', () => {
    const calls = record(params({ selectedDate: '2026-10-01' }));
    expect(calls).not.toContain('rrect');
    expect(calls.filter((c) => c === 'circle')).toHaveLength(1);
  });

  it('선택일과 오늘이 같으면 카드만 그린다', () => {
    const calls = record(params({ today: '2026-09-16' }));
    expect(calls.filter((c) => c === 'rrect')).toHaveLength(2);
    expect(calls).not.toContain('circle');
  });
});
