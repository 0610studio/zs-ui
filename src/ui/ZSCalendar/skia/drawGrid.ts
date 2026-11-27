import {
  BlurStyle,
  Skia,
  type SkCanvas,
  type SkColor,
  type SkFont,
  type SkPaint,
  type SkParagraph,
  type SkRect,
} from 'react-native-skia';
import { RADIUS } from '../../../theme/radius';
import type {
  DateString,
  EventIndex,
  FirstDayOfWeek,
  GridLayoutMetrics,
  ResolvedCalendarTheme,
} from '../core';
import { chipRect, dayCenter, dotCenter, dotColorsOn, dotRegionWidth, labelChipsOn, MAX_DOT_ROWS, readableChipTextColor, weekdayColor } from '../core';
import type { CalendarFonts } from './fonts';

export interface MonthPaneParams {
  matrix: readonly (readonly DateString[])[];
  monthKey: string;
  selectedDate: DateString | null;
  today: DateString;
  index: EventIndex;
  metrics: GridLayoutMetrics;
  theme: ResolvedCalendarTheme;
  fonts: CalendarFonts;
  firstDayOfWeek: FirstDayOfWeek;
}

export interface PanePaints {
  fill: SkPaint;
  shadowAmbient: SkPaint;
  shadowKey: SkPaint;
}

export const CHIP_RADIUS = RADIUS.xs;
const CHIP_TEXT_PADDING_X = 3;
const OUTSIDE_ALPHA = 0.45;

const SELECTED_CARD_RADIUS = 10;
const SELECTED_CARD_INSET_Y = 2;
const SELECTED_NUMBER_RADIUS = 9;
const SHADOW_AMBIENT_SPREAD = 1;
const SHADOW_AMBIENT_OFFSET_Y = 1;
const SHADOW_AMBIENT_SIGMA = 3;
const SHADOW_AMBIENT_COLOR = 'rgba(0, 0, 0, 0.063)';
const SHADOW_KEY_OFFSET_Y = 3;
const SHADOW_KEY_SIGMA = 2;
const SHADOW_KEY_COLOR = 'rgba(0, 0, 0, 0.09)';
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

let sharedPaints: PanePaints | null = null;
export function getSharedPanePaints(): PanePaints {
  if (!sharedPaints) {
    const fill = Skia.Paint();
    fill.setAntiAlias(true);
    sharedPaints = {
      fill,
      shadowAmbient: blurPaint(SHADOW_AMBIENT_COLOR, SHADOW_AMBIENT_SIGMA),
      shadowKey: blurPaint(SHADOW_KEY_COLOR, SHADOW_KEY_SIGMA),
    };
  }
  return sharedPaints;
}

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

function drawCenteredText(canvas: SkCanvas, text: string, cx: number, cy: number, font: SkFont, paint: SkPaint): void {
  const bounds = measureText(font, text);
  canvas.drawText(text, cx - bounds.x - bounds.width / 2, cy - bounds.y - bounds.height / 2, paint, font);
}

function drawSelectedCard(canvas: SkCanvas, center: { x: number; y: number }, metrics: GridLayoutMetrics, theme: ResolvedCalendarTheme, paints: PanePaints): void {
  const isLabel = metrics.eventDisplay === 'label';
  const width = isLabel ? metrics.selectionRadius * 2 : dotRegionWidth(metrics.cellWidth, metrics.selectionRadius);
  const height = isLabel ? metrics.selectionRadius * 2 : metrics.rowHeight - SELECTED_CARD_INSET_Y * 2;
  const radius = isLabel ? Math.min(SELECTED_NUMBER_RADIUS, metrics.selectionRadius) : SELECTED_CARD_RADIUS;
  const x = center.x - width / 2;
  const y = isLabel ? center.y - height / 2 : SELECTED_CARD_INSET_Y;

  const rrect = (dy: number, spread: number) =>
    Skia.RRectXY(Skia.XYWHRect(x - spread, y + dy - spread, width + spread * 2, height + spread * 2), radius + spread, radius + spread);
  canvas.drawRRect(rrect(SHADOW_AMBIENT_OFFSET_Y, SHADOW_AMBIENT_SPREAD), paints.shadowAmbient);
  canvas.drawRRect(rrect(SHADOW_KEY_OFFSET_Y, 0), paints.shadowKey);

  paints.fill.setColor(skColor(theme.selectedBackground));
  canvas.drawRRect(Skia.RRectXY(Skia.XYWHRect(x, y, width, height), radius, radius), paints.fill);
}

function drawTodayDisc(canvas: SkCanvas, center: { x: number; y: number }, metrics: GridLayoutMetrics, theme: ResolvedCalendarTheme, isOutside: boolean, paints: PanePaints): void {
  const { fill } = paints;
  fill.setColor(skColor(theme.todayBackground));
  if (isOutside) fill.setAlphaf(fill.getAlphaf() * OUTSIDE_ALPHA);
  canvas.drawCircle(center.x, center.y, metrics.selectionRadius, fill);
}

const fade = (color: SkColor, alpha: number): SkColor =>
  alpha === 1 ? color : Float32Array.of(color[0] ?? 0, color[1] ?? 0, color[2] ?? 0, (color[3] ?? 1) * alpha);

