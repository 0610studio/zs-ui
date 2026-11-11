import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ZSBorderBeam, ZSScreen, ZSSwitch, ZSText, useTheme } from '@0610studio/zs-ui';
import Section from '../src/ui/kit/Section';
import { PAGE_CONTENT } from '../src/ui/kit/layout';
import ScreenHeader from '../src/ui/ScreenHeader';

export default function BorderBeamExample() {
  const [active, setActive] = useState(true);
  const { colors } = useTheme();

  return (
    <>
      <ScreenHeader title="ZSBorderBeam" />
      <ZSScreen backgroundColor="background" style={styles.container}>
        <Section surface="list">
          <View style={styles.toggleRow}>
            <View style={styles.toggleText}>
              <ZSText variant="subtitle2" emphasized>active</ZSText>
              <ZSText variant="label" color="textSecondary">끄면 효과가 정지·숨김 처리됩니다</ZSText>
            </View>
            <ZSSwitch accessibilityLabel="active" value={active} onValueChange={setActive} />
          </View>
        </Section>

        <Section label="기본" surface="plain" gap={14}>
          <ZSBorderBeam active={active} borderRadius={16}>
            <View style={styles.card}>
              <ZSText variant="subtitle1">기본 혜성 광선</ZSText>
              <ZSText variant="label" color="textSecondary">
                꼬리가 페이드되는 광선이 얇은 track 테두리 위를 순환합니다
              </ZSText>
            </View>
          </ZSBorderBeam>
        </Section>

        <Section label="beamLength · 색" surface="plain" gap={20}>
          <ZSBorderBeam
            active={active}
            colorFrom="#F59E0B"
            colorTo="#EF4444"
            beamLength={0.6}
            duration={3200}
            borderRadius={20}
            glow={0.6}
          >
            <View style={styles.card}>
              <ZSText variant="subtitle1">긴 광선 (beamLength 0.6)</ZSText>
              <ZSText variant="label" color="textSecondary">광선 길이 · 속도 · 색상 조절</ZSText>
            </View>
          </ZSBorderBeam>

          <ZSBorderBeam
            active={active}
            colors={['#ffb96a20', '#ffd17b70', '#ffd17b', '#ffaa90', '#ffaa9033']}
            beamLength={1}
            duration={4200}
            borderRadius={20}
            trackColor="none"
          >
            <View style={styles.card}>
              <ZSText variant="subtitle1">전체 링 그라디언트 (beamLength 1)</ZSText>
              <ZSText variant="label" color="textSecondary">알파 포함 colors 배열을 그대로 사용</ZSText>
            </View>
          </ZSBorderBeam>

          <ZSBorderBeam
            active={active}
            colorFrom="#06B6D4"
            colorTo="#8B5CF6"
            reverse
            beamLength={0.25}
            duration={6000}
            borderRadius={999}
            glow={0.35}
          >
            <View style={styles.pill}>
              <ZSText variant="subtitle2" emphasized style={styles.pillText}>reverse · 짧은 광선 · pill</ZSText>
            </View>
          </ZSBorderBeam>
        </Section>

        <Section label="글로우 펄스 · glow" surface="plain" gap={14}>
          <ZSBorderBeam
            active={active}
            colorFrom={colors.primary}
            colorTo={colors.primaryContainer}
            glow={{ pulseDuration: 1200, minOpacity: 0.15, maxOpacity: 0.9, width: 14, blur: 12 }}
            borderRadius={16}
          >
            <View style={styles.card}>
              <ZSText variant="subtitle1">강한 글로우 펄스</ZSText>
              <ZSText variant="label" color="textSecondary">
                glow 객체로 폭·blur·펄스 세밀 제어
              </ZSText>
            </View>
          </ZSBorderBeam>

          <ZSBorderBeam active={active} glow={false} borderRadius={16}>
            <View style={styles.card}>
              <ZSText variant="subtitle1">글로우 없음 (glow=false)</ZSText>
              <ZSText variant="label" color="textSecondary">선명한 광선만 표시 — 가장 가벼운 구성</ZSText>
            </View>
          </ZSBorderBeam>
        </Section>
      </ZSScreen>
    </>
  );
}

const styles = StyleSheet.create({
  container: PAGE_CONTENT,
  toggleRow: {
    width: '100%',
    minHeight: 64,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  toggleText: { flex: 1, gap: 2 },
  card: {
    width: '100%',
    padding: 20,
    gap: 6,
  },
  pill: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  pillText: { textAlign: 'center' },
});
