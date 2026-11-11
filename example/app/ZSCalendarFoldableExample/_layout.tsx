import { ZSTabNavigator, useTheme } from '@0610studio/zs-ui';
import { CalendarFoldableProvider } from '../../src/model/CalendarFoldableContext';
import ScreenHeader from '../../src/ui/ScreenHeader';

export default function ZSCalendarFoldableLayout() {
  const { colors } = useTheme();
  return (
    <CalendarFoldableProvider>
      <ScreenHeader title="ZSCalendar 폴더블" background={colors.surface1} />
      <ZSTabNavigator android={{ hideOnKeyboard: true }}>
        <ZSTabNavigator.Screen name="index" options={{ title: '달력', icon: { sf: 'calendar', md: 'calendar_month' } }} />
        <ZSTabNavigator.Screen name="stats" options={{ title: '통계', icon: { sf: 'chart.bar', md: 'bar_chart' } }} />
        <ZSTabNavigator.Screen name="settings" options={{ title: '설정', icon: { sf: 'gearshape', md: 'settings' } }} />
      </ZSTabNavigator>
    </CalendarFoldableProvider>
  );
}
