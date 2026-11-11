import { useMemo, useState } from 'react';
import { Stack } from 'expo-router';
import { ZSTabNavigator, useTheme } from '@0610studio/zs-ui';
import { SidebarPlacementContext, type SidebarPlacement } from '../../../src/ui/lab/SidebarPlacementContext';

export default function SidebarTabsLayout() {
  const { colors } = useTheme();
  const [placement, setPlacement] = useState<SidebarPlacement>('sidebar');
  const value = useMemo(() => ({ placement, setPlacement }), [placement]);

  return (
    <SidebarPlacementContext.Provider value={value}>
      <Stack.Screen options={{ headerShown: false, contentStyle: { backgroundColor: colors.surface1 } }} />
      <ZSTabNavigator ios={{ sidebar: placement }}>
        <ZSTabNavigator.Screen name="home" options={{ title: '홈', icon: { sf: 'house', md: 'home' } }} />
        <ZSTabNavigator.Screen name="records" options={{ title: '기록', icon: { sf: 'list.bullet.rectangle', md: 'list' } }} />
        <ZSTabNavigator.Screen name="settings" options={{ title: '설정', icon: { sf: 'gearshape', md: 'settings' } }} />
      </ZSTabNavigator>
    </SidebarPlacementContext.Provider>
  );
}
