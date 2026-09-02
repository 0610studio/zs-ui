import { BlurStyle, Skia, type SkCanvas, type SkColor, type SkFont, type SkPaint, type SkRect } from '@shopify/react-native-skia';
import type {
  CalendarTheme,
  DateString,
  EventIndex,
  FirstDayOfWeek,
  GridLayoutMetrics,
} from '../core';
import { dayCenter, dotCenter, dotColorsOn } from '../core';
import type { CalendarFonts } from './fonts';

/**
 * 선언형 Skia 컴포넌트 대신 명령형인 이유: 42셀이면 노드가 200개를 넘어 조정 비용이
 * 커지고, 이 루틴을 그대로 createPicture 로 감싸 pane 캐시를 만들 수 있다.
 */
export interface MonthPaneParams {
  /** 주간 모드면 1행 */
  matrix: ReadonlyArray<ReadonlyArray<DateString>>;
  /** 'YYYY-MM' — 이 달에 속하지 않는 날짜는 흐리게 그린다 */
  monthKey: string;
  selectedDate: DateString | null;
  today: DateString;
  index: EventIndex;
  metrics: GridLayoutMetrics;
  theme: CalendarTheme;
  fonts: CalendarFonts;
  firstDayOfWeek: FirstDayOfWeek;
}

export interface PanePaints {
  fill: SkPaint;
  /** 선택 카드 그림자 두 겹 — 블러 마스크가 붙어 있어 일반 채움에 쓰면 안 된다 */
  shadowAmbient: SkPaint;
  shadowKey: SkPaint;
}

/** 선택 카드 형태. 셀 폭에 따라 달라지는 값은 metrics 에서 온다 */
const SELECTED_CARD_RADIUS = 10;
const SELECTED_CARD_INSET_Y = 2;
/**
 * 그림자는 머티리얼 elevation 처럼 두 겹이다.
 * ambient — 카드 둘레에 고르게 퍼져 "떠 있음"을 만든다(사각형을 살짝 넓히고 크게 블러, 아주 옅게).
 * key — 아래로 떨어져 빛의 방향을 준다(바라봄 iOS shadow {offset 4, radius 3.5, 45% × opacity 0.22} 의 실효값 10% 에서 10% 연하게).
 * key 만 있으면 받침대처럼 보여 특히 Android 에서 카드가 바닥에 붙은 느낌이 났다.
 */
const SHADOW_AMBIENT_SPREAD = 1;
const SHADOW_AMBIENT_OFFSET_Y = 1;
const SHADOW_AMBIENT_SIGMA = 3;
const SHADOW_AMBIENT_COLOR = 'rgba(0, 0, 0, 0.063)';
const SHADOW_KEY_OFFSET_Y = 3;
const SHADOW_KEY_SIGMA = 2;
const SHADOW_KEY_COLOR = 'rgba(0, 0, 0, 0.09)';
/**
 * 마지막 행의 카드 그림자가 행 밖으로 번지는 높이(두 겹 중 더 멀리 가는 쪽: 오프셋 + 퍼짐 + 블러 3σ − 카드 인셋).
 * 캔버스·뷰포트·픽처 컬 영역이 이만큼 더 커야 주간·월간 마지막 행에서 그림자가 잘리지 않는다.
 */
export const SELECTED_CARD_SHADOW_BLEED = Math.ceil(
  Math.max(
    SHADOW_AMBIENT_OFFSET_Y + SHADOW_AMBIENT_SPREAD + SHADOW_AMBIENT_SIGMA * 3,
    SHADOW_KEY_OFFSET_Y + SHADOW_KEY_SIGMA * 3,
  ) - SELECTED_CARD_INSET_Y,
);

function blurPaint(color: string, sigma: number): SkPaint {
  const paint = Skia.Paint();
  paint.setAntiAlias(true);
  paint.setColor(Skia.Color(color));
  paint.setMaskFilter(Skia.MaskFilter.MakeBlur(BlurStyle.Normal, sigma, true));
  return paint;
}

