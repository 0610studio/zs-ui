import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { ZSBlockButton, ZSContainer, ZSPressable, ZSText, useTheme } from 'zs-ui';
import type { TypoOptions } from 'zs-ui';
import Section from '../src/ui/kit/Section';
import CodeBlock from '../src/ui/kit/CodeBlock';

type Intent = 'primary' | 'secondary' | 'danger' | 'warning' | 'success' | 'information' | 'grey';
type Variant = 'solid' | 'pastel' | 'stroke';

const INTENTS: Exclude<Intent, 'secondary'>[] = ['primary', 'danger', 'information', 'success', 'warning', 'grey'];
const VARIANTS: Variant[] = ['solid', 'pastel', 'stroke'];
const SIZE_TYPOS: TypoOptions[] = ['label.1', 'label.2', 'label.3', 'label.4'];

export default function ButtonExample() {
  const { palette } = useTheme();
  const [intent, setIntent] = useState<Exclude<Intent, 'secondary'>>('primary');

  const handleSubmit = useCallback(async () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve('완료'), 500);
    });
  }, []);

  return (
    <>
      <Stack.Screen options={{ title: 'Button' }} />
      <ZSContainer keyboardScrollExtraOffset={130} style={[styles.container, { backgroundColor: palette.background.layer2 }]}>
        <Section label="ZSPressable" gap={10}>
          <ZSPressable
            style={[styles.fullButton, { backgroundColor: palette.primary[50] }]}
            fullWidth
            onPress={() => console.log('Primary FullWidth')}
          >
            <ZSText typo="subTitle.1" color="white">Primary FullWidth 버튼</ZSText>
          </ZSPressable>
          <ZSPressable
            style={[styles.fullButton, { backgroundColor: palette.danger[50] }]}
            fullWidth
            onPress={() => console.log('Danger FullWidth')}
          >
            <ZSText typo="body.1" color="white">Danger FullWidth 버튼</ZSText>
          </ZSPressable>
          <ZSPressable
            style={[styles.fullButton, { backgroundColor: palette.primary[50] }]}
            fullWidth
            isLoading
            onPress={handleSubmit}
          >
            <ZSText typo="subTitle.1" color="white">Primary FullWidth (Loading)</ZSText>
          </ZSPressable>
        </Section>

        <Section label="ZSBlockButton" gap={14}>
          {/* intent 선택 칩 */}
          <View style={styles.chipRow}>
            {INTENTS.map((name) => {
              const active = name === intent;
              return (
                <Pressable
                  key={name}
                  onPress={() => setIntent(name)}
                  style={[
                    styles.chip,
                    { backgroundColor: active ? palette.grey[80] : palette.background.layer2 },
                  ]}
                >
                  <ZSText typo="label.4" style={{ color: active ? palette.background.base : palette.text.secondary }}>
                    {name}
                  </ZSText>
                </Pressable>
              );
            })}
          </View>

          {/* 선택된 intent 의 variant 3종 */}
          <View style={styles.buttonRow}>
            {VARIANTS.map((variant) => (
              <ZSBlockButton
                key={variant}
                onPress={() => console.log(`${intent} ${variant}`)}
                title={variant}
                intent={intent}
                variant={variant}
                typo="label.1"
              />
            ))}
          </View>

          {/* typo 크기별 패딩 스케일 */}
          <View style={styles.buttonRow}>
            {SIZE_TYPOS.map((typo) => (
              <ZSBlockButton
                key={typo}
                onPress={() => console.log(typo)}
                title={typo}
                intent={intent}
                variant="solid"
                typo={typo}
              />
            ))}
          </View>
        </Section>

        <CodeBlock
          code={`<ZSBlockButton
  title="solid"
  intent="${intent}"
  variant="solid"
  typo="label.1"
  onPress={...}
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
    paddingBottom: 90,
    paddingHorizontal: 20,
  },
  fullButton: {
    padding: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  chipRow: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 100,
  },
  buttonRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
});
