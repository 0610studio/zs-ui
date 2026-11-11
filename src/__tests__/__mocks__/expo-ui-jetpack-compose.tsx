import React, { forwardRef, useImperativeHandle } from 'react';
import { compound, host } from './expo-ui-host';

export const mockSetText = jest.fn();

export const mockSheetHide = jest.fn(() => Promise.resolve());

export const ModalBottomSheet = forwardRef((props: Record<string, unknown> & { children?: React.ReactNode }, ref) => {
  useImperativeHandle(ref, () => ({ hide: mockSheetHide }));
  return React.createElement('ModalBottomSheet', props, props.children);
});

export const OutlinedTextField = Object.assign(
  forwardRef((props: Record<string, unknown> & { children?: React.ReactNode }, ref) => {
    useImperativeHandle(ref, () => ({ setText: mockSetText }));
    return React.createElement('OutlinedTextField', props, props.children);
  }),
  { Label: host('OutlinedTextField.Label'), Placeholder: host('OutlinedTextField.Placeholder'), TrailingIcon: host('OutlinedTextField.TrailingIcon') },
);

export const DropdownMenu = compound('DropdownMenu', ['Trigger', 'Items'] as const);
export const DropdownMenuItem = compound('DropdownMenuItem', ['Text', 'LeadingIcon', 'TrailingIcon'] as const);
export const SegmentedButton = compound('SegmentedButton', ['Label'] as const);
export const Text = host('Text');
export const ContainedLoadingIndicator = host('ContainedLoadingIndicator');
export const SingleChoiceSegmentedButtonRow = host('SingleChoiceSegmentedButtonRow');
export const Column = host('Column');
export const Row = host('Row');
export const RadioButton = host('RadioButton');
export const ExposedDropdownMenu = host('ExposedDropdownMenu');
export const ExposedDropdownMenuBox = host('ExposedDropdownMenuBox');
export const Icon = host('Icon');
export const RNHostView = host('RNHostView');
export const Switch = host('ComposeSwitch');
export const Checkbox = host('ComposeCheckbox');
export const Shape = { RoundedCorner: host('Shape.RoundedCorner'), Pill: host('Shape.Pill') };
