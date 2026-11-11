import { StyleSheet, View } from 'react-native';
import {
  ZSScreen,
  ZSSwitch,
  ZSText,
  useDevicePosture,
  useDisplayFeatures,
  useTheme,
  useWindowLayout,
} from '@0610studio/zs-ui';
import { useCalendarFoldable } from '../../src/model/CalendarFoldableContext';
import Section from '../../src/ui/kit/Section';
import LabValueRow from '../../src/ui/lab/LabValueRow';

export default function CalendarFoldableSettingsTab() {
  const { colors } = useTheme();
  const { settings, updateSettings } = useCalendarFoldable();
  const { widthClass, heightClass } = useWindowLayout();
  const { fold } = useDisplayFeatures();
  const { posture } = useDevicePosture();

  const foldLabel = fold ? `${fold.orientation} · ${fold.state}${fold.active ? ' · 화면 가름' : ''}` : '없음';

  return (
    <ZSScreen style={[styles.container, { backgroundColor: colors.surface1 }]}>
      <Section label="보기" gap={16}>
        <ZSSwitch
          label="스크롤로 주·월 전환"
          value={settings.scrollTransition}
          onValueChange={(scrollTransition) => updateSettings({ scrollTransition })}
          testID="cf-setting-scroll"
        />
        <ZSText variant="label" color="textSecondary">1단에서 기록 목록을 올리면 주간, 끝까지 내리면 월간</ZSText>
      </Section>

      <Section label="폴더블" gap={16}>
        <ZSSwitch
          label="테이블탑에서 위·아래로 나누기"
          value={settings.tabletop}
          onValueChange={(tabletop) => updateSettings({ tabletop })}
          testID="cf-setting-tabletop"
        />
        <ZSText variant="label" color="textSecondary">가로로 반쯤 접으면 달력은 위, 기록은 아래</ZSText>
      </Section>

      <Section label="현재 창" gap={0}>
        <LabValueRow label="크기 클래스" value={`${widthClass} × ${heightClass}`} testID="cf-window-class" />
        <LabValueRow label="접힘선" value={foldLabel} testID="cf-window-fold" />
        <LabValueRow label="자세" value={posture} testID="cf-window-posture" isLast />
      </Section>
    </ZSScreen>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40, gap: 20 },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  block: { gap: 2 },
  flex1: { flex: 1 },
});
