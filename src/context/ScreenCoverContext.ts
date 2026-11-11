import { createContext, useContext } from 'react';

export const ScreenCoverContext = createContext(false);

export function useScreenCovered(): boolean {
  return useContext(ScreenCoverContext);
}
