import { CONTENT_INSET } from '../../theme/spacing';

export type ZSTextFieldVariant = 'outlined' | 'inbox' | 'underline';

export interface FieldMetrics {
  lineHeight: number;
  labelScale: number;
  labelLineHeight: number;
}

export interface FieldGeometry {
  paddingTop: number;
  paddingBottom: number;
  paddingHorizontal: number;
  restTop: number;
  floatTop: number;
  centerOnBorder: boolean;
}

export const FIELD_SPEC = {
  ios: { minHeight: { outlined: 52, inbox: 56, underline: 48 }, paddingHorizontal: CONTENT_INSET, radius: 'lg' as const },
  android: { minHeight: { outlined: 56, inbox: 56, underline: 52 }, paddingHorizontal: CONTENT_INSET, radius: 'lg' as const },
};

const FLOAT_TOP = 8;
const MIN_PADDING = 8;

export function fieldGeometry(variant: ZSTextFieldVariant, platform: 'ios' | 'android', metrics: FieldMetrics, multiline: boolean): FieldGeometry {
  const spec = FIELD_SPEC[platform];
  const { lineHeight, labelScale, labelLineHeight } = metrics;
  const minHeight = spec.minHeight[variant];

  if (variant === 'underline') {
    const paddingTop = labelLineHeight + 4;
    const paddingBottom = Math.max(MIN_PADDING, minHeight - paddingTop - lineHeight);
    return { paddingTop, paddingBottom, paddingHorizontal: 0, restTop: paddingTop, floatTop: 0, centerOnBorder: false };
  }

  if (variant === 'inbox') {
    const paddingTop = FLOAT_TOP + labelLineHeight;
    const paddingBottom = Math.max(MIN_PADDING, minHeight - paddingTop - lineHeight);
    const height = paddingTop + lineHeight + paddingBottom;
    const restTop = multiline ? paddingTop : (height - lineHeight) / 2;
    return { paddingTop, paddingBottom, paddingHorizontal: spec.paddingHorizontal, restTop, floatTop: FLOAT_TOP, centerOnBorder: false };
  }

  const padding = Math.max(MIN_PADDING, (minHeight - lineHeight) / 2, (lineHeight * labelScale) / 2 + 2);
  return { paddingTop: padding, paddingBottom: padding, paddingHorizontal: spec.paddingHorizontal, restTop: padding, floatTop: 0, centerOnBorder: true };
}

export function labelOverhangReserve(variant: ZSTextFieldVariant, metrics: FieldMetrics, baseLineHeight: number): number {
  if (variant !== 'outlined') return 0;
  return Math.max(0, ((metrics.lineHeight - baseLineHeight) * metrics.labelScale) / 2);
}

export interface LabelSlot {
  top: number;
  bottom?: number;
  center: boolean;
}

export function labelSlot(variant: ZSTextFieldVariant, geometry: FieldGeometry, multiline: boolean): LabelSlot {
  if (multiline) return { top: geometry.paddingTop, center: false };
  if (variant === 'inbox') return { top: 0, bottom: 0, center: true };
  return { top: geometry.paddingTop, bottom: geometry.paddingBottom, center: true };
}

export function floatTranslateY(geometry: FieldGeometry, restTop: number, labelHeight: number, labelScale: number): number {
  'worklet';
  const top = geometry.centerOnBorder ? -(labelHeight * labelScale) / 2 : geometry.floatTop;
  return top - restTop;
}

export function adornmentTranslateY(geometry: FieldGeometry, slot: LabelSlot, progress: number): number {
  'worklet';
  const floated = (geometry.paddingTop - geometry.paddingBottom) / 2;
  const rest = slot.bottom === undefined ? floated : (slot.top - slot.bottom) / 2;
  return rest + progress * (floated - rest);
}

export const NOTCH_GAP = 4;
