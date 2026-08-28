import { Stack } from 'expo-router';
import { ThemeProvider, OverlayProvider, themeFactory, ThemeFactoryConfig } from '@0610studio/zs-ui';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import SnackBar from '../src/ui/Snackbar';
import HeaderRight from '../src/ui/HeaderRight';

// 문서 플레이그라운드의 초기 전송량을 줄이기 위해 대표 굵기만 사용합니다.
// 전체 굵기 매핑은 ThemeProvider 문서를 참고하세요.
const themeFonts = {
  400: 'Pretendard-Regular',
  600: 'Pretendard-SemiBold',
  700: 'Pretendard-Bold',
};

const requireFonts = {
  'Pretendard-Regular': require('../assets/fonts/Pretendard-Regular.otf'),
  'Pretendard-SemiBold': require('../assets/fonts/Pretendard-SemiBold.otf'),
  'Pretendard-Bold': require('../assets/fonts/Pretendard-Bold.otf'),
};

// Playground의 주요 액션은 브랜드 주황색을 유지하면서 흰 텍스트와 충분한 대비를 확보합니다.
const playgroundThemeConfig: ThemeFactoryConfig = {
  light: {
    primary: {
      50: '#A65318',
      60: '#914612',
      main: '#A65318',
      dark: '#914612',
      darker: '#843F10',
    },
  },
  dark: {
    primary: {
      50: '#A65318',
      60: '#914612',
      main: '#A65318',
      dark: '#914612',
      darker: '#843F10',
    },
  },
};

const playgroundPalette = themeFactory(playgroundThemeConfig);

export default function RootLayout() {
  const [fontsLoaded] = useFonts(requireFonts);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider
        themeFonts={themeFonts}
        isDarkModeEnabled={true}
        customPalette={playgroundPalette}
        foldable={{
          unfoldedSinglePaneMaxWidth: 600
        }}
      >
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
