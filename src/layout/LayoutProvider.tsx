import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { Dimensions, Platform, StyleSheet } from 'react-native';
import { addHingeListener, getHinge, type Hinge } from 'expo-hinge';
import { StatusBar } from 'expo-status-bar';
import { isSameDevicePosture, isSameDisplayFeatures, NO_DISPLAY_FEATURES, resolveDevicePosture, resolveDisplayFeatures } from './displayFeatures';
import { createValueStore, LayoutContext, type LayoutStores } from './LayoutContext';
import type { BarAxis, ReadableMaxWidth, WindowObservation } from './types';
import WindowObserver from './WindowObserver';
import { isSameWindowLayout, resolveWindowLayout } from './windowClass';

export interface LayoutProviderProps {
  children: ReactNode;
  readableMaxWidth?: ReadableMaxWidth;
  barAxis?: BarAxis;
}

const OS = Platform.OS === 'ios' ? 'ios' : 'android';

export function LayoutProvider({ children, readableMaxWidth = 'system', barAxis = 'vertical' }: LayoutProviderProps) {
  const lastRef = useRef<{ observation: WindowObservation; measured: boolean }>({
    observation: Dimensions.get('window'),
    measured: false,
  });
  const readableRef = useRef(readableMaxWidth);
  readableRef.current = readableMaxWidth;
  const hingeRef = useRef<Hinge | null>(null);

  const [stores] = useState<LayoutStores>(() => {
    hingeRef.current = getHinge();
    return {
      window: createValueStore(resolveWindowLayout(lastRef.current.observation, OS, false, readableMaxWidth), isSameWindowLayout),
      displayFeatures: createValueStore(NO_DISPLAY_FEATURES, isSameDisplayFeatures),
      posture: createValueStore(resolveDevicePosture(NO_DISPLAY_FEATURES, hingeRef.current), isSameDevicePosture),
      barAxis: createValueStore<BarAxis>(barAxis, Object.is),
    };
  });

  const handleObserve = useCallback(
    (observation: WindowObservation) => {
      lastRef.current = { observation, measured: true };
      stores.window.set(resolveWindowLayout(observation, OS, true, readableRef.current));
      const displayFeatures = resolveDisplayFeatures(observation.displayFeatures);
      stores.displayFeatures.set(displayFeatures);
      stores.posture.set(resolveDevicePosture(displayFeatures, hingeRef.current));
    },
    [stores],
  );

  useEffect(() => {
    const handleHinge = (hinge: Hinge | null) => {
      hingeRef.current = hinge;
      stores.posture.set(resolveDevicePosture(stores.displayFeatures.get(), hinge));
    };
    handleHinge(getHinge());
    const subscription = addHingeListener((event) => handleHinge(event.hinge));
    return () => subscription.remove();
  }, [stores]);

  useEffect(() => {
    const { observation, measured } = lastRef.current;
    stores.window.set(resolveWindowLayout(observation, OS, measured, readableMaxWidth));
  }, [stores, readableMaxWidth]);

  useEffect(() => {
    stores.barAxis.set(barAxis);
  }, [stores, barAxis]);

  const appliedBarAxis = useSyncExternalStore(stores.barAxis.subscribe, stores.barAxis.get, stores.barAxis.get);
  useEffect(() => {
    if (Platform.OS !== 'ios' || appliedBarAxis !== 'horizontal') return;
    StatusBar.setVerticalBarBehaviorIOS('disabled');
    return () => StatusBar.setVerticalBarBehaviorIOS('automatic');
  }, [appliedBarAxis]);

  return (
    <LayoutContext.Provider value={stores}>
      <WindowObserver style={styles.root} onObserve={handleObserve}>
        {children}
      </WindowObserver>
    </LayoutContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
