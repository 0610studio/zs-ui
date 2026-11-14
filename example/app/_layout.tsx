import { Stack, ThemeProvider as NavigationThemeProvider } from 'expo-router';
import { LayoutProvider, ThemeProvider, OverlayProvider, useNavigationTheme, useStackTheme } from '@0610studio/zs-ui';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { BarAxisSettingProvider, useBarAxisSetting } from '../src/model/BarAxisSetting';
import { StatusBarSlotProvider } from '../src/model/StatusBarSlot';

const fonts = {
  400: 'Pretendard-Regular',
  600: 'Pretendard-SemiBold',
  700: 'Pretendard-Bold',
};

const fontAssets = {
  400: require('../assets/fonts/Pretendard-Regular.otf'),
  600: require('../assets/fonts/Pretendard-SemiBold.otf'),
  700: require('../assets/fonts/Pretendard-Bold.otf'),
};

const accessibilityLabels = {
  clearText: '지우기',
  closeMessage: '메시지 닫기',
  closeTooltip: '툴팁 닫기',
  loading: '불러오는 중',
  navigateUp: '뒤로',
};

const requireFonts = {
  'Pretendard-Regular': fontAssets[400],
  'Pretendard-SemiBold': fontAssets[600],
  'Pretendard-Bold': fontAssets[700],
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts(requireFonts);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <BarAxisSettingProvider>
        <AppProviders />
      </BarAxisSettingProvider>
    </SafeAreaProvider>
  );
}

function AppProviders() {
  const { barAxis } = useBarAxisSetting();

  return (
    <LayoutProvider barAxis={barAxis}>
      <ThemeProvider colors={{ primary: '#ffa20d', secondary: '#0f766e' }} fonts={fonts} fontAssets={fontAssets} accessibilityLabels={accessibilityLabels}>
        <OverlayProvider>
          <StatusBarSlotProvider>
            <ThemedStack />
          </StatusBarSlotProvider>
        </OverlayProvider>
      </ThemeProvider>
    </LayoutProvider>
  );
}

function ThemedStack() {
  const navigationTheme = useNavigationTheme();
  const stackTheme = useStackTheme();

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <Stack
        screenOptions={{
          ...stackTheme,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="FormSheetDemo"
          options={{ presentation: 'formSheet', sheetAllowedDetents: [0.5, 1], sheetGrabberVisible: true, headerShown: false }}
        />
        <Stack.Screen name="ModalSheetDemo" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="friends/breed" options={{ presentation: 'modal' }} />
        <Stack.Screen name="diary/guide" options={{ presentation: 'modal' }} />
        <Stack.Screen name="diary/search" options={{ presentation: 'modal' }} />
        <Stack.Screen name="diary/medical-test" options={{ presentation: 'modal' }} />
        <Stack.Screen name="diary/feed-food" options={{ presentation: 'modal' }} />
        <Stack.Screen name="diary/record/[id]" options={{ title: '' }} />
        <Stack.Screen name="diary/write/[category]" options={{ title: '' }} />
        <Stack.Screen name="diary/gallery" options={{ presentation: 'fullScreenModal' }} />
      </Stack>
    </NavigationThemeProvider>
  );
}
