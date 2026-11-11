import { createContext } from 'react';
import type { SharedValue } from 'react-native-reanimated';

export interface HeaderFill {
  progress: SharedValue<number>;
  from: string;
  to: string;
}

export const HeaderFillContext = createContext<((fill: HeaderFill | null) => void) | null>(null);
