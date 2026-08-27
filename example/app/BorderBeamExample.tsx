import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { ZSBorderBeam, ZSContainer, ZSSwitch, ZSText, useTheme } from '@0610studio/zs-ui';
import Section from '../src/ui/kit/Section';
import CodeBlock from '../src/ui/kit/CodeBlock';

export default function BorderBeamExample() {
  const [active, setActive] = useState(true);
  const { palette } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'ZSBorderBeam' }} />
      <ZSContainer style={[styles.container, { backgroundColor: palette.background.layer2 }]}>
        <Section gap={0}>
          <View style={styles.toggleRow}>
            <View style={{ gap: 2 }}>
              <ZSText typo="subTitle.2">active</ZSText>
              <ZSText typo="caption.1" color="secondary">끄면 효과가 정지·숨김 처리됩니다</ZSText>
            </View>
            <ZSSwitch isActive={active} onToggle={() => setActive(!active)} />
          </View>
        </Section>

        <Section label="Basic" gap={14}>
          <ZSBorderBeam active={active} borderRadius={16}>
            <View style={styles.card}>
              <ZSText typo="subTitle.1">기본 혜성 광선</ZSText>
              <ZSText typo="caption.1" color="secondary">
                꼬리가 페이드되는 광선이 얇은 track 테두리 위를 순환합니다
              </ZSText>
            </View>
          </ZSBorderBeam>
        </Section>

        <Section label="beamLength · Colors" gap={20}>
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
              <ZSText typo="subTitle.1">긴 광선 (beamLength 0.6)</ZSText>
              <ZSText typo="caption.1" color="secondary">광선 길이 · 속도 · 색상 조절</ZSText>
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
              <ZSText typo="subTitle.1">전체 링 그라디언트 (beamLength 1)</ZSText>
              <ZSText typo="caption.1" color="secondary">알파 포함 colors 배열을 그대로 사용</ZSText>
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
              <ZSText typo="subTitle.2">reverse · 짧은 광선 · pill</ZSText>
            </View>
          </ZSBorderBeam>
        </Section>

        <Section label="Glow Pulse" gap={14}>
          <ZSBorderBeam
            active={active}
            colorFrom={palette.primary.main}
            colorTo={palette.primary.light}
            glow={{ pulseDuration: 1200, minOpacity: 0.15, maxOpacity: 0.9, width: 14, blur: 12 }}
            borderRadius={16}
          >
            <View style={styles.card}>
              <ZSText typo="subTitle.1">강한 글로우 펄스</ZSText>
              <ZSText typo="caption.1" color="secondary">
                glow 객체로 폭·blur·펄스 세밀 제어
              </ZSText>
            </View>
          </ZSBorderBeam>

          <ZSBorderBeam active={active} glow={false} borderRadius={16}>
            <View style={styles.card}>
              <ZSText typo="subTitle.1">글로우 없음 (glow=false)</ZSText>
              <ZSText typo="caption.1" color="secondary">선명한 광선만 표시 — 가장 가벼운 구성</ZSText>
            </View>
          </ZSBorderBeam>
        </Section>

        <CodeBlock
          code={`<ZSBorderBeam
  colorFrom="#06B6D4"
  colorTo="#8B5CF6"
  beamLength={0.35}   // 광선이 둘레에서 차지하는 비율
  trackColor="none"   // 기본 테두리 생략
  glow={0.6}          // 0~1 강도, false면 끔
  duration={5000}
  borderRadius={20}
>
  <Card />
</ZSBorderBeam>

// 알파 포함 팔레트로 전체 링 구성
<ZSBorderBeam
  colors={['#ffb96a20', '#ffd17b', '#ffaa9033']}
  beamLength={1}
/>`}
        />
      </ZSContainer>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
    paddingTop: 24,
    paddingBottom: 48,
    paddingHorizontal: 20,
  },
  toggleRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    padding: 20,
    gap: 6,
  },
  pill: {
    width: '100%',
    paddingVertical: 14,
    alignItems: 'center',
  },
});
