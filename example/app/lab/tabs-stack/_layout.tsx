import { Stack } from 'expo-router';
import { ZSTabNavigator, useTheme } from '@0610studio/zs-ui';

export default function LabTabsStackLayout() {
  const { colors } = useTheme();
  return (
    <>
      <Stack.Screen options={{ headerShown: false, contentStyle: { backgroundColor: colors.surface1 } }} />
      <ZSTabNavigator android={{ hideOnKeyboard: true }}>
        <ZSTabNavigator.Screen name="feed" options={{ title: '피드', icon: { sf: 'list.bullet', md: 'list' } }} />
        <ZSTabNavigator.Screen name="profile" options={{ title: '프로필', icon: { sf: 'person', md: 'person' }, badge: 2 }} />
      </ZSTabNavigator>
    </>
  );
}
