import { Image, Platform } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { ZSPressable, useTheme } from '@0610studio/zs-ui';

const ANDROID_ICONS = {
  light: require('../../assets/icons/light_mode.png'),
  dark: require('../../assets/icons/dark_mode.png'),
};

function HeaderRight() {
  const { mode, colors, toggleTheme } = useTheme();

  return (
    <ZSPressable
      accessibilityRole="button"
      accessibilityLabel={mode === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
      testID="theme-toggle"
      onPress={toggleTheme}
      radius="full"
      backgroundColor="surface2"
      style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
    >
      {Platform.OS === 'ios' ? (
        <SymbolView name={mode === 'dark' ? 'moon.fill' : 'sun.max.fill'} tintColor={colors.text} size={20} />
      ) : (
        <Image source={ANDROID_ICONS[mode]} style={{ width: 22, height: 22, tintColor: colors.text }} />
      )}
    </ZSPressable>
  );
}
export default HeaderRight;
