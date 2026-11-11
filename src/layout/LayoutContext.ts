import { createContext, useContext, useSyncExternalStore } from 'react';
import type { BarAxis, DevicePosture, DisplayFeatures, WindowLayout } from './types';

export interface ValueStore<T> {
  get: () => T;
  subscribe: (listener: () => void) => () => void;
  set: (next: T) => void;
}

export function createValueStore<T>(initial: T, isSame: (a: T, b: T) => boolean): ValueStore<T> {
  let current = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => current,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    set: (next) => {
      if (isSame(current, next)) return;
      current = next;
      listeners.forEach((listener) => listener());
    },
  };
}

export interface LayoutStores {
  window: ValueStore<WindowLayout>;
  displayFeatures: ValueStore<DisplayFeatures>;
  posture: ValueStore<DevicePosture>;
  barAxis: ValueStore<BarAxis>;
}

export const LayoutContext = createContext<LayoutStores | null>(null);

function useLayoutStores(hook: string): LayoutStores {
  const stores = useContext(LayoutContext);
  if (!stores) {
    throw new Error(`${hook} must be used within a LayoutProvider`);
  }
  return stores;
}

function useStoreValue<T>(store: ValueStore<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}

export function useWindowLayout(): WindowLayout {
  return useStoreValue(useLayoutStores('useWindowLayout').window);
}

export function useDisplayFeatures(): DisplayFeatures {
  return useStoreValue(useLayoutStores('useDisplayFeatures').displayFeatures);
}

export function useDevicePosture(): DevicePosture {
  return useStoreValue(useLayoutStores('useDevicePosture').posture);
}

export function useBarAxis(): [BarAxis, (next: BarAxis) => void] {
  const { barAxis } = useLayoutStores('useBarAxis');
  return [useStoreValue(barAxis), barAxis.set];
}
