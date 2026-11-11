import { createContext, useContext } from 'react';

export const ZSTabsBadgeContext = createContext<{
  unread: number;
  setUnread: (unread: number) => void;
  mutedTabs: boolean;
  setMutedTabs: (muted: boolean) => void;
}>({ unread: 0, setUnread: () => {}, mutedTabs: false, setMutedTabs: () => {} });

export const useZSTabsBadge = () => useContext(ZSTabsBadgeContext);
