import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThrottleButton, ZSText, ZSContainer, ZSPressable, ZSSwitch, useTheme } from 'zs-ui';
import TitleCard from '../src/ui/TitleCard';
import type { Theme } from 'zs-ui';
import { useStyleSheetCreate } from 'zs-ui';

function ButtonExample(): React.JSX.Element {
  const { palette } = useTheme();
  const styles = useStyleSheetCreate(createStyles);
  const [switch1Active, setSwitch1Active] = useState(false);
  const [switch2Active, setSwitch2Active] = useState(true);
  const [switch3Active, setSwitch3Active] = useState(false);

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
          }, [handleSubmit])}
          primaryLabelComponent={
            <ZSText typo="body.1" style={{ color: 'black' }}>
              ThrottleButton
            </ZSText>
          }
        />
      </TitleCard>

      {/* ZSSwitch */}
      <TitleCard title='ZSSwitch' flexDirection='column'>
        <View style={styles.switchContainer}>
          <ZSText typo="body.1">커스텀 색상</ZSText>
          <ZSSwitch
            isActive={switch1Active}
            onToggle={() => setSwitch1Active(!switch1Active)}
            trackColorInactive="#ffcccc"
            trackColorActive="#ff6b6b"
            thumbColor="#ffffff"
          />
        </View>
        <View style={styles.switchContainer}>
          <ZSText typo="body.1">크기 100</ZSText>
          <ZSSwitch
            isActive={switch2Active}
            onToggle={() => setSwitch2Active(!switch2Active)}
            width={100}
          />
        </View>
        <View style={styles.switchContainer}>
          <ZSText typo="body.1">크기 10</ZSText>
          <ZSSwitch
            isActive={switch3Active}
            onToggle={() => setSwitch3Active(!switch3Active)}
            width={30}
          />
        </View>
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
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
});

export default ButtonExample;
