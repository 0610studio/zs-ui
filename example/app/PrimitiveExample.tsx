import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { OPACITY, ZSButton, ZSScreen, ZSPortal, ZSText, ZSBox, useTheme, withOpacity } from '@0610studio/zs-ui';
import useLargeText from '../src/hooks/useLargeText';
import Section from '../src/ui/kit/Section';
import { PAGE_CONTENT } from '../src/ui/kit/layout';
import ScreenHeader from '../src/ui/ScreenHeader';

const SHADOWS = ['xs', 'md', 'xl'] as const;

export default function PrimitiveExample() {
  const [isPortalVisible, setIsPortalVisible] = useState(false);
  const { colors } = useTheme();
  const large = useLargeText();

  return (
    <>
      <ScreenHeader title="기본 프리미티브" />
      <ZSScreen backgroundColor="background" style={styles.container}>
        <Section label="ZSBox · backgroundColor · shadow" surface="plain" gap={12}>
          <View style={[styles.cardRow, large && styles.cardColumn]}>
            {SHADOWS.map((token) => (
              <ZSBox key={token} backgroundColor="surface1" shadow={token} style={[styles.shadowCard, large && styles.shadowCardStacked]}>
                <ZSText variant="label">{`shadow ${token}`}</ZSText>
              </ZSBox>
            ))}
          </View>
        </Section>

        <Section label="ZSPortal · 최상위 레이어" surface="plain" gap={12}>
          <ZSText variant="label" color="textSecondary">현재 컴포넌트의 레이아웃을 벗어나 OverlayProvider 의 최상위 레이어에 그린다.</ZSText>
          <ZSButton title="포털 열기" variant="tonal" color="info" onPress={() => setIsPortalVisible(true)} testID="portal-open" />
        </Section>
      </ZSScreen>

      {isPortalVisible && (
        <ZSPortal>
          <View style={[styles.portalBackdrop, { backgroundColor: withOpacity(colors.backdrop, OPACITY.backdrop) }]}>
            <ZSBox backgroundColor="surface4" shadow="md" style={styles.portalCard}>
              <ZSText variant="subtitle1">ZSPortal</ZSText>
              <ZSText variant="caption" color="textSecondary">중첩된 부모의 overflow 와 zIndex 영향을 받지 않는 최상위 레이어다.</ZSText>
              <ZSButton title="닫기" fullWidth onPress={() => setIsPortalVisible(false)} testID="portal-close" />
            </ZSBox>
          </View>
        </ZSPortal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: PAGE_CONTENT,
  cardRow: { width: '100%', flexDirection: 'row', gap: 12 },
  shadowCard: { flex: 1, minHeight: 72, padding: 8, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  cardColumn: { flexDirection: 'column' },
  shadowCardStacked: { flex: 0 },
  portalBackdrop: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', padding: 24 },
  portalCard: { width: '100%', maxWidth: 360, borderRadius: 28, padding: 24, gap: 12 },
});
