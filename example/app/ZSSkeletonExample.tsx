import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { ZSScreen, ZSSkeleton, ZSSwitch, ZSText } from '@0610studio/zs-ui';
import Section from '../src/ui/kit/Section';
import { PAGE_CONTENT } from '../src/ui/kit/layout';
import ScreenHeader from '../src/ui/ScreenHeader';

export default function ZSSkeletonExample() {
  const [isFetching, setIsFetching] = useState(true);

  return (
    <>
      <ScreenHeader title="ZSSkeleton" />
      <ZSScreen backgroundColor="background" style={styles.container}>
        <Section surface="list">
          <ZSSwitch label="loading — 끄면 실제 콘텐츠" value={isFetching} onValueChange={setIsFetching} />
        </Section>

        <Section label="글자 · ZSSkeleton" surface="plain" gap={12}>
          <ZSSkeleton loading={isFetching}>
            <ZSText variant="h1" emphasized>fetching DATA</ZSText>
          </ZSSkeleton>
          <ZSSkeleton loading={isFetching}>
            <ZSText variant="h2" emphasized color="textSecondary">fetching DATA</ZSText>
          </ZSSkeleton>
          <ZSSkeleton loading={isFetching}>
            <ZSText variant="h4" emphasized>fetching DATA</ZSText>
          </ZSSkeleton>
        </Section>

        <Section label="상자 · ZSSkeleton.Box" surface="plain" gap={12}>
          <ZSSkeleton.Box height={100} radius="md" />
          <ZSSkeleton.Box height={50} radius="full" />
          <ZSSkeleton.Box height={80} radius="full" style={{ width: 80 }} />
        </Section>
      </ZSScreen>
    </>
  );
}

const styles = StyleSheet.create({
  container: PAGE_CONTENT,
});
