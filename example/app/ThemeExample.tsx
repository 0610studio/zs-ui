import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Palette, ZSContainer, useTheme } from 'zs-ui';
import TitleCard from '../src/ui/TitleCard';

export default function ThemeExample() {
  const { palette, elevation } = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);

  return (
    <ZSContainer style={styles.container} edges={['bottom']}>
      {/* 배경색 예제 */}
      <TitleCard title='Background Colors'>
        <View style={styles.layer1Box}>
          <Text style={styles.textPrimary}>Background Layer1</Text>
        </View>
        <View style={styles.layer2Box}>
          <Text style={styles.textPrimary}>Background Layer2</Text>
        </View>
        <View style={styles.neutralBox}>
          <Text style={styles.textPrimary}>Background Neutral</Text>
        </View>
        <View style={styles.baseBox}>
          <Text style={styles.textPrimary}>Background Base</Text>
        </View>
        <View style={styles.dangerBox}>
          <Text style={styles.textPrimary}>Background Danger</Text>
        </View>
        <View style={styles.warningBox}>
          <Text style={styles.textPrimary}>Background Warning</Text>
        </View>
        <View style={styles.successBox}>
          <Text style={styles.textPrimary}>Background Success</Text>
        </View>
        <View style={styles.informationBox}>
          <Text style={styles.textPrimary}>Background Information</Text>
        </View>
      </TitleCard>

      {/* 텍스트 색상 예제 */}
      <TitleCard title='Text Colors'>
        <Text style={styles.textPrimary}>Text Primary Color</Text>
        <Text style={styles.textSecondary}>Text Secondary Color</Text>
        <Text style={styles.textDanger}>Text Danger Color</Text>
        <Text style={styles.textWarning}>Text Warning Color</Text>
        <Text style={styles.textSuccess}>Text Success Color</Text>
        <Text style={styles.textInformation}>Text Information Color</Text>
      </TitleCard>

      {/* Primary, Secondary, Danger, Warning, Success, Information 컬러 격자 */}
      <TitleCard title='Color Palette'>
        {/* Primary 컬러 */}
        <View style={[styles.colorBox, { backgroundColor: palette.primary.lighter }]}>
          <Text style={styles.textWhite}>Primary Lighter</Text>
        </View>
        <View style={[styles.colorBox, { backgroundColor: palette.primary.light }]}>
          <Text style={styles.textWhite}>Primary Light</Text>
        </View>
        <View style={[styles.colorBox, { backgroundColor: palette.primary.main }]}>
          <Text style={styles.textWhite}>Primary Main</Text>
        </View>
        <View style={[styles.colorBox, { backgroundColor: palette.primary.dark }]}>
          <Text style={styles.textWhite}>Primary Dark</Text>
        </View>
        <View style={[styles.colorBox, { backgroundColor: palette.primary.darker }]}>
          <Text style={styles.textWhite}>Primary Darker</Text>
        </View>
        <View style={[styles.colorBox, { backgroundColor: palette.secondary.main }]}>
          <Text style={styles.textWhite}>Secondary Main</Text>
        </View>
        <View style={[styles.colorBox, { backgroundColor: palette.danger.main }]}>
          <Text style={styles.textWhite}>Danger Main</Text>
        </View>
        <View style={[styles.colorBox, { backgroundColor: palette.warning.main }]}>
          <Text style={styles.textWhite}>Warning Main</Text>
        </View>
        <View style={[styles.colorBox, { backgroundColor: palette.success.main }]}>
          <Text style={styles.textWhite}>Success Main</Text>
        </View>
        <View style={[styles.colorBox, { backgroundColor: palette.information.main }]}>
          <Text style={styles.textWhite}>Information Main</Text>
        </View>
      </TitleCard>

      <TitleCard title='elevation'>
        <View style={[styles.elevationBox, { ...elevation[1] }]} />
        <View style={[styles.elevationBox, { ...elevation[2] }]} />
        <View style={[styles.elevationBox, { ...elevation[3] }]} />
        <View style={[styles.elevationBox, { ...elevation[4] }]} />
        <View style={[styles.elevationBox, { ...elevation[5] }]} />
        <View style={[styles.elevationBox, { ...elevation[6] }]} />
        <View style={[styles.elevationBox, { ...elevation[7] }]} />
        <View style={[styles.elevationBox, { ...elevation[8] }]} />
        <View style={[styles.elevationBox, { ...elevation[9] }]} />
      </TitleCard>
    </ZSContainer>
  );
}

export const createStyles = (palette: Palette) => StyleSheet.create({
  container: {
    gap: 30,
    paddingTop: 40,
    backgroundColor: palette.background.layer2,
    paddingHorizontal: 15,
  },
  layer1Box: {
    backgroundColor: palette.background.layer1,
    padding: 10,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  layer2Box: {
    backgroundColor: palette.background.layer2,
    padding: 10,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  neutralBox: {
    backgroundColor: palette.background.neutral,
    padding: 10,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  baseBox: {
    backgroundColor: palette.background.base,
    padding: 10,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  dangerBox: {
    backgroundColor: palette.background.danger,
    padding: 10,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  warningBox: {
    backgroundColor: palette.background.warning,
    padding: 10,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  successBox: {
    backgroundColor: palette.background.success,
    padding: 10,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  informationBox: {
    backgroundColor: palette.background.information,
    padding: 10,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  textPrimary: {
    color: palette.text.primary,
    fontSize: 16,
  },
  textSecondary: {
    color: palette.text.secondary,
    fontSize: 16,
  },
  textDanger: {
    color: palette.text.danger,
    fontSize: 16,
  },
  textWarning: {
    color: palette.text.warning,
    fontSize: 16,
  },
  textSuccess: {
    color: palette.text.success,
    fontSize: 16,
  },
  textInformation: {
    color: palette.text.information,
    fontSize: 16,
  },
  textWhite: {
    color: '#FFFFFF',
    fontSize: 16,
    paddingHorizontal: 10,
  },
  colorBox: {
    width: '30%',
    alignItems: 'center',
    minHeight: 90,
    justifyContent: 'center',
  },
  elevationBox: {
    width: '100%',
    alignItems: 'center',
    height: 30,
    justifyContent: 'center',
    backgroundColor: palette.background.base,
    marginVertical: 10
  },
});
