import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type { WindowObservation } from './types';

export interface WindowObserverProps {
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  onObserve: (observation: WindowObservation) => void;
}
