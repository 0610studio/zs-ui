import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { ArrangementView, Host, RNHostView } from '@expo/ui/swift-ui';
import { arrangementViewStyle, ignoreSafeArea } from '@expo/ui/swift-ui/modifiers';
import { ZSPressable, ZSScreen, ZSText, ZSTextField, useTheme, useWindowLayout } from '@0610studio/zs-ui';
import ScreenHeader from '../../src/ui/ScreenHeader';

const ITEMS = Array.from({ length: 20 }, (_, index) => index + 1);

function supportsArrangementView(): boolean {
  if (Platform.OS !== 'ios') return false;
  const [major = 0, minor = 0] = String(Platform.Version).split('.').map((part) => parseInt(part, 10) || 0);
  return major > 27 || (major === 27 && minor >= 1);
}

const ARRANGEMENT_SUPPORTED = supportsArrangementView();

export default function LabArrangement() {
  const { colors } = useTheme();
  const { width, height } = useWindowLayout();
  const [selected, setSelected] = useState(1);
  const [memo, setMemo] = useState('');

  if (!ARRANGEMENT_SUPPORTED) {
    return (
      <>
        <ScreenHeader title="Arrangement" />
        <ZSScreen style={[styles.fallback, { backgroundColor: colors.surface1 }]}>
          <ZSText color="textSecondary">ArrangementView 는 iOS 27.1 이상 전용이다 — 그 아래 iOS 와 Android 는 ZSPaneLayout 을 쓴다.</ZSText>
          <ZSText variant="label" color="textSecondary">{`이 기기: ${Platform.OS} ${Platform.Version}`}</ZSText>
        </ZSScreen>
      </>
    );
  }

  return (
    <>
      <ScreenHeader title="Arrangement" />
      <Host style={[styles.flex1, { backgroundColor: colors.surface1 }]}>
        <ArrangementView modifiers={[arrangementViewStyle('split', { axes: 'horizontal' }), ignoreSafeArea({ edges: 'bottom' })]}>
          <ArrangementView.Primary>
            <RNHostView>
              <PaneProbe label="primary" window={`${Math.round(width)}×${Math.round(height)}`}>
                <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.list} testID="lab-arrangement-list">
                  {ITEMS.map((item) => (
                    <ZSPressable
                      key={item}
                      onPress={() => setSelected(item)}
                      testID={`lab-arrangement-item-${item}`}
                      style={[styles.item, { borderColor: selected === item ? colors.text : colors.border }]}
                    >
                      <ZSText variant="body1">{`항목 ${item}`}</ZSText>
                    </ZSPressable>
                  ))}
                </ScrollView>
              </PaneProbe>
            </RNHostView>
          </ArrangementView.Primary>
          <ArrangementView.Secondary>
            <RNHostView>
              <PaneProbe label="secondary">
                <View style={styles.detail}>
                  <ZSText variant="h3" emphasized testID="lab-arrangement-detail">{`항목 ${selected} 상세`}</ZSText>
                  <ZSTextField label="메모" value={memo} onChangeText={setMemo} testID="lab-arrangement-memo" />
                </View>
              </PaneProbe>
            </RNHostView>
          </ArrangementView.Secondary>
        </ArrangementView>
      </Host>
    </>
  );
}

function PaneProbe({ label, window, children }: { label: string; window?: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  const [size, setSize] = useState('0×0');
  return (
    <View
      style={styles.flex1}
      onLayout={(event) => setSize(`${Math.round(event.nativeEvent.layout.width)}×${Math.round(event.nativeEvent.layout.height)}`)}
    >
      <View style={[styles.probe, { backgroundColor: colors.surface2 }]}>
        <ZSText variant="caption" emphasized testID={`lab-arrangement-${label}-size`}>
          {`${label} ${size}${window ? ` · window ${window}` : ''}`}
        </ZSText>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  fallback: { flex: 1, padding: 20, gap: 8 },
  probe: { paddingVertical: 8, paddingHorizontal: 20 },
  list: { padding: 20, gap: 8 },
  item: { padding: 14, borderRadius: 12, borderWidth: 1.5 },
  detail: { padding: 20, gap: 16 },
});
