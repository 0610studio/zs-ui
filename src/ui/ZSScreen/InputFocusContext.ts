import { createContext, useContext } from 'react';

export const InputFocusContext = createContext<(() => void) | null>(null);

export const useNotifyInputFocus = () => useContext(InputFocusContext);
