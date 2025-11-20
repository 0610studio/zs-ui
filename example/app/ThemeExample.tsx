import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Theme, ZSContainer, ZSText, ZSView, useTheme } from 'zs-ui';
import TitleCard from '../src/ui/TitleCard';
import { useStyleSheetCreate } from 'zs-ui/model';

export default function ThemeExample() {
  const { palette, elevation } = useTheme();
  const styles = useStyleSheetCreate(createStyles);

  return (
    <ZSContainer style={styles.container}>
      {/* 배경색 예제 */}
      <TitleCard title='Background Colors' gap={5}>
        <ZSView style={styles.box} color='base'><ZSText>Base</ZSText></ZSView>
        <ZSView style={styles.box} color='layer1'><ZSText>Layer1</ZSText></ZSView>
        <ZSView style={styles.box} color='layer2'><ZSText>Layer2</ZSText></ZSView>
        <ZSView style={styles.box} color='neutral'><ZSText>Neutral</ZSText></ZSView>
        <ZSView style={styles.box} color='primary'><ZSText>primary</ZSText></ZSView>
        <ZSView style={styles.box} color='primary.5'><ZSText>primary.5</ZSText></ZSView>
        <ZSView style={styles.box} color='primary.10'><ZSText>primary.10</ZSText></ZSView>
        <ZSView style={styles.box} color='primary.20'><ZSText>primary.20</ZSText></ZSView>
        <ZSView style={styles.box} color='primary.30'><ZSText>primary.30</ZSText></ZSView>
        <ZSView style={styles.box} color='primary.40'><ZSText>primary.40</ZSText></ZSView>
        <ZSView style={styles.box} color='primary.50'><ZSText>primary.50</ZSText></ZSView>
        <ZSView style={styles.box} color='danger'><ZSText>Danger</ZSText></ZSView>
        <ZSView style={styles.box} color='danger.5'><ZSText>Danger.5</ZSText></ZSView>
        <ZSView style={styles.box} color='danger.10'><ZSText>Danger.10</ZSText></ZSView>
        <ZSView style={styles.box} color='danger.20'><ZSText>Danger.20</ZSText></ZSView>
        <ZSView style={styles.box} color='danger.30'><ZSText>Danger.30</ZSText></ZSView>
        <ZSView style={styles.box} color='danger.40'><ZSText>Danger.40</ZSText></ZSView>
        <ZSView style={styles.box} color='danger.50'><ZSText>Danger.50</ZSText></ZSView>
        <ZSView style={styles.box} color='warning'><ZSText>Warning</ZSText></ZSView>
        <ZSView style={styles.box} color='warning.5'><ZSText>Warning.5</ZSText></ZSView>
        <ZSView style={styles.box} color='warning.10'><ZSText>Warning.10</ZSText></ZSView>
        <ZSView style={styles.box} color='warning.20'><ZSText>Warning.20</ZSText></ZSView>
        <ZSView style={styles.box} color='warning.30'><ZSText>Warning.30</ZSText></ZSView>
        <ZSView style={styles.box} color='warning.40'><ZSText>Warning.40</ZSText></ZSView>
        <ZSView style={styles.box} color='warning.50'><ZSText>Warning.50</ZSText></ZSView>
        <ZSView style={styles.box} color='success'><ZSText>Success</ZSText></ZSView>
        <ZSView style={styles.box} color='success.5'><ZSText>Success.5</ZSText></ZSView>
        <ZSView style={styles.box} color='success.10'><ZSText>Success.10</ZSText></ZSView>
        <ZSView style={styles.box} color='success.20'><ZSText>Success.20</ZSText></ZSView>
        <ZSView style={styles.box} color='success.30'><ZSText>Success.30</ZSText></ZSView>
        <ZSView style={styles.box} color='success.40'><ZSText>Success.40</ZSText></ZSView>
        <ZSView style={styles.box} color='success.50'><ZSText>Success.50</ZSText></ZSView>
        <ZSView style={styles.box} color='information'><ZSText>Information</ZSText></ZSView>
        <ZSView style={styles.box} color='information.5'><ZSText>Information.5</ZSText></ZSView>
        <ZSView style={styles.box} color='information.10'><ZSText>Information.10</ZSText></ZSView>
        <ZSView style={styles.box} color='information.20'><ZSText>Information.20</ZSText></ZSView>
        <ZSView style={styles.box} color='information.30'><ZSText>Information.30</ZSText></ZSView>
        <ZSView style={styles.box} color='information.40'><ZSText>Information.40</ZSText></ZSView>
        <ZSView style={styles.box} color='information.50'><ZSText>Information.50</ZSText></ZSView>
        <ZSView style={styles.box} color='grey.5'><ZSText>Grey.5</ZSText></ZSView>
        <ZSView style={styles.box} color='grey.10'><ZSText>Grey.10</ZSText></ZSView>
        <ZSView style={styles.box} color='grey.20'><ZSText>Grey.20</ZSText></ZSView>
        <ZSView style={styles.box} color='grey.30'><ZSText>Grey.30</ZSText></ZSView>
        <ZSView style={styles.box} color='grey.40'><ZSText>Grey.40</ZSText></ZSView>
        <ZSView style={styles.box} color='grey.50'><ZSText>Grey.50</ZSText></ZSView>
      </TitleCard>

      {/* 텍스트 색상 예제 */}
      <TitleCard title='Text Colors'>
        <ZSText color='base'>base</ZSText>
        <ZSText color='secondary'>Secondary</ZSText>
        <ZSText color='disabled'>Disabled</ZSText>
        <ZSText color='white' style={{ backgroundColor: 'black' }}>White</ZSText>
        <ZSText color='black'>Black</ZSText>
        <ZSText color='primary'>Primary</ZSText>
        <ZSText color='primary.5'>Primary.5</ZSText>
        <ZSText color='primary.10'>Primary.10</ZSText>
        <ZSText color='primary.20'>Primary.20</ZSText>
        <ZSText color='primary.30'>Primary.30</ZSText>
        <ZSText color='primary.40'>Primary.40</ZSText>
        <ZSText color='primary.50'>Primary.50</ZSText>
        <ZSText color='danger'>Danger</ZSText>
        <ZSText color='danger.5'>Danger.5</ZSText>
        <ZSText color='danger.10'>Danger.10</ZSText>
        <ZSText color='danger.20'>Danger.20</ZSText>
        <ZSText color='danger.30'>Danger.30</ZSText>
        <ZSText color='danger.40'>Danger.40</ZSText>
        <ZSText color='danger.50'>Danger.50</ZSText>
        <ZSText color='warning'>Warning</ZSText>
        <ZSText color='warning.5'>Warning.5</ZSText>
        <ZSText color='warning.10'>Warning.10</ZSText>
        <ZSText color='warning.20'>Warning.20</ZSText>
        <ZSText color='warning.30'>Warning.30</ZSText>
        <ZSText color='warning.40'>Warning.40</ZSText>
        <ZSText color='warning.50'>Warning.50</ZSText>
        <ZSText color='success'>Success</ZSText>
        <ZSText color='success.5'>Success.5</ZSText>
        <ZSText color='success.10'>Success.10</ZSText>
        <ZSText color='success.20'>Success.20</ZSText>
        <ZSText color='success.30'>Success.30</ZSText>
        <ZSText color='success.40'>Success.40</ZSText>
        <ZSText color='success.50'>Success.50</ZSText>
        <ZSText color='information'>Information</ZSText>
        <ZSText color='information.5'>Information.5</ZSText>
        <ZSText color='information.10'>Information.10</ZSText>
        <ZSText color='information.20'>Information.20</ZSText>
        <ZSText color='information.30'>Information.30</ZSText>
        <ZSText color='information.40'>Information.40</ZSText>
        <ZSText color='information.50'>Information.50</ZSText>
      </TitleCard>

      <TitleCard title='Custom Color Palette (ThemeFactory 적용됨)'>
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

      <TitleCard title='커스텀 색상 확인'>
        <ZSText typo="body.2" color="base">
          현재 적용된 커스텀 색상:
        </ZSText>
        <ZSText typo="body.3" color="primary">
          Primary: {palette.primary.main} (기본값: #FF9F06)
        </ZSText>
        <ZSText typo="body.3" color="secondary">
          Secondary: {palette.secondary.main} (기본값: #007FFF)
        </ZSText>
        <ZSText typo="body.3" color="success">
          Success: {palette.success.main} (기본값: #008A1E)
        </ZSText>
        <ZSText typo="body.3" color="danger">
          Danger: {palette.danger.main} (기본값: #EB003B)
        </ZSText>
      </TitleCard>

      <TitleCard title='elevation'>
        <ZSView style={styles.elevationBox} elevationLevel={2}></ZSView>
        <ZSView style={styles.elevationBox} elevationLevel={3}></ZSView>
        <ZSView style={styles.elevationBox} elevationLevel={4}></ZSView>
        <ZSView style={styles.elevationBox} elevationLevel={5}></ZSView>
        <ZSView style={styles.elevationBox} elevationLevel={6}></ZSView>
        <ZSView style={styles.elevationBox} elevationLevel={7}></ZSView>
        <ZSView style={styles.elevationBox} elevationLevel={8}></ZSView>
        <ZSView style={styles.elevationBox} elevationLevel={9}></ZSView>

        {/* palette 사용시 */}
        <View style={[styles.elevationBox, { ...elevation[8] }]} />
        <View style={[styles.elevationBox, { ...elevation[9] }]} />
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
  },
  box: {
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
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
