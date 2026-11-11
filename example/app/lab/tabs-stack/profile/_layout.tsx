import { Stack } from 'expo-router';
import { useStackTheme } from '@0610studio/zs-ui';

export const unstable_settings = { anchor: 'index' };

export default function TabsStackProfileLayout() {
  return <Stack screenOptions={useStackTheme()} />;
}
