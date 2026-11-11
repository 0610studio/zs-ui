import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ZSText } from '@0610studio/zs-ui';
import { useFpsProbe } from '../model/useFpsProbe';

export default function FpsProbe({ maxFontSizeMultiplier }: { maxFontSizeMultiplier?: number }) {
  const { sample, reset } = useFpsProbe(true);
  const uiMin = sample.uiMin || sample.ui;
  const jsMin = sample.jsMin || sample.js;

  return (
    <View style={styles.row}>
      <ZSText variant="overline" color="textSecondary" maxFontSizeMultiplier={maxFontSizeMultiplier} testID="fps-probe" style={styles.sample}>
        {`UI ${sample.ui} (min ${uiMin}) / JS ${sample.js} (min ${jsMin})`}
      </ZSText>
      <Pressable onPress={reset} hitSlop={8} testID="fps-reset" accessibilityRole="button" accessibilityLabel="fps reset">
        <ZSText variant="overline" color="textSecondary" maxFontSizeMultiplier={maxFontSizeMultiplier}>reset</ZSText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingHorizontal: 4 },
  sample: { flexShrink: 1 },
});
