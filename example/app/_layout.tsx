import { Stack } from 'expo-router';
import { ThemeProvider, OverlayProvider, themeFactory, ThemeFactoryConfig } from '@0610studio/zs-ui';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import SnackBar from '../src/ui/Snackbar';
import HeaderRight from '../src/ui/HeaderRight';

// 플레이그라운드 전송량을 줄이려 대표 굵기만 쓴다 (전체 매핑은 ThemeProvider 문서 참고)
const themeFonts = {
  400: 'Pretendard-Regular',
  600: 'Pretendard-SemiBold',
  700: 'Pretendard-Bold',
};

// 같은 파일을 굵기 키로도 넘긴다 — Skia 캔버스(ZSCalendar 날짜 숫자)는 이름이 아니라 파일이 필요하다
const themeFontAssets = {
  400: require('../assets/fonts/Pretendard-Regular.otf'),
  600: require('../assets/fonts/Pretendard-SemiBold.otf'),
  700: require('../assets/fonts/Pretendard-Bold.otf'),
};

const requireFonts = {
  'Pretendard-Regular': themeFontAssets[400],
  'Pretendard-SemiBold': themeFontAssets[600],
  'Pretendard-Bold': themeFontAssets[700],
};

// 브랜드 주황색을 유지하면서 흰 텍스트 대비를 확보한다
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
        themeFontAssets={themeFontAssets}
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
