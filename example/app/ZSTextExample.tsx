import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { ZSContainer, ZSText, useTheme } from '@0610studio/zs-ui';
import type { TypoOptions, TypoStyle, TypoSubStyle } from '@0610studio/zs-ui';
import Section from '../src/ui/kit/Section';
import CodeBlock from '../src/ui/kit/CodeBlock';

const VARIANTS: TypoStyle[] = ['heading', 'title', 'subTitle', 'label', 'body', 'caption'];
const LEVELS: TypoSubStyle[] = ['1', '2', '3', '4', '5', '6'];

// src/theme/typography.ts 의 스케일 (라벨 표기용)
const FONT_SIZES: Record<TypoStyle, number[]> = {
  heading: [36, 32, 28, 24, 20, 18],
  title: [16, 14, 13, 12, 11, 10],
  subTitle: [16, 14, 13, 12, 11, 10],
  label: [16, 14, 13, 12, 11, 10],
  body: [16, 14, 13, 12, 11, 10],
  caption: [12, 11, 10, 9, 8, 7],
};
const COLOR_PROPS = ['primary', 'secondary', 'disabled', 'danger', 'warning', 'success', 'information'] as const;

export default function ZSTextExample() {
  const [variant, setVariant] = useState<TypoStyle>('heading');
  const { palette } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'ZSText' }} />
      <ZSContainer style={[styles.container, { backgroundColor: palette.background.layer2 }]}>
        {/* typo variant 선택 칩 */}
        <View style={styles.chipRow}>
          {VARIANTS.map((name) => {
            const active = name === variant;
            return (
              <Pressable
                key={name}
                onPress={() => setVariant(name)}
                style={[
                  styles.chip,
                  { backgroundColor: active ? palette.grey[80] : palette.background.layer2 },
                ]}
              >
                <ZSText typo="label.3" style={{ color: active ? palette.background.base : palette.text.secondary }}>
                  {name}
                </ZSText>
              </Pressable>
            );
          })}
        </View>

        <Section label={`${variant} 1–6`} gap={0}>
          {LEVELS.map((level, index) => {
            const typo = `${variant}.${level}` as TypoOptions;
            const fontSize = FONT_SIZES[variant][index];
            return (
              <View
                key={level}
                style={[
                  styles.specimenRow,
                  index < LEVELS.length - 1 && { borderBottomWidth: 1, borderBottomColor: palette.grey[20] },
                ]}
              >
                <ZSText typo="caption.3" color="disabled" style={styles.specimenCaption}>
                  {level}·{fontSize}px
                </ZSText>
                <ZSText typo={typo}>{typo}</ZSText>
              </View>
            );
          })}
        </Section>

        <Section label="Color Prop" direction="row" gap={16}>
          {COLOR_PROPS.map((color) => (
            <ZSText key={color} typo="subTitle.2" color={color}>{color}</ZSText>
          ))}
        </Section>

        <CodeBlock code={`<ZSText typo="${variant}.1" color="primary">\n  ${variant}.1\n</ZSText>`} />
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
  chipRow: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
  },
  specimenRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
    paddingVertical: 12,
  },
  specimenCaption: {
    width: 44,
    flexShrink: 0,
  },
});
