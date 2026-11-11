import { createContext, useContext } from 'react';
import type { PaneLayout } from './types';

export const PaneContext = createContext<PaneLayout | null>(null);

export function usePaneLayout(): PaneLayout {
  const pane = useContext(PaneContext);
  if (!pane) {
    throw new Error('usePaneLayout must be used within a ZSPaneLayout pane');
  }
  return pane;
}
