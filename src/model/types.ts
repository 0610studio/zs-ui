import { ReactNode } from "react";
import { TextProps, TouchableOpacityProps } from "react-native";

export interface OverlayContextProps {
  showLoader: () => void;
  showModality: (props: ModalityProps) => void;
  showPopOverMenu: (props: PopOverMenuProps) => void;
  showBottomSheet: (props: ShowBottomSheetProps) => void;
  showSnackBar: (props: ShowSnackBarProps) => void;
  showAlert: (props: ShowAlertProps) => void;
  hideOverlay: (option: HideOption) => void;
}

export interface AlertContextProps {
  alertVisible: boolean;
  setAlertVisible: (visible: boolean) => void;
}

export interface SnackbarContextProps {
  snackItemStack: SnackItem[];
  hideSnackBar: (index: number) => void;
}

export interface BottomSheetContextProps {
  bottomSheetVisible: boolean;
  setBottomSheetVisible: (visible: boolean) => void;
  height: number;
  setHeight: (height: number) => void;
}

export interface PopOverContextProps {
  popOverVisible: boolean;
  setPopOverVisible: (visible: boolean) => void;
}

export interface ModalityContextProps {
  modalityVisible: boolean;
  setModalityVisible: (visible: boolean) => void;
}

export interface LoaderContextProps {
  loaderVisible: boolean;
  setLoaderVisible: (visible: boolean) => void;
}

export interface PopOverMenuProps {
  px: number;
  py: number;
  component: React.ReactNode;
}

export interface ModalityProps {
  component: React.ReactNode;
}

export interface CustomSnackbarProps {
  snackType: SnackType;
  snackMessage: string;
}

export interface OverlayProviderProps {
  children: ReactNode;
  customSnackbar?: (props: CustomSnackbarProps) => React.ReactNode;
  loaderComponent?: () => React.ReactNode;
  maxSnackbarCount?: number;
}

export interface AlertAction {
  label: string;
  onPress?: () => void;
}

export interface ShowAlertProps {
  title?: string;
  informative?: string;
  actions?: AlertActions;
  isBackgroundTouchClose?: boolean;
  titleStyle?: TextProps['style'];
  informativeStyle?: TextProps['style'];
  secondaryButtonStyle?: TouchableOpacityProps['style'];
  primaryButtonStyle?: TouchableOpacityProps['style'];
  secondaryButtonTextStyle?: TextProps['style'];
}

export interface AlertActions {
  primary: AlertAction;
  secondary?: AlertAction;
}

export interface SnackItem {
  message: string;
  type: SnackType;
  index: number;
  snackbarDuration?: number;
}

export type SnackType = 'success' | 'error' | '';

export type HideOption = 'all' | 'snack' | 'alert' | 'bottomSheet' | 'loader' | 'popOver' | 'modal' | 'aboveKeyboard';

export interface ShowSnackBarProps {
  message: string;
  type?: SnackType;
  index?: number;
  snackbarDuration?: number;
}

export interface BottomSheetOptions {
  isBackgroundTouchClose?: boolean;
  marginHorizontal?: number;
  marginBottom?: number;
  height?: number;
  padding?: number;
}

export interface ShowBottomSheetProps {
  headerComponent?: React.ReactNode;
  component: React.ReactNode;
  options?: BottomSheetOptions;
}

export interface AboveKeyboardOptions {
  keyboardShowOffset?: number;
  keyboardHideOffset?: number;
}

export enum FoldingState {
  FOLDED = 'folded', // 폴딩, 일반 기기
  UNFOLDED = 'unfolded',
}

export interface FoldingFeatureData {
  state: 'flat' | 'half_opened' | 'unknown';
  orientation: 'horizontal' | 'vertical' | 'unknown';
  isSeparating: boolean;
  bounds: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  };
}

export interface NativeFoldingStateInfo {
  foldingFeature: FoldingFeatureData | null;
  width: number; // PT 단위
}

export interface FoldingStateInfo {
  foldingState: FoldingState;
  width: number;
}
