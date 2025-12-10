import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ZSText, ZSContainer, ZSPressable, ZSSwitch, useTheme, ZSBlockButton } from 'zs-ui';
import TitleCard from '../src/ui/TitleCard';
import type { Theme } from 'zs-ui';
import { useStyleSheetCreate } from 'zs-ui';

function ButtonExample(): React.JSX.Element {
  const { palette } = useTheme();
  const styles = useStyleSheetCreate(createStyles);
  const [switch1Active, setSwitch1Active] = useState(false);
  const [switch2Active, setSwitch2Active] = useState(true);
  const [switch3Active, setSwitch3Active] = useState(false);

  const handleSubmit = useCallback(async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('완료');
      }, 500);
    });
  }, []);

  return (
    <ZSContainer
      keyboardScrollExtraOffset={130}
      style={styles.container}
    >
      <TitleCard title='ZSPressable' flexDirection='column'>
        <ZSPressable
          style={[styles.buttonStyle, { backgroundColor: palette.primary[50] }]}
          fullWidth
          onPress={useCallback(() => { console.log('Primary FullWidth'); }, [])}
        >
          <ZSText typo="subTitle.1" color='white'>Primary FullWidth 버튼</ZSText>
        </ZSPressable>
        <ZSPressable
          style={[styles.buttonStyle, { backgroundColor: palette.danger[50] }]}
          fullWidth
          onPress={useCallback(() => { console.log('Danger FullWidth'); }, [])}
        >
          <ZSText typo="body.1" color='white'>Danger FullWidth 버튼</ZSText>
        </ZSPressable>
        <ZSPressable
          style={[styles.buttonStyle, { backgroundColor: palette.primary[50] }]}
          fullWidth
          isLoading={true}
          onPress={useCallback(() => { console.log('Primary FullWidth'); }, [])}
        >
          <ZSText typo="subTitle.1" color='white'>Primary FullWidth (Loading)</ZSText>
        </ZSPressable>
      </TitleCard>

      <TitleCard title='BlockButton' flexDirection='column'>
        <View style={styles.buttonGroup}>
          <ZSText typo="body.1" style={styles.sectionTitle}>Primary</ZSText>
          <View style={styles.buttonRow}>
            <ZSBlockButton
              onPress={() => { console.log('Primary Solid'); }}
              title='Solid'
              intent='primary'
              variant='solid'
              typo='label.1'
            />
            <ZSBlockButton
              onPress={() => { console.log('Primary Pastel'); }}
              title='Pastel'
              intent='primary'
              variant='pastel'
              typo='label.1'
            />
            <ZSBlockButton
              onPress={() => { console.log('Primary Stroke'); }}
              title='Stroke'
              intent='primary'
              variant='stroke'
              typo='label.1'
            />
          </View>
        </View>

        <View style={styles.buttonGroup}>
          <ZSText typo="body.1" style={styles.sectionTitle}>Danger</ZSText>
          <View style={styles.buttonRow}>
            <ZSBlockButton
              onPress={() => { console.log('Danger Solid'); }}
              title='Solid'
              intent='danger'
              variant='solid'
              typo='subTitle.1'
            />
            <ZSBlockButton
              onPress={() => { console.log('Danger Pastel'); }}
              title='Pastel'
              intent='danger'
              variant='pastel'
              typo='subTitle.1'
            />
            <ZSBlockButton
              onPress={() => { console.log('Danger Stroke'); }}
              title='Stroke'
              intent='danger'
              variant='stroke'
              typo='subTitle.1'
            />
          </View>
        </View>

        <View style={styles.buttonGroup}>
          <ZSText typo="body.1" style={styles.sectionTitle}>Information</ZSText>
          <View style={styles.buttonRow}>
            <ZSBlockButton
              onPress={() => { console.log('Information Solid'); }}
              title='Solid'
              intent='information'
              variant='solid'
              typo='subTitle.1'
            />
            <ZSBlockButton
              onPress={() => { console.log('Information Pastel'); }}
              title='Pastel'
              intent='information'
              variant='pastel'
              typo='subTitle.1'
            />
            <ZSBlockButton
              onPress={() => { console.log('Information Stroke'); }}
              title='Stroke'
              intent='information'
              variant='stroke'
              typo='subTitle.1'
            />
          </View>
        </View>

        <View style={styles.buttonGroup}>
          <ZSText typo="body.1" style={styles.sectionTitle}>Success</ZSText>
          <View style={styles.buttonRow}>
            <ZSBlockButton
              onPress={() => { console.log('Success Solid'); }}
              title='Solid'
              intent='success'
              variant='solid'
              typo='subTitle.1'
            />
            <ZSBlockButton
              onPress={() => { console.log('Success Pastel'); }}
              title='Pastel'
              intent='success'
              variant='pastel'
              typo='subTitle.1'
            />
            <ZSBlockButton
              onPress={() => { console.log('Success Stroke'); }}
              title='Stroke'
              intent='success'
              variant='stroke'
              typo='subTitle.1'
            />
          </View>
        </View>

        <View style={styles.buttonGroup}>
          <ZSText typo="body.1" style={styles.sectionTitle}>Warning</ZSText>
          <View style={styles.buttonRow}>
            <ZSBlockButton
              onPress={() => { console.log('Warning Solid'); }}
              title='Solid'
              intent='warning'
              variant='solid'
              typo='subTitle.1'
            />
            <ZSBlockButton
              onPress={() => { console.log('Warning Pastel'); }}
              title='Pastel'
              intent='warning'
              variant='pastel'
              typo='subTitle.1'
            />
            <ZSBlockButton
              onPress={() => { console.log('Warning Stroke'); }}
              title='Stroke'
              intent='warning'
              variant='stroke'
              typo='subTitle.1'
            />
          </View>
        </View>

        <View style={styles.buttonGroup}>
          <ZSText typo="body.1" style={styles.sectionTitle}>Grey</ZSText>
          <View style={styles.buttonRow}>
            <ZSBlockButton
              onPress={() => { console.log('Grey Solid'); }}
              title='Solid'
              intent='grey'
              variant='solid'
              typo='subTitle.1'
            />
            <ZSBlockButton
              onPress={() => { console.log('Grey Pastel'); }}
              title='Pastel'
              intent='grey'
              variant='pastel'
              typo='subTitle.1'
            />
            <ZSBlockButton
              onPress={() => { console.log('Grey Stroke'); }}
              title='Stroke'
              intent='grey'
              variant='stroke'
              typo='subTitle.1'
            />
          </View>
        </View>
      </TitleCard>

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
  buttonGroup: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 8,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
});

export default ButtonExample;
