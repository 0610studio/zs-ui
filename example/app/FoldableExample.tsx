import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { ZSAboveKeyboard, ZSContainer, ZSText, useTheme } from 'zs-ui';
import CtaButton from '../src/ui/CtaButton';
import { TextFieldExample } from '../src/ui/TextFieldExample';

export default function FoldableExample() {
  const [ctaLayoutHeight, setCtaLayoutHeight] = useState(0);
  const { palette } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: '폴더블 레이아웃' }} />
      <ZSContainer
        keyboardScrollExtraOffset={190}
        style={[styles.container, { paddingBottom: 30 + ctaLayoutHeight }]}
        rightComponent={<TextFieldExample title="right" />}
        bottomComponent={
          <ZSAboveKeyboard handleLayoutHeight={setCtaLayoutHeight}>
            <CtaButton
              disabled={false}
              primaryButtonText="CTA 버튼"
              onPrimaryButtonPress={() => console.log('CTA 버튼 클릭')}
              secondaryButtonText="취소"
              onSecondaryButtonPress={() => {}}
            />
          </ZSAboveKeyboard>
        }
      >
        {/* 데모 안내 배너 */}
        <View style={[styles.banner, { backgroundColor: palette.secondary[5], borderColor: palette.secondary[20] }]}>
          <ZSText typo="subTitle.3" style={{ color: palette.secondary[60] }}>2-pane 폴더블 데모</ZSText>
          <ZSText typo="caption.1" color="secondary">
            폴더블 기기를 펼치면 rightComponent 가 우측 pane 으로 분리 렌더링됩니다.
          </ZSText>
        </View>

        <TextFieldExample title="left" />
      </ZSContainer>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 24,
  },
  banner: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 4,
  },
});
