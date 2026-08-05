import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { ZSContainer, ZSText, ZSView, useTheme } from 'zs-ui';
import Section from '../src/ui/kit/Section';
import Segmented from '../src/ui/kit/Segmented';
import CodeBlock from '../src/ui/kit/CodeBlock';

const STEPS = [5, 10, 20, 30, 40, 50] as const;
const SEMANTICS = ['primary', 'secondary', 'danger', 'warning', 'success', 'information'] as const;
const BACKGROUNDS = ['base', 'layer1', 'layer2', 'neutral'] as const;
const TEXT_COLORS = ['base', 'secondary', 'disabled', 'primary', 'danger', 'success', 'information'] as const;
const ELEVATIONS = [2, 4, 6, 8, 9] as const;

export default function ThemeExample() {
  const { palette } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Theme' }} />
      <ZSContainer style={[styles.container, { backgroundColor: palette.background.layer2 }]}>
        {/* 현재 테마 모드 전환 */}
        <Segmented
          options={['light', 'dark'] as const}
          value={palette.mode}
          onChange={(next) => {
            if (next !== palette.mode) palette.toggleTheme();
          }}
        />

        <Section label="Background" direction="row" gap={8}>
          {BACKGROUNDS.map((name) => (
            <View key={name} style={styles.bgChipSlot}>
              <View
                style={[
                  styles.bgChip,
                  { backgroundColor: palette.background[name], borderColor: palette.grey[30] },
                ]}
              />
              <ZSText typo="caption.2" color="secondary">{name}</ZSText>
            </View>
          ))}
        </Section>

        <Section label="Semantic × Step" gap={10}>
          {SEMANTICS.map((name) => (
            <View key={name} style={styles.stepRow}>
              <ZSText typo="caption.1" color="secondary" style={styles.stepLabel}>{name}</ZSText>
              {STEPS.map((step) => (
                <View
                  key={step}
                  style={[
                    styles.stepChip,
                    { backgroundColor: palette[name][step] },
                    step <= 10 && { borderWidth: 1, borderColor: palette.grey[20] },
                  ]}
                />
              ))}
            </View>
          ))}
          <View style={styles.stepRow}>
            <View style={styles.stepLabel} />
            {STEPS.map((step) => (
              <ZSText key={step} typo="caption.3" color="disabled" style={styles.stepCaption}>{step}</ZSText>
            ))}
          </View>
        </Section>

        <Section label="Main Variants" direction="row" gap={8}>
          {(['lighter', 'light', 'main', 'dark', 'darker'] as const).map((variant) => (
            <View key={variant} style={styles.bgChipSlot}>
              <View style={[styles.bgChip, { backgroundColor: palette.primary[variant], borderWidth: 0 }]} />
              <ZSText typo="caption.2" color="secondary">{variant}</ZSText>
            </View>
          ))}
        </Section>

        <Section label="Text" direction="row" gap={16}>
          {TEXT_COLORS.map((color) => (
            <ZSText key={color} typo="subTitle.2" color={color}>{color}</ZSText>
          ))}
        </Section>

        <Section label="Elevation" gap={12}>
          {ELEVATIONS.map((level) => (
            <ZSView key={level} color="base" elevationLevel={level} style={styles.elevationBox}>
              <ZSText typo="caption.2" color="secondary">elevationLevel {level}</ZSText>
            </ZSView>
          ))}
        </Section>

        <CodeBlock
          code={`const palette = themeFactory({
  light: { primary: { main: '#6366F1' } },
  dark:  { primary: { main: '#8B5CF6' } },
});

<ThemeProvider customPalette={palette}>`}
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
  bgChipSlot: {
    flex: 1,
    gap: 6,
    alignItems: 'center',
  },
  bgChip: {
    width: '100%',
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
  },
  stepRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepLabel: {
    width: 76,
    flexShrink: 0,
  },
  stepChip: {
    flex: 1,
    height: 32,
    borderRadius: 8,
  },
  stepCaption: {
    flex: 1,
    textAlign: 'center',
  },
  elevationBox: {
    width: '100%',
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
