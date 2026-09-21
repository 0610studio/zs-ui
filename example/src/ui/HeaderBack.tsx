import { Text, TouchableOpacity, type ColorValue } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@0610studio/zs-ui';

/**
 * 웹 헤더 전용 뒤로가기. 문서 iframe 은 예제 라우트를 직접 열기 때문에 스택에 화면이 하나뿐이고,
 * 그러면 native-stack 기본 back 버튼이 아예 렌더되지 않는다.
 */
function HeaderBack({ tintColor }: { tintColor?: ColorValue }) {
  const { palette } = useTheme();

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel="뒤로 가기"
      testID="header-back"
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      onPress={() => {
        if (router.canGoBack()) {
          router.back();
          return;
        }
        router.replace('/');
      }}
      style={{ paddingRight: 14, paddingVertical: 2 }}
    >
      <Text style={{ fontSize: 30, lineHeight: 34, color: tintColor ?? palette.text.base }}>‹</Text>
    </TouchableOpacity>
  );
}

export default HeaderBack;
