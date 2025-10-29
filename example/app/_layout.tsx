import { Stack } from 'expo-router';
import { ThemeProvider, OverlayProvider, themeFactory, ThemeFactoryConfig } from 'zs-ui';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import SnackBar from '../src/ui/Snackbar';
import HeaderRight from '../src/ui/HeaderRight';

// 폰트 적용 예제. 폰트의 이름을 ThemeProvider의 themeFonts에 추가해야 동작합니다.
const themeFonts = {
  100: 'Pretendard-Thin',
  200: 'Pretendard-ExtraLight',
  300: 'Pretendard-Light',
  400: 'Pretendard-Regular',
  500: 'Pretendard-Medium',
  600: 'Pretendard-SemiBold',
  700: 'Pretendard-Bold',
  800: 'Pretendard-ExtraBold',
  900: 'Pretendard-Black',
};

const requireFonts = {
  'Pretendard-Thin': require('../assets/fonts/Pretendard-Thin.otf'),
  'Pretendard-ExtraLight': require('../assets/fonts/Pretendard-ExtraLight.otf'),
  'Pretendard-Light': require('../assets/fonts/Pretendard-Light.otf'),
  'Pretendard-Regular': require('../assets/fonts/Pretendard-Regular.otf'),
  'Pretendard-Medium': require('../assets/fonts/Pretendard-Medium.otf'),
  'Pretendard-SemiBold': require('../assets/fonts/Pretendard-SemiBold.otf'),
  'Pretendard-Bold': require('../assets/fonts/Pretendard-Bold.otf'),
  'Pretendard-ExtraBold': require('../assets/fonts/Pretendard-ExtraBold.otf'),
  'Pretendard-Black': require('../assets/fonts/Pretendard-Black.otf'),
};

// 커스텀 테마 설정
const customThemeConfig: ThemeFactoryConfig = {
  light: {
    primary: {
      main: '#6366F1',
      light: '#818CF8',
      dark: '#4F46E5',
      lighter: '#C7D2FE',
      darker: '#3730A3',
    },
    secondary: {
      main: '#EC4899',
    },
    success: {
      main: '#10B981',
    },
    danger: {
      main: '#EF4444'
    },
  },
  dark: {
    primary: {
      main: '#8B5CF6',
      light: '#A78BFA',
      dark: '#7C3AED',
      lighter: '#DDD6FE',
      darker: '#5B21B6',
    },
    secondary: {
      main: '#F59E0B',
    },
    success: {
      main: '#34D399',
    },
    danger: {
      main: '#F87171',
    },
  },
};

// 커스텀 테마 팩토리 생성
const customPalette = themeFactory(customThemeConfig);


export default function RootLayout() {
  const [fontsLoaded] = useFonts(requireFonts);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider themeFonts={themeFonts} isDarkModeEnabled={true} customPalette={customPalette}>
        <OverlayProvider customSnackbar={SnackBar}>
          <Stack
            screenOptions={{
              animation: 'slide_from_right',
              headerRight: () => <HeaderRight />,
            }}
          />
        </OverlayProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
} 