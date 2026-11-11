import { useControllableState } from '../../model/useControllableState';
import type { ZSSelectProps } from './types';

type SelectionProps<T extends string | number> = Pick<ZSSelectProps<T>, 'options' | 'value' | 'defaultValue' | 'onValueChange' | 'disabled'>;

export function useSelection<T extends string | number>({ options, value, defaultValue, onValueChange, disabled }: SelectionProps<T>) {
  const [current, setCurrent] = useControllableState<T | null>(value, defaultValue ?? null);
  const selectedIndex = current === null ? -1 : options.findIndex((option) => option.value === current);

  const select = (index: number) => {
    if (disabled) return;
    const option = options[index];
    if (!option) return;
    setCurrent(option.value);
    onValueChange?.(option.value, index);
  };

  return [selectedIndex, select] as const;
}
