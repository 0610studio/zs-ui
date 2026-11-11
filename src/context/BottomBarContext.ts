import { createContext, useContext } from 'react';
import { createValueStore, type ValueStore } from '../layout/LayoutContext';

export interface BottomBarEdge {
  owner: number;
  top: number;
}

export type BottomBarStore = ValueStore<BottomBarEdge | null>;

export function createBottomBarStore(): BottomBarStore {
  return createValueStore<BottomBarEdge | null>(null, (a, b) => a?.owner === b?.owner && a?.top === b?.top);
}

export const BottomBarStoreContext = createContext<BottomBarStore | null>(null);

export function useBottomBarStore(): BottomBarStore | null {
  return useContext(BottomBarStoreContext);
}

export const BottomStickyContext = createContext<((top: number | null) => void) | null>(null);
