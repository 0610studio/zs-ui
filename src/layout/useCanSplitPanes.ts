import { Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWindowLayout } from './LayoutContext';
import { canSplitByFraction, MATERIAL_PANE_SPACER } from './paneLayout';

export interface CanSplitPanesOptions {
  /** ZSPaneLayout `spacing` 과 같은 값. 기본 iOS 0 · Android 24 */
  spacing?: number;
  /** ZSPaneLayout `divider` 가 `true`(hairline)인지. 기본 iOS `true` · Android `false` */
  divider?: boolean;
}

/**
 * 창 전체를 쓰는 ZSPaneLayout 이 같은 `spacing`·`divider` 로 비율 분할(두 칸)이 되는지.
 * 큰 화면 창(`largeScreen`)이고, 좌우 safe area·구분선·spacing 을 뺀 폭에 pane 두 개(각 240 이상)가 들어가야 한다.
 * 책 자세처럼 접힘선으로 나뉘는 경우는 포함하지 않는다(`useDisplayFeatures().fold`).
 */
export function useCanSplitPanes({
  spacing = Platform.OS === 'android' ? MATERIAL_PANE_SPACER : 0,
  divider = Platform.OS === 'ios',
}: CanSplitPanesOptions = {}): boolean {
  const { width, widthClass, largeScreen } = useWindowLayout();
  const { left, right } = useSafeAreaInsets();
  const dividerWidth = divider ? StyleSheet.hairlineWidth : 0;
  return canSplitByFraction({ widthClass, largeScreen, available: width - left - right - dividerWidth - spacing });
}
