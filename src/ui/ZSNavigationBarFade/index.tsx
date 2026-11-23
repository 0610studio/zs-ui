import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useNavigationBarOverDark } from '../../navigation/navigationBarStore';
import { resolveColor, withOpacity, type ColorName } from '../../theme/color';

export interface ZSNavigationBarFadeProps {
  /** 페이드 색 — 색 역할 이름 또는 직접 지정한 색(#RRGGBB). 기본 화면 바탕 `background` */
  color?: ColorName | (string & {});
  /** 맨 아래 불투명도(위 끝은 투명). 기본 0.8 */
  opacity?: number;
  testID?: string;
}

/**
 * Android 하단 내비게이션 바(제스처 손잡이·3버튼) 뒤를 화면 바탕색 투명 → `opacity` 로 덮는다.
 * 시스템 반투명 막(navigation bar contrast) 대신 쓴다 — 앱 설정에서 `expo-navigation-bar` `enforceContrast: false` 로 끈다.
 * 앱 루트에 한 번 두고, 오버레이(시트·스낵바)보다 아래에 둔다. 터치·스크린 리더는 통과한다.
 * iOS·아래 inset 0·`useNavigationBarOnDark()` 화면에서는 그리지 않는다.
 */
export default function ZSNavigationBarFade({ color = 'background', opacity = 0.8, testID = 'zs-navigation-bar-fade' }: ZSNavigationBarFadeProps) {
  const { colors } = useTheme();
  const { bottom } = useSafeAreaInsets();
  const overDark = useNavigationBarOverDark();
  if (Platform.OS !== 'android' || overDark || bottom <= 0) return null;
  const base = resolveColor(colors, color) ?? colors.background;
  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.fade, { height: bottom, backgroundImage: `linear-gradient(to bottom, ${withOpacity(base, 0)}, ${withOpacity(base, opacity)})` }]}
      testID={testID}
    />
  );
}

const styles = StyleSheet.create({
  fade: { position: 'absolute', left: 0, right: 0, bottom: 0 },
});
