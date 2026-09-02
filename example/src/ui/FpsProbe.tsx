import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ZSText } from '@0610studio/zs-ui';
import { useFpsProbe } from '../model/useFpsProbe';

/** 자기 상태만 갱신한다 — 부모(데모 화면·달력)를 초마다 리렌더시키면 계측이 오염된다 */
export default function FpsProbe() {
  const { sample, reset } = useFpsProbe(true);
  const uiMin = sample.uiMin || sample.ui;
  const jsMin = sample.jsMin || sample.js;

  return (
    <View style={styles.row}>
      <ZSText typo="caption.2" color="secondary" testID="fps-probe">
        {`UI ${sample.ui} (min ${uiMin}) / JS ${sample.js} (min ${jsMin})`}
      </ZSText>
      <Pressable onPress={reset} hitSlop={8} testID="fps-reset" accessibilityRole="button" accessibilityLabel="fps reset">
        <ZSText typo="caption.2" color="secondary">reset</ZSText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
});
