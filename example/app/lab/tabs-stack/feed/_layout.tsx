import { Stack } from 'expo-router';
import { useStackTheme } from '@0610studio/zs-ui';

export const unstable_settings = { anchor: 'index' };

export default function TabsStackFeedLayout() {
  return <Stack screenOptions={useStackTheme()} />;
}
