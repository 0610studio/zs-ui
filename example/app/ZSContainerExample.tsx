import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { ZSAboveKeyboard, ZSContainer, ZSText, useTheme } from 'zs-ui';
import CtaButton from '../src/ui/CtaButton';
import { TextFieldExample } from '../src/ui/TextFieldExample';
import CodeBlock from '../src/ui/kit/CodeBlock';

export default function ZSContainerExample() {
  const [ctaLayoutHeight, setCtaLayoutHeight] = useState(0);
  const { palette } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'ZSContainer' }} />
      <ZSContainer
        keyboardScrollExtraOffset={190}
        style={[styles.container, { paddingBottom: 30 + ctaLayoutHeight }]}
        foldableSingleScreen
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
        <View style={[styles.banner, { backgroundColor: palette.information[5], borderColor: palette.information[20] }]}>
          <ZSText typo="subTitle.3" color="information">키보드 대응 스크롤 데모</ZSText>
          <ZSText typo="caption.1" color="secondary">
            입력 필드를 탭하면 키보드 위로 CTA 버튼이 따라 올라오고, 포커스 필드가 가려지지 않게 스크롤됩니다.
          </ZSText>
        </View>

        <TextFieldExample title="foldableSingleScreen" />

        <CodeBlock
          code={`<ZSContainer
  keyboardScrollExtraOffset={190}
  foldableSingleScreen
  bottomComponent={
    <ZSAboveKeyboard handleLayoutHeight={setCtaHeight}>
      <CtaButton ... />
    </ZSAboveKeyboard>
  }
>
  {children}
</ZSContainer>`}
        />
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
