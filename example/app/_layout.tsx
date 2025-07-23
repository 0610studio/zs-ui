import { Stack } from 'expo-router';
import { ThemeProvider, OverlayProvider } from 'zs-ui';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import SnackBar from '../src/ui/Snackbar';

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

export default function RootLayout() {
  const [fontsLoaded] = useFonts(requireFonts);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider themeFonts={themeFonts} isDarkModeEnabled={false} isSplitView={true}>
        <OverlayProvider customSnackbar={SnackBar}>
          <Stack
            screenOptions={{
              animation: 'slide_from_right',
            }}
          />
        </OverlayProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
} 