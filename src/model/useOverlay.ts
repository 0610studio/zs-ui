import { createContext, useContext } from 'react';
import { AlertContextProps, SnackbarContextProps, BottomSheetContextProps, PopOverContextProps, ModalityContextProps, LoaderContextProps, OverlayContextProps } from './types';

export const OverlayContext = createContext<OverlayContextProps | null>(null);
export const AlertContext = createContext<AlertContextProps | null>(null);
export const SnackbarContext = createContext<SnackbarContextProps | null>(null);
export const BottomSheetContext = createContext<BottomSheetContextProps | null>(null);
export const PopOverContext = createContext<PopOverContextProps | null>(null);
export const ModalityContext = createContext<ModalityContextProps | null>(null);
export const LoaderContext = createContext<LoaderContextProps | null>(null);

export const useOverlay = () => {
    const context = useContext(OverlayContext);
    if (!context) {
        throw new Error('useOverlay must be used within an OverlayProvider');
    }
    return context;
};

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within an AlertProvider');
    }
    return context;
};

export const useSnackbar = () => {
    const context = useContext(SnackbarContext);
    if (!context) {
        throw new Error('useSnackbar must be used within a SnackbarProvider');
    }
    return context;
};

export const useBottomSheet = () => {
    const context = useContext(BottomSheetContext);
    if (!context) {
        throw new Error('useBottomSheet must be used within a BottomSheetProvider');
    }
    return context;
};

export const usePopOver = () => {
    const context = useContext(PopOverContext);
    if (!context) {
        throw new Error('usePopOver must be used within a PopOverProvider');
    }
    return context;
};

export const useModality = () => {
    const context = useContext(ModalityContext);
    if (!context) {
        throw new Error('useModality must be used within a ModalityProvider');
    }
    return context;
};

export const useLoader = () => {
    const context = useContext(LoaderContext);
    if (!context) {
        throw new Error('useLoader must be used within a LoaderProvider');
    }
    return context;
};
