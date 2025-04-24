import { Stack } from 'expo-router';
import { ThemeProvider, OverlayProvider } from 'zs-ui';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SnackBar from '../src/ui/Snackbar';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
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