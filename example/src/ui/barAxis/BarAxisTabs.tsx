import { ZSTabNavigator, useTheme } from '@0610studio/zs-ui';
import ScreenHeader from '../ScreenHeader';

export function BarAxisLabTabs() {
  const { colors } = useTheme();

  return (
    <>
      <ScreenHeader title="Bar Axis" background={colors.surface1} />
      <ZSTabNavigator>
        <ZSTabNavigator.Screen name="index" options={{ title: '배치', icon: { sf: 'slider.horizontal.3', md: 'tune' } }} />
        <ZSTabNavigator.Screen name="list" options={{ title: '목록', icon: { sf: 'list.bullet', md: 'list' } }} />
        <ZSTabNavigator.Screen name="info" options={{ title: '정보', icon: { sf: 'info.circle', md: 'info' } }} />
      </ZSTabNavigator>
    </>
  );
}
