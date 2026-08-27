import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { ZSContainer, ZSSkeleton, ZSSkeletonBox, ZSSwitch, ZSText, useTheme } from '@0610studio/zs-ui';
import Section from '../src/ui/kit/Section';
import CodeBlock from '../src/ui/kit/CodeBlock';

export default function ZSSkeletonExample() {
  const [isFetching, setIsFetching] = useState(true);
  const { palette } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'ZSSkeleton' }} />
      <ZSContainer style={[styles.container, { backgroundColor: palette.background.layer2 }]}>
        <Section gap={0}>
          <View style={styles.toggleRow}>
            <View style={{ gap: 2 }}>
              <ZSText typo="subTitle.2">isFetching</ZSText>
              <ZSText typo="caption.1" color="secondary">끄면 실제 콘텐츠가 표시됩니다</ZSText>
            </View>
            <ZSSwitch isActive={isFetching} onToggle={() => setIsFetching(!isFetching)} />
          </View>
        </Section>

        <Section label="Text Skeleton" gap={12}>
          <ZSSkeleton isFetching={isFetching}>
            <ZSText typo="heading.1" color='danger.100'>fetching DATA</ZSText>
          </ZSSkeleton>
          <ZSSkeleton isFetching={isFetching}>
            <ZSText typo="heading.3" color='primary'>fetching DATA</ZSText>
          </ZSSkeleton>
          <ZSSkeleton isFetching={isFetching}>
            <ZSText typo="heading.6">fetching DATA</ZSText>
          </ZSSkeleton>
        </Section>

        <Section label="Box Skeleton" gap={12}>
          <ZSSkeletonBox height={100} style={{ borderRadius: 10 }} />
          <ZSSkeletonBox height={50} style={{ borderRadius: 25 }} />
          <ZSSkeletonBox height={80} style={{ borderRadius: 40, width: 80 }} />
        </Section>

        <CodeBlock
          code={`<ZSSkeleton isFetching={isFetching}>
  <ZSText typo="heading.1">fetching DATA</ZSText>
</ZSSkeleton>

<ZSSkeletonBox height={100} style={{ borderRadius: 10 }} />`}
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
});
