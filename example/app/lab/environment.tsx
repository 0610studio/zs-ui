import type { ReactNode } from 'react';
import { Appearance, Platform, StyleSheet, View, useColorScheme } from 'react-native';
import ScreenScrollView from '../../src/ui/kit/ScreenScrollView';
import { ZSChip, useTheme } from '@0610studio/zs-ui';
import Section from '../../src/ui/kit/Section';
import LabValueRow from '../../src/ui/lab/LabValueRow';
import ScreenHeader from '../../src/ui/ScreenHeader';
import { router, useLocalSearchParams } from 'expo-router';
import { LiveSize, labStyles } from '../../src/ui/lab/FoldableLab';
import WindowPanel from '../../src/ui/lab/WindowPanel';
import DisplayPanel from '../../src/ui/lab/DisplayPanel';

const EXPO_VERSION: string = require('expo/package.json').version;
const REACT_VERSION: string = require('react/package.json').version;
const ZS_UI_VERSION: string = require('@0610studio/zs-ui/package.json').version;

function reactNativeVersion() {
  const version = Platform.constants.reactNativeVersion;
  const { major, minor, patch, prerelease } = version;
  return `${major}.${minor}.${patch}${prerelease ? `-${prerelease}` : ''}`;
}

const PANELS = [{ value: 'runtime', label: '런타임·테마' }, { value: 'window', label: '창 크기' }, { value: 'fold', label: '접힘·자세' }] as const;

export default function LabEnvironment() {
  const { panel } = useLocalSearchParams<{ panel?: string }>();
  const selected = PANELS.some((item) => item.value === panel) ? panel : 'runtime';
  const header = (
    <>
      <LiveSize padded={false} />
      <View style={labStyles.row}>
        {PANELS.map((item) => (
          <ZSChip key={item.value} label={item.label} selected={selected === item.value} onSelectedChange={() => router.setParams({ panel: item.value })} testID={`lab-environment-panel-${item.value}`} />
        ))}
      </View>
    </>
  );
  return (
    <>
      <ScreenHeader title="기기 측정·환경" />
      {selected === 'window' ? <WindowPanel header={header} /> : selected === 'fold' ? <DisplayPanel header={header} /> : <RuntimePanel header={header} />}
    </>
  );
}

function RuntimePanel({ header }: { header: ReactNode }) {
  const { colors, mode, contrastLevel, colorSchemePreference, setColorSchemePreference } = useTheme();
  const nativeScheme = useColorScheme();

  return (
    <>
      <ScreenScrollView
        style={{ backgroundColor: colors.surface1 }}
        contentContainerStyle={styles.content}
      >
        {header}
        <Section label="런타임" gap={0}>
          <LabValueRow label="Expo SDK" value={EXPO_VERSION} testID="lab-environment-expo" />
          <LabValueRow label="React Native" value={reactNativeVersion()} testID="lab-environment-rn" />
          <LabValueRow label="React" value={REACT_VERSION} testID="lab-environment-react" />
          <LabValueRow label="zs-ui" value={ZS_UI_VERSION} testID="lab-environment-zsui" />
          <LabValueRow label="OS" value={`${Platform.OS} ${Platform.Version}`} testID="lab-environment-os" isLast />
        </Section>

        <Section label="색 모드" gap={0}>
          <LabValueRow label="theme mode" value={mode} testID="lab-environment-theme-mode" />
          <LabValueRow label="theme source" value={colorSchemePreference === 'system' ? 'system' : 'manual'} testID="lab-environment-theme-source" />
          <LabValueRow label="contrast level" value={String(contrastLevel)} testID="lab-environment-contrast" />
          <LabValueRow label="native colorScheme" value={String(nativeScheme ?? Appearance.getColorScheme())} testID="lab-environment-native-scheme" isLast />
        </Section>
        <ZSChip
          label="시스템 설정 따르기"
          selected={colorSchemePreference === 'system'}
          onSelectedChange={() => setColorSchemePreference('system')}
          testID="lab-environment-use-system"
        />
      </ScreenScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 24,
  },
});
