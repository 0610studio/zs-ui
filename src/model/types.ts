import type { ReactNode } from 'react';

export interface AlertButton {
  label: string;
  /** 대화상자가 닫힌 뒤 호출합니다. */
  onPress?: () => void;
}

export interface ShowAlertProps {
  title: string;
  message?: string;
  confirm: AlertButton & { destructive?: boolean };
  cancel?: AlertButton;
  dismissible?: boolean;
}

export interface BottomSheetOptions {
  dismissible?: boolean;
  /** 닫힐 때 한 번 호출합니다 — 아래 시트·라우트와 함께 닫혀도 불립니다. */
  onClose?: () => void;
  /** Android는 값 대신 개수로 절반·전체 단계를 정합니다. */
  snapPoints?: ('half' | 'full' | `${number}%`)[];
  contentPadding?: number;
}

export interface ShowBottomSheetProps {
  /** 손잡이 아래 헤더 줄 — 손잡이처럼 시트를 끌 수 있다. 문자열이면 제목(h4) */
  header?: ReactNode;
  /** 헤더 오른쪽 — 버튼 등. 탭은 버튼이 받고 시트를 끌지 않는다 */
  headerRight?: ReactNode;
  component: ReactNode;
  bottomComponent?: ReactNode;
  options?: BottomSheetOptions;
}

export interface ShowSnackbarProps {
  message: string;
  type?: 'success' | 'error';
  action?: { label: string; onPress: () => void };
  /** action이 있으면 자동으로 닫히지 않습니다. */
  duration?: 'short' | 'long';
}

export interface ShowLoaderProps {
  accessibilityLabel?: string;
}

export interface OverlayContextProps {
  showAlert: (props: ShowAlertProps) => void;
  /** 시트를 띄운다. 열린 시트가 있으면 그 위에 겹친다. */
  showBottomSheet: (props: ShowBottomSheetProps) => void;
  /** 맨 위 시트를 닫는다. */
  hideBottomSheet: () => void;
  showSnackbar: (props: ShowSnackbarProps) => boolean;
  showLoader: (props?: ShowLoaderProps) => void;
  hideLoader: () => void;
}
