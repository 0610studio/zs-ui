export interface MockModifier {
  $type: string;
  args: unknown[];
}

const modifier = (type: string) => (...args: unknown[]): MockModifier => ({ $type: type, args });

export const fillMaxWidth = modifier('fillMaxWidth');
export const height = modifier('height');
export const padding = modifier('padding');
export const paddingAll = modifier('paddingAll');
export const defaultMinSize = modifier('defaultMinSize');
export const selectable = modifier('selectable');
export const selectableGroup = modifier('selectableGroup');
export const toggleable = modifier('toggleable');
export const testID = modifier('testID');
export const menuAnchor = modifier('menuAnchor');
export const onVisibilityChanged = modifier('onVisibilityChanged');
export const weight = modifier('weight');
export const width = modifier('width');
export const clickable = modifier('clickable');
export const semantics = modifier('semantics');
export const rotate = modifier('rotate');
export const IntrinsicSize = { Min: 'min', Max: 'max' } as const;
