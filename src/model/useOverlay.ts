import { createContext, useContext } from 'react';
import { OverlayContextProps } from './types';

export const OverlayContext = createContext<OverlayContextProps | null>(null);

export const useOverlay = () => {
    const value = useContext(OverlayContext);
    if (!value) {
        throw new Error('useOverlay must be used within an OverlayProvider');
    }
    return value;
};
