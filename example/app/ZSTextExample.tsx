import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { TYPE_SCALE, TEXT_VARIANTS, ZSScreen, ZSText } from '@0610studio/zs-ui';
import Section from '../src/ui/kit/Section';
import { PAGE_CONTENT } from '../src/ui/kit/layout';
import Segmented from '../src/ui/kit/Segmented';
import ScreenHeader from '../src/ui/ScreenHeader';

export default function ZSTextExample() {
  const [weight, setWeight] = useState<'regular' | 'emphasized'>('regular');
  const scale = TYPE_SCALE[Platform.OS === 'android' ? 'android' : 'ios'];

  return (
    <>
      <ScreenHeader title="ZSText" />
      <ZSScreen backgroundColor="background" style={styles.container}>
        <Segmented options={['regular', 'emphasized'] as const} value={weight} onValueChange={setWeight} />
        <Section label="글자 스타일 · variant" surface="list">
          {TEXT_VARIANTS.map((variant) => (
            <View key={variant} style={styles.row}>
              <ZSText variant={variant} emphasized={weight === 'emphasized'} numberOfLines={1} style={{ flex: 1 }}>
                {variant}
              </ZSText>
              <ZSText variant="label" color="textSecondary">{`${scale[variant].fontSize}/${scale[variant].lineHeight}`}</ZSText>
            </View>
          ))}
        </Section>
        <ZSText variant="caption" color="textSecondary">
          설정 → 손쉬운 사용 → 더 큰 텍스트를 바꾸면 iOS 는 스타일별 Dynamic Type 비율로, Android 는 비선형 글자 크기(최대 200%)로 커진다.
        </ZSText>
      </ZSScreen>
    </>
  );
}

const styles = StyleSheet.create({
  container: PAGE_CONTENT,
  row: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
});
