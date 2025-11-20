import React, { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { ThrottleButton, ZSText, ZSContainer, ZSPressable, useTheme } from 'zs-ui';
import TitleCard from '../src/ui/TitleCard';
import type { Theme } from 'zs-ui';
import { useStyleSheetCreate } from 'zs-ui/model';

function ButtonExample(): React.JSX.Element {
  const { palette } = useTheme();
  const styles = useStyleSheetCreate(createStyles);

  const handleSubmit = useCallback(
    async () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve('완료');
        }, 500);
      });
    },
    []
  );

  return (
    <ZSContainer
      keyboardScrollExtraOffset={130}
      style={styles.container}
    >
      <TitleCard title='ZSPressable'>
        <ZSPressable
          style={styles.buttonStyle}
          fullWidth
          onPress={useCallback(() => { console.log('ZSPressable onPress'); }, [])}
        >
          <ZSText typo="subTitle.1" color='information.50'>FullWidth 버튼</ZSText>
        </ZSPressable>
        <ZSPressable style={styles.buttonStyle} color='primary'>
          <ZSText typo="subTitle.1">버튼1</ZSText>
        </ZSPressable>
        <ZSPressable style={styles.buttonStyle} color='danger.40'>
          <ZSText typo="heading.3">버튼2</ZSText>
        </ZSPressable>
        <ZSPressable style={styles.buttonStyle} color='neutral'>
          <ZSText typo="heading.1">버튼3</ZSText>
        </ZSPressable>
      </TitleCard>

      {/* ThrottleButton */}
      <TitleCard title='ThrottleButton'>
        <ThrottleButton
          primaryButtonStyle={{
            backgroundColor: palette.primary.main,
            height: 55,
            overflow: 'hidden',
          }}
          primaryOnPress={useCallback(async () => {
            await handleSubmit();
          }, [handleSubmit])} // useCallback과 handleSubmit 메모이제이션 유지
          primaryLabelComponent={
            <ZSText typo="body.1" style={{ color: 'black' }}>
              ThrottleButton
            </ZSText>
          }
        />
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
  buttonStyle: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
});

export default ButtonExample;
