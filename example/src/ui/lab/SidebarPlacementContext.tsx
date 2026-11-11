import { createContext, useContext } from 'react';

export type SidebarPlacement = 'automatic' | 'sidebar' | 'tabBar';

export const SIDEBAR_PLACEMENTS: SidebarPlacement[] = ['automatic', 'sidebar', 'tabBar'];

export const SidebarPlacementContext = createContext<{
  placement: SidebarPlacement;
  setPlacement: (placement: SidebarPlacement) => void;
}>({ placement: 'sidebar', setPlacement: () => {} });

export const useSidebarPlacement = () => useContext(SidebarPlacementContext);
