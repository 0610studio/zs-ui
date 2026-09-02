import { ReactNode } from "react";
import { TextProps, TouchableOpacityProps } from "react-native";

export interface OverlayContextProps {
  showLoader: () => void;
  showModality: (props: ModalityProps) => void;
  showPopOverMenu: (props: PopOverMenuProps) => void;
  showBottomSheet: (props: ShowBottomSheetProps) => void;
  showSnackBar: (props: ShowSnackBarProps) => void;
  showAlert: (props: ShowAlertProps) => void;
  /** 인자 생략 시 'all' */
  hideOverlay: (option?: HideOption) => void;
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
  height: BottomSheetHeight;
  setHeight: (height: BottomSheetHeight) => void;
  maxHeight: number;
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
  foldableSingleScreen?: boolean;
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
  primaryButtonTextStyle?: TextProps['style'];
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
  /** 배경 터치·드래그 닫힘 허용 (기본 true). false 여도 hideOverlay 로는 닫힌다. */
  dismissable?: boolean;
  /** @deprecated `dismissable` 사용. 미지정 시에만 참조되며 제스처 닫힘까지 함께 제어한다. */
  isBackgroundTouchClose?: boolean;
  /** 어떤 경로로 닫히든 1회 호출된다 */
  onClose?: () => void;
  marginHorizontal?: number;
  marginBottom?: number;
  height?: BottomSheetHeight;
  maxHeight?: number;
  padding?: number;
  foldableSingleScreen?: boolean;
  type?: 'floating' | 'fixed';
}

export type BottomSheetHeight = number | 'auto';

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
  FOLDED = 'folded',
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
  width: number;
}

export interface FoldingStateInfo {
  foldingState: FoldingState;
  width: number;
}
