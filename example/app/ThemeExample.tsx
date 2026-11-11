import { StyleSheet, View } from 'react-native';
import { ZSScreen, ZSText, ZSBox, radiusStyle, useTheme, type ColorName } from '@0610studio/zs-ui';
import Section from '../src/ui/kit/Section';
import ContentIcon from '../src/ui/kit/ContentIcon';
import { PAGE_CONTENT } from '../src/ui/kit/layout';
import Segmented from '../src/ui/kit/Segmented';
import useLargeText from '../src/hooks/useLargeText';
import ScreenHeader from '../src/ui/ScreenHeader';

const PALETTE = ['primary', 'secondary', 'tertiary', 'neutral', 'error', 'success', 'warning', 'info'] as const;
const SURFACES: ColorName[] = ['background', 'surface2', 'surface3', 'surface4', 'surface5'];
const RADII = ['md', 'lg', 'xl', '2xl', '3xl'] as const;
const SHADOWS = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function ThemeExample() {
  const { colors, mode, contrastLevel, colorSchemePreference, setColorSchemePreference } = useTheme();
  const large = useLargeText();

  return (
    <>
      <ScreenHeader title="Theme" />
      <ZSScreen backgroundColor="background" style={styles.container}>
        <Segmented options={['system', 'light', 'dark'] as const} value={colorSchemePreference} onValueChange={setColorSchemePreference} testID="theme-preference" />
        <ZSText variant="caption" color="textSecondary" testID="theme-state">{`mode ${mode} · contrast ${contrastLevel}`}</ZSText>

        <Section label="팔레트 색 (main · on · container · onContainer)" gap={10}>
          {PALETTE.map((name) => (
            <View key={name} style={large ? styles.paletteStack : styles.paletteRow}>
              <ZSText variant="label" color="textSecondary" style={styles.paletteLabel} numberOfLines={1}>{name}</ZSText>
              <View style={styles.swatches}>
                {[name, `on${cap(name)}`, `${name}Container`, `on${cap(name)}Container`].map((token) => (
                  <View key={token} style={[styles.swatch, { backgroundColor: colors[token as ColorName], borderColor: colors.border }]} />
                ))}
              </View>
            </View>
          ))}
        </Section>

        <Section label="면 (background = surface1 → surface5)" direction="row" gap={8}>
          {SURFACES.map((token) => (
            <View key={token} style={[styles.surfaceSwatch, { backgroundColor: colors[token], borderColor: colors.border }]} />
          ))}
        </Section>

        <Section label="글자" gap={6}>
          <ZSText variant="body1" color="text">text — 본문 · 얇은 선택 표시</ZSText>
          <ZSText variant="body1" color="textSecondary">textSecondary — 보조</ZSText>
          <ZSText variant="body1" color="error">error — 오류 · 위험 동작</ZSText>
        </Section>

        <Section label="주색은 두 가지 — 채움 primary · 표시 primaryMark" surface="plain" gap={12}>
          <View style={styles.ruleRow}>
            <View style={[styles.ruleSample, styles.accentFace, radiusStyle('full'), { backgroundColor: colors.primary }]}>
              <ZSText variant="subtitle2" emphasized color="onPrimary">고른 것</ZSText>
            </View>
            <ZSText variant="caption" color="textSecondary" style={styles.flexShrink}>
              {`primary ${colors.primary} — 버튼·칩·달력 선택일·스위치 같은 면. 위 글자는 onPrimary`}
            </ZSText>
          </View>
          <View style={styles.ruleRow}>
            <View style={styles.ruleSample}>
              <View style={[styles.markCapsule, radiusStyle('full'), { backgroundColor: colors.surface4 }]}>
                <ContentIcon name="chat" color={colors.primaryMark} size={20} />
                <ZSText variant="caption" emphasized color="primaryMark">채팅</ZSText>
              </View>
            </View>
            <ZSText variant="caption" color="textSecondary" style={styles.flexShrink}>
              {`primaryMark ${colors.primaryMark} — 탭 선택 아이콘·라벨처럼 주색으로 표시할 때. 채도는 지키고 밝기만 내린 같은 계열`}
            </ZSText>
          </View>
          <View style={styles.ruleRow}>
            <View style={styles.ruleSample}>
              <View style={[styles.inkRing, { borderColor: colors.text }]}>
                <View style={[styles.inkDot, { backgroundColor: colors.text }]} />
              </View>
            </View>
            <ZSText variant="caption" color="textSecondary" style={styles.flexShrink}>
              text — 라디오·체크·포커스·밑줄 같은 얇은 선
            </ZSText>
          </View>
        </Section>

        <Section label="shadow (xs → xl)" direction="row" gap={12}>
          {SHADOWS.map((token) => (
            <ZSBox key={token} backgroundColor="surface1" shadow={token} style={styles.shadowBox}>
              <ZSText variant="label">{token}</ZSText>
            </ZSBox>
          ))}
        </Section>

        <Section label="radius (md → 3xl)" direction="row" gap={8}>
          {RADII.map((token) => (
            <View key={token} style={[styles.shape, radiusStyle(token), { backgroundColor: colors.surface4 }]} />
          ))}
        </Section>
      </ZSScreen>
    </>
  );
}

const styles = StyleSheet.create({
  container: PAGE_CONTENT,
  paletteRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  paletteStack: { alignItems: 'flex-start', gap: 4 },
  paletteLabel: { flexGrow: 1, flexShrink: 1 },
  swatches: { flexDirection: 'row', gap: 8 },
  swatch: { width: 36, height: 28, borderRadius: 8, borderWidth: StyleSheet.hairlineWidth },
  surfaceSwatch: { width: 48, height: 48, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
  shadowBox: { minWidth: 48, minHeight: 48, paddingHorizontal: 8, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  shape: { width: 48, height: 48 },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ruleSample: { width: 96, alignItems: 'center' },
  accentFace: { height: 36, paddingHorizontal: 16, justifyContent: 'center' },
  markCapsule: { width: 64, paddingVertical: 6, alignItems: 'center', gap: 2 },
  inkRing: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  inkDot: { width: 10, height: 10, borderRadius: 5 },
  flexShrink: { flexShrink: 1 },
});