export function createPanePaints(): PanePaints {
  const fill = Skia.Paint();
  fill.setAntiAlias(true);
  return {
    fill,
    shadowAmbient: blurPaint(SHADOW_AMBIENT_COLOR, SHADOW_AMBIENT_SIGMA),
    shadowKey: blurPaint(SHADOW_KEY_COLOR, SHADOW_KEY_SIGMA),
  };
}

/** 기록은 동기라 pane 마다 새 Paint 를 만들 이유가 없다 — 첫 사용 때 한 쌍만 만들어 돌려쓴다 */
let sharedPaints: PanePaints | null = null;
export function getSharedPanePaints(): PanePaints {
  if (!sharedPaints) sharedPaints = createPanePaints();
  return sharedPaints;
}

/** Skia.Color 는 매 호출마다 CSS 문자열을 파싱한다 — 색 종류는 적으니 한 번만 */
const COLOR_CACHE_LIMIT = 256;
const colorCache = new Map<string, SkColor>();
function skColor(value: string): SkColor {
  const cached = colorCache.get(value);
  if (cached) return cached;
  if (colorCache.size >= COLOR_CACHE_LIMIT) colorCache.clear();
  const color = Skia.Color(value);
  colorCache.set(value, color);
  return color;
}

/** 날짜 숫자는 1~31 뿐이라 폰트당 최대 31번만 실측하면 된다 */
const measureCache = new WeakMap<SkFont, Map<string, SkRect>>();
function measureText(font: SkFont, text: string): SkRect {
  let perFont = measureCache.get(font);
  if (!perFont) {
    perFont = new Map();
    measureCache.set(font, perFont);
  }
  let bounds = perFont.get(text);
  if (!bounds) {
    bounds = font.measureText(text);
    perFont.set(text, bounds);
  }
  return bounds;
}

/** 글리프 bounding box 를 (cx, cy) 에 맞춘다 */
function drawCenteredText(canvas: SkCanvas, text: string, cx: number, cy: number, font: SkFont, paint: SkPaint): void {
  const bounds = measureText(font, text);
  canvas.drawText(text, cx - bounds.x - bounds.width / 2, cy - bounds.y - bounds.height / 2, paint, font);
}

/** 숫자와 점 줄을 함께 감싼다 — 폭은 셀보다 조금 좁고, 높이는 행에서 위아래 여백만 뺀다 */
function drawSelectedCard(canvas: SkCanvas, cx: number, metrics: GridLayoutMetrics, theme: CalendarTheme, paints: PanePaints): void {
  const width = Math.min(metrics.cellWidth - 6, metrics.selectionRadius * 2 + 10);
  const height = metrics.rowHeight - SELECTED_CARD_INSET_Y * 2;
  const x = cx - width / 2;

  const rrect = (dy: number, spread: number) =>
    Skia.RRectXY(
      Skia.XYWHRect(x - spread, SELECTED_CARD_INSET_Y + dy - spread, width + spread * 2, height + spread * 2),
      SELECTED_CARD_RADIUS + spread,
      SELECTED_CARD_RADIUS + spread,
    );
  canvas.drawRRect(rrect(SHADOW_AMBIENT_OFFSET_Y, SHADOW_AMBIENT_SPREAD), paints.shadowAmbient);
  canvas.drawRRect(rrect(SHADOW_KEY_OFFSET_Y, 0), paints.shadowKey);

  paints.fill.setColor(skColor(theme.selectedBackground));
  canvas.drawRRect(
    Skia.RRectXY(Skia.XYWHRect(x, SELECTED_CARD_INSET_Y, width, height), SELECTED_CARD_RADIUS, SELECTED_CARD_RADIUS),
    paints.fill,
  );
}

const weekdayColumnTone = (
  weekday: number,
  theme: CalendarTheme,
  fallback: string,
): string => (weekday === 0 ? theme.sundayText : weekday === 6 ? theme.saturdayText : fallback);

export type WeekRowParams = Omit<MonthPaneParams, 'matrix'> & {
  week: ReadonlyArray<DateString>;
};

