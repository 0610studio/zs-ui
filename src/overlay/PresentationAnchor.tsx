import { type ComponentType, type ReactNode } from 'react';
import { Platform, StyleSheet, type ViewProps } from 'react-native';
import { requireNativeView } from 'expo';

interface NativeAnchorProps extends ViewProps {
  onDetach?: () => void;
}

let NativeAnchor: ComponentType<NativeAnchorProps> | undefined;

export interface PresentationAnchorProps {
  /** 시트를 띄운 화면(모달·formSheet·아래 시트)이 먼저 닫혀 시트도 함께 내려갔을 때 */
  onDetach: () => void;
  children: ReactNode;
}

/**
 * iOS 시스템 시트를 지금 맨 위에 떠 있는 화면에서 띄운다 — 모달·formSheet 라우트와 먼저 띄운 시트를 닫지 않고 그 위에 겹친다.
 * 다른 플랫폼은 시트가 따로 뜬 창이라 감싸지 않는다.
 */
export function PresentationAnchor({ onDetach, children }: PresentationAnchorProps) {
  if (Platform.OS !== 'ios') return <>{children}</>;
  NativeAnchor ??= requireNativeView<NativeAnchorProps>('ZsUi', 'ZSPresentationAnchorView');
  return (
    <NativeAnchor style={styles.anchor} onDetach={onDetach}>
      {children}
    </NativeAnchor>
  );
}

const styles = StyleSheet.create({
  anchor: { position: 'absolute', width: 0, height: 0 },
});
