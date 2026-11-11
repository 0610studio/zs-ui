import { requireNativeView } from 'expo';
import { useCallback } from 'react';
import type { NativeSyntheticEvent } from 'react-native';
import type { WindowObservation } from './types';
import type { WindowObserverProps } from './WindowObserver.types';

type NativeProps = Omit<WindowObserverProps, 'onObserve'> & {
  onWindowLayoutChange: (event: NativeSyntheticEvent<WindowObservation>) => void;
};

const NativeWindowObserver = requireNativeView<NativeProps>('ZsUi', 'ZSWindowObserverView');

export default function WindowObserver({ onObserve, ...props }: WindowObserverProps) {
  const handleChange = useCallback(
    (event: NativeSyntheticEvent<WindowObservation>) => onObserve(event.nativeEvent),
    [onObserve],
  );
  return <NativeWindowObserver {...props} onWindowLayoutChange={handleChange} />;
}
