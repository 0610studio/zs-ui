import { ReactNode } from "react";
import { TextProps, TouchableOpacityProps } from "react-native";

export interface OverlayProps {
    alertVisible: boolean;
    setAlertVisible: (visible: boolean) => void;
    // ---
    snackItemStack: SnackItem[];
    hideSnackBar: (index: number) => void;
    // ---
    bottomSheetVisible: boolean;
    setBottomSheetVisible: (visible: boolean) => void;
    // ---
    loaderVisible: boolean;
    // ---
    modalityVisible: boolean;
    setPopOverVisible: (visible: boolean) => void;
    // ---
    popOverVisible: boolean;
    setModalityVisible: (visible: boolean) => void;
    // ---
    showAlert: (props: ShowAlertProps) => void;
    showSnackBar: (props: ShowSnackBarProps) => void;
    showBottomSheet: (props: ShowBottomSheetProps) => void;
    showLoader: () => void;
    showPopOverMenu: (props: PopOverMenuProps) => void;
    showModality: (props: ModalityProps) => void;
    // ---
    hideOverlay: (option: HideOption) => void;
}

export interface PopOverMenuProps {
    px: number;
    py: number;
    component: React.ReactNode;
}

export interface ModalityProps {
    component: React.ReactNode;
}

export interface ShowBottomSheetProps {
    backgroundColor?: string;
    isBottomRadius?: boolean;
    marginHorizontal?: number;
    isHandleVisible?: boolean;
    marginBottom?: number;
    padding?: number;
    component: React.ReactNode;
    contentsGestureEnable?: boolean;
    maxHeight?: number;
    isScrollView?: boolean;
    showsVerticalScrollIndicator?: boolean;
    headerComponent?: React.ReactNode;
};

export interface CustomSnackbarProps {
    snackType: SnackType;
    snackMessage: string;
};

export interface OverlayProviderProps {
    children: ReactNode;
    customSnackbar?: (props: CustomSnackbarProps) => React.ReactNode;
    loaderComponent?: () => React.ReactNode;
};

export interface AlertAction {
    label: string;
    onPress?: () => void;
};

export interface ShowAlertProps {
    title: string;
    informative: string;
    actions?: AlertActions;
    isBackgroundTouchClose?: boolean;
    titleStyle?: TextProps['style'];
    informativeStyle?: TextProps['style'];
    secondaryButtonStyle?: TouchableOpacityProps['style'];
    primaryButtonStyle?: TouchableOpacityProps['style'];
    secondaryButtonTextStyle?: TextProps['style'];
    primaryButtonTextStyle?: TextProps['style'];
    singleButtonTextStyle?: TextProps['style'];
};

export interface AlertActions {
    primary: AlertAction;
    secondary?: AlertAction;
};

export interface SnackItem {
    message: string;
    type: SnackType;
    index: number;
    snackbarDuration?: number;
};

export type SnackType = 'success' | 'error' | '';

export type HideOption = 'all' | 'snack' | 'alert' | 'bottomSheet' | 'loader' | 'popOver' | 'modal';

export interface ShowSnackBarProps {
    message: string;
    type?: SnackType;
    index?: number;
    snackbarDuration?: number;
};

export interface BottomSheetRef {
    handleVisible: (isOpen: boolean) => void;
};