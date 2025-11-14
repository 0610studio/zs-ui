import React from 'react';
import { StyleSheet } from 'react-native';
import { ZSText, ZSContainer } from 'zs-ui';
import TitleCard from '../src/ui/TitleCard';
import type { Theme } from 'zs-ui';
import { useStyleSheetCreate } from 'zs-ui/model';

function ZSTextExample(): React.JSX.Element {
  const styles = useStyleSheetCreate(createStyles);

  return (
    <ZSContainer edges={['bottom']} style={styles.container}>
      <TitleCard title='heading' flexDirection='column'>
        <ZSText typo="heading.1">heading.1</ZSText>
        <ZSText typo="heading.2">heading.2</ZSText>
        <ZSText typo="heading.3">heading.3</ZSText>
        <ZSText typo="heading.4">heading.4</ZSText>
        <ZSText typo="heading.5">heading.5</ZSText>
        <ZSText typo="heading.6">heading.6</ZSText>
      </TitleCard>
      <TitleCard title='subTitle' flexDirection='column'>
        <ZSText typo="subTitle.1">subTitle.1</ZSText>
        <ZSText typo="subTitle.2">subTitle.2</ZSText>
        <ZSText typo="subTitle.3">subTitle.3</ZSText>
        <ZSText typo="subTitle.4">subTitle.4</ZSText>
        <ZSText typo="subTitle.5">subTitle.5</ZSText>
        <ZSText typo="subTitle.6">subTitle.6</ZSText>
      </TitleCard>
      <TitleCard title='body' flexDirection='column'>
        <ZSText typo="body.1">body.1</ZSText>
        <ZSText typo="body.2">body.2</ZSText>
        <ZSText typo="body.3">body.3</ZSText>
        <ZSText typo="body.4">body.4</ZSText>
        <ZSText typo="body.5">body.5</ZSText>
        <ZSText typo="body.6">body.6</ZSText>
      </TitleCard>
      <TitleCard title='label' flexDirection='column'>
        <ZSText typo="label.1">label.1</ZSText>
        <ZSText typo="label.2">label.2</ZSText>
        <ZSText typo="label.3">label.3</ZSText>
        <ZSText typo="label.4">label.4</ZSText>
        <ZSText typo="label.5">label.5</ZSText>
        <ZSText typo="label.6">label.6</ZSText>
      </TitleCard>
      <TitleCard title='caption' flexDirection='column'>
        <ZSText typo="caption.1">caption.1</ZSText>
        <ZSText typo="caption.2">caption.2</ZSText>
        <ZSText typo="caption.3">caption.3</ZSText>
        <ZSText typo="caption.4">caption.4</ZSText>
        <ZSText typo="caption.5">caption.5</ZSText>
        <ZSText typo="caption.6">caption.6</ZSText>
      </TitleCard>
      <TitleCard title='color' flexDirection='column'>
        <ZSText typo="body.1" color="primary">primary</ZSText>
        <ZSText typo="body.1" color="secondary">secondary</ZSText>
        <ZSText typo="body.1" color="disabled">disabled</ZSText>
        <ZSText typo="body.1" color="danger">danger</ZSText>
        <ZSText typo="body.1" color="warning">warning</ZSText>
        <ZSText typo="body.1" color="success">success</ZSText>
        <ZSText typo="body.1" color="information">information</ZSText>
        <ZSText typo="body.1" color="white">white</ZSText>
        <ZSText typo="body.1" color="black">black</ZSText>
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

export default ZSTextExample;
