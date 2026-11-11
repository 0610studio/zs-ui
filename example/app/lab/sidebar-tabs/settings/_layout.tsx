import { Stack } from 'expo-router';
import { useStackTheme } from '@0610studio/zs-ui';

export default function SidebarTabsSettingsLayout() {
  return <Stack screenOptions={useStackTheme()} />;
}
