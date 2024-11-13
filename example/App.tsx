import { ThemeProvider, NotifyProvider } from 'zs-ui';
import NavigateComponent from './src/NavigateComponent';
import SnackBar from './src/ui/Snackbar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NotifyProvider customSnackbar={SnackBar}>
          <NavigateComponent />
        </NotifyProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}