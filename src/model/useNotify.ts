import { createContext, useContext } from 'react';
import { NotifyProps } from './types';

const NotifyContext = createContext<NotifyProps | null>(null);

export const useNotify = () => {
    const context = useContext(NotifyContext);
    if (!context) {
        throw new Error('useNotify must be used within a NotifyProvider');
    }
    return context;
};

export default NotifyContext;
