import { createContext, useContext } from 'react';
import { OverlayProps } from './types';

const OverlayContext = createContext<OverlayProps | null>(null);

export const useOverlay = () => {
    const context = useContext(OverlayContext);
    if (!context) {
        throw new Error('useOverlay must be used within a OverlayProvider');
    }
    return context;
};

export default OverlayContext;