/** y=0 기준 로컬 좌표로 그린다 — 배치는 호출부의 Group transform 이 맡는다 */
export function drawWeekRow(canvas: SkCanvas, params: WeekRowParams, paints: PanePaints): void {
  const { week, monthKey, selectedDate, today, index, metrics, theme, fonts, firstDayOfWeek } = params;
  const { fill } = paints;
  const row = 0;

  for (let column = 0; column < week.length; column += 1) {
    const date = week[column];
    if (!date) continue;

    const isSelected = date === selectedDate;
    const isToday = date === today;
    const isOutside = date.slice(0, 7) !== monthKey;
    const weekday = (firstDayOfWeek + column) % 7;
    const center = dayCenter(metrics, row, column);

    if (isSelected) {
      drawSelectedCard(canvas, center.x, metrics, theme, paints);
    } else if (isToday) {
      // 채움 색은 보통 반투명이라 알파를 덮어쓰지 않고 색이 가진 알파에 곱한다 — 진하면 흐린 숫자와 따로 놀아 보인다
      fill.setColor(skColor(theme.todayRing));
      if (isOutside) fill.setAlphaf(fill.getAlphaf() * 0.45);
      canvas.drawCircle(center.x, center.y, metrics.selectionRadius, fill);
    }

    const dayColor = isSelected
      ? theme.selectedText
      : isOutside
        ? theme.outsideDayText
        : isToday
          ? theme.todayText
          : weekdayColumnTone(weekday, theme, theme.dayText);

    fill.setColor(skColor(dayColor));
    drawCenteredText(
      canvas,
      String(Number(date.slice(8, 10))),
      center.x,
      center.y,
      isSelected ? fonts.daySelected : fonts.day,
      fill,
    );

    const dots = dotColorsOn(index, date, metrics.maxDots, theme.dotColor);
    if (dots.length === 0) continue;

    // 바라봄처럼 한 줄이 차면 다음 줄로 감싼다. 두 줄이면 원래 dot 중심을 사이에 두고 위아래로 벌린다
    const { dotRadius, dotGap, dotsPerRow } = metrics;
    const rowCount = Math.ceil(dots.length / dotsPerRow);
    const dotOrigin = dotCenter(metrics, row, column);
    const rowPitch = dotRadius * 2 + dotGap;
    const firstRowY = dotOrigin.y - ((rowCount - 1) * rowPitch) / 2;

    fill.setAlphaf(isOutside ? 0.45 : 1);
    for (let i = 0; i < dots.length; i += 1) {
      const rowIndex = Math.floor(i / dotsPerRow);
      const inRow = Math.min(dotsPerRow, dots.length - rowIndex * dotsPerRow);
      const rowSpan = inRow * dotRadius * 2 + (inRow - 1) * dotGap;
      const positionInRow = i - rowIndex * dotsPerRow;
      const x = dotOrigin.x - rowSpan / 2 + dotRadius + positionInRow * rowPitch;
      const y = firstRowY + rowIndex * rowPitch;
      // dot 줄은 선택 카드 안이라(layout 이 폭·높이를 보장) 선택 여부와 무관하게 이벤트 색을 쓴다
      fill.setColor(skColor(dots[i] as string));
      fill.setAlphaf(isOutside ? 0.45 : 1);
      canvas.drawCircle(x, y, dotRadius, fill);
    }
    fill.setAlphaf(1);
  }
}

/** 월 전체를 한 캔버스에 그린다 (정적 그리드용). 행 단위 애니메이션이 필요하면 drawWeekRow 를 쓴다 */
export function drawMonthPane(canvas: SkCanvas, params: MonthPaneParams, paints: PanePaints): void {
  const { matrix, metrics, theme } = params;

  if (theme.background !== 'transparent') {
    paints.fill.setColor(skColor(theme.background));
    canvas.drawRect(Skia.XYWHRect(0, 0, metrics.gridWidth, metrics.rowsHeight), paints.fill);
  }

  matrix.forEach((week, row) => {
    canvas.save();
    canvas.translate(0, metrics.rowHeight * row);
    drawWeekRow(canvas, { ...params, week }, paints);
    canvas.restore();
  });
}
