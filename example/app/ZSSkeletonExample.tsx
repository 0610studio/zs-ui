import React from 'react';
import { StyleSheet } from 'react-native';
import { ZSText, ZSContainer, ZSSkeleton, ZSSkeletonBox } from 'zs-ui';
import TitleCard from '../src/ui/TitleCard';
import type { Theme } from 'zs-ui';
import { useStyleSheetCreate } from 'zs-ui';

function ZSSkeletonExample(): React.JSX.Element {
  const styles = useStyleSheetCreate(createStyles);

  return (
    <ZSContainer style={styles.container}>
      <TitleCard title='Text Skeleton' flexDirection='column'>
        <ZSSkeleton isFetching={true}>
          <ZSText typo="heading.1">fetching DATA</ZSText>
        </ZSSkeleton>
        <ZSSkeleton isFetching={true}>
          <ZSText typo="heading.3">fetching DATA</ZSText>
        </ZSSkeleton>
        <ZSSkeleton isFetching={true}>
          <ZSText typo="heading.6">fetching DATA</ZSText>
        </ZSSkeleton>
      </TitleCard>
      <TitleCard title='Box Skeleton' flexDirection='column'>
        <ZSSkeletonBox height={100} style={{ borderRadius: 10 }} />
        <ZSSkeletonBox height={50} style={{ borderRadius: 25 }} />
        <ZSSkeletonBox height={80} style={{ borderRadius: 40, width: 80 }} />
      </TitleCard>
    </ZSContainer>
  );
}

const createStyles = (palette: Theme) => StyleSheet.create({
  container: {
    gap: 30,
    paddingTop: 40,
    backgroundColor: palette.background.layer2,
    paddingHorizontal: 15,
    paddingBottom: 90,
  },
});

export default ZSSkeletonExample;
