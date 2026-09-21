import { Stack } from 'expo-router';
import WebExampleScreen from '../src/ui/WebExampleScreen';

/**
 * e2e 전용 화면 — 카탈로그와 문서 플레이그라운드에서는 링크하지 않는다.
 */
export default function WebExample() {
  return (
    <>
      <Stack.Screen options={{ title: 'Web Example' }} />
      <WebExampleScreen />
    </>
  );
}
