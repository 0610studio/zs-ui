import { Stack } from 'expo-router';
import WebExampleScreen from '../src/ui/WebExampleScreen';

export default function WebExample() {
  return (
    <>
      <Stack.Screen options={{ title: 'Web Example' }} />
      <WebExampleScreen />
    </>
  );
}