const PARAGRAPH_CACHE_LIMIT = 600;
const paragraphCache = new Map<string, SkParagraph>();
function oneLineParagraph(text: string, color: string, alpha: number, fontSize: number, width: number, fonts: CalendarFonts): SkParagraph {
  const key = `${fontSize}|${Math.round(width * 2)}|${color}|${alpha}|${fonts.fontFamilies?.join(',') ?? ''}|${text}`;
  const cached = paragraphCache.get(key);
  if (cached) return cached;
  if (paragraphCache.size >= PARAGRAPH_CACHE_LIMIT) paragraphCache.clear();

  const builder = Skia.ParagraphBuilder.Make(
    {
      maxLines: 1,
      ellipsis: '…',
      textStyle: { color: fade(skColor(color), alpha), fontSize, fontFamilies: fonts.fontFamilies },
    },
    fonts.provider ?? undefined,
  );
  builder.addText(text);
  const paragraph = builder.build();
  paragraph.layout(width);
  paragraphCache.set(key, paragraph);
  return paragraph;
}

function drawLabelChips(
  canvas: SkCanvas,
  params: WeekRowParams,
  date: DateString,
  column: number,
  isOutside: boolean,
  paints: PanePaints,
): void {
  const { index, metrics, theme, fonts } = params;
  const { chips, overflow } = labelChipsOn(index, date, metrics.chipsPerCell);
  if (chips.length === 0 && overflow === 0) return;

  const alpha = isOutside ? OUTSIDE_ALPHA : 1;
  const { fill } = paints;
  chips.forEach((event, line) => {
    const rect = chipRect(metrics, 0, column, line);
    const background = event.color ?? theme.dotColor;
    fill.setColor(skColor(background));
    fill.setAlphaf(fill.getAlphaf() * alpha);
    canvas.drawRRect(Skia.RRectXY(Skia.XYWHRect(rect.x, rect.y, rect.width, rect.height), CHIP_RADIUS, CHIP_RADIUS), fill);

    if (!event.label) return;
    const textWidth = rect.width - CHIP_TEXT_PADDING_X * 2;
    if (textWidth <= 0) return;
    const paragraph = oneLineParagraph(
      event.label,
      event.textColor ?? readableChipTextColor(background, theme.chipTextDark, theme.chipTextLight),
      alpha,
      metrics.labelFontSize,
      textWidth,
      fonts,
    );
    paragraph.paint(canvas, rect.x + CHIP_TEXT_PADDING_X, rect.y + (rect.height - paragraph.getHeight()) / 2);
  });
  fill.setAlphaf(1);

  if (overflow > 0) {
    const rect = chipRect(metrics, 0, column, chips.length);
    const paragraph = oneLineParagraph(`+${overflow}`, theme.weekdayText, alpha, metrics.labelFontSize, rect.width, fonts);
    paragraph.paint(canvas, rect.x + CHIP_TEXT_PADDING_X, rect.y + (rect.height - paragraph.getHeight()) / 2);
  }
}

export type WeekRowParams = Omit<MonthPaneParams, 'matrix'> & {
  week: readonly DateString[];
};

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

    if (isSelected) drawSelectedCard(canvas, center, metrics, theme, paints);
    else if (isToday) drawTodayDisc(canvas, center, metrics, theme, isOutside, paints);

    const dayColor = isSelected
      ? theme.selectedText
      : isOutside
        ? theme.outsideDayText
        : isToday
          ? theme.todayText
          : weekdayColor(weekday, theme, theme.dayText);

    fill.setColor(skColor(dayColor));
    drawCenteredText(
      canvas,
      String(Number(date.slice(8, 10))),
      center.x,
      center.y,
      isSelected || isToday ? fonts.daySelected : fonts.day,
      fill,
    );

    if (metrics.eventDisplay === 'label') {
      drawLabelChips(canvas, params, date, column, isOutside, paints);
      continue;
    }

    const dots = dotColorsOn(index, date, metrics.maxDots, theme.dotColor);
    if (dots.length === 0) continue;

    const { dotRadius, dotGap, dotsPerRow } = metrics;
    const dotOrigin = dotCenter(metrics, row, column);
    const rowPitch = dotRadius * 2 + dotGap;
    // 점 줄은 두 줄 자리의 위에서부터 채운다(상단 정렬) — 한 줄이어도 두 줄일 때의 첫 줄 높이라 숫자에 붙어 보인다
    const firstRowY = dotOrigin.y - ((MAX_DOT_ROWS - 1) * rowPitch) / 2;

    for (let i = 0; i < dots.length; i += 1) {
      const rowIndex = Math.floor(i / dotsPerRow);
      const inRow = Math.min(dotsPerRow, dots.length - rowIndex * dotsPerRow);
      const rowSpan = inRow * dotRadius * 2 + (inRow - 1) * dotGap;
      const positionInRow = i - rowIndex * dotsPerRow;
      const x = dotOrigin.x - rowSpan / 2 + dotRadius + positionInRow * rowPitch;
      const y = firstRowY + rowIndex * rowPitch;
      fill.setColor(skColor(dots[i] as string));
      fill.setAlphaf(isOutside ? OUTSIDE_ALPHA : 1);
      canvas.drawCircle(x, y, dotRadius, fill);
    }
    fill.setAlphaf(1);
  }
}

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
