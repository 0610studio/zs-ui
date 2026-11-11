import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ZSButton, ZSChip, ZSScreen, ZSPressable, ZSText, type PaletteColor, type ZSButtonSize, type ZSButtonVariant } from '@0610studio/zs-ui';
import Section from '../src/ui/kit/Section';
import { PAGE_CONTENT } from '../src/ui/kit/layout';
import ScreenHeader from '../src/ui/ScreenHeader';

const INTENTS: PaletteColor[] = ['primary', 'secondary', 'neutral', 'error', 'success', 'info'];
const VARIANTS: ZSButtonVariant[] = ['filled', 'tonal', 'outlined', 'text'];
const SIZES: ZSButtonSize[] = ['small', 'medium', 'large'];

export default function ButtonExample() {
  const [color, setColor] = useState<PaletteColor>('primary');
  const [loading, setLoading] = useState(false);
  const [presses, setPresses] = useState(0);

  return (
    <>
      <ScreenHeader title="ZSButton" />
      <ZSScreen backgroundColor="background" style={styles.container}>
        <Section label="색 · color" surface="plain" gap={8} direction="row">
          {INTENTS.map((name) => (
            <ZSChip key={name} label={name} selected={name === color} onSelectedChange={() => setColor(name)} checkIcon={false} />
          ))}
        </Section>

        <Section label="모양 · variant" surface="plain" gap={12}>
          {VARIANTS.map((variant) => (
            <ZSButton key={variant} title={variant} variant={variant} color={color} onPress={() => setPresses((n) => n + 1)} testID={`button-${variant}`} />
          ))}
          <ZSText variant="caption" color="textSecondary" testID="button-presses">{`누른 횟수 ${presses}`}</ZSText>
        </Section>

        <Section label="크기 · size" surface="plain" gap={12}>
          {SIZES.map((size) => (
            <ZSButton key={size} title={size} size={size} color={color} onPress={() => undefined} />
          ))}
        </Section>

        <Section label="상태" surface="plain" gap={12}>
          <ZSButton
            title="저장"
            fullWidth
            loading={loading}
            preventDoublePress
            onPress={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 1500);
            }}
            testID="button-loading"
          />
          <View style={styles.row}>
            <ZSButton title="비활성" disabled onPress={() => undefined} />
            <ZSButton title="비활성" variant="outlined" disabled onPress={() => undefined} />
          </View>
        </Section>

        <Section label="ZSPressable" surface="plain" gap={12}>
          <ZSPressable radius="xl" backgroundColor="surface2" style={styles.pressable} onPress={() => setPresses((n) => n + 1)}>
            <ZSText variant="body1">누름 표시: Android ripple · iOS 하이라이트</ZSText>
          </ZSPressable>
        </Section>
      </ZSScreen>
    </>
  );
}

const styles = StyleSheet.create({
  container: PAGE_CONTENT,
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  pressable: { padding: 20 },
});
