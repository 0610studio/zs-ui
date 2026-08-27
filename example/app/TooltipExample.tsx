import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { ZSBlockButton, ZSContainer, ZSText, ZSTooltip, useTheme } from '@0610studio/zs-ui';
import Section from '../src/ui/kit/Section';
import CodeBlock from '../src/ui/kit/CodeBlock';

export default function TooltipExample() {
  const { palette } = useTheme();
  const [guideVisible, setGuideVisible] = useState(true);

  return (
    <>
      <Stack.Screen options={{ title: 'ZSTooltip' }} />
      <ZSContainer style={[styles.container, { backgroundColor: palette.background.layer2 }]}>
        <Section label="기본" gap={14}>
          <ZSTooltip message="위에 뜨는 툴팁 (placement: top)" />
          <ZSTooltip message="아래에 뜨는 툴팁 (placement: bottom)" placement="bottom" />
        </Section>

        <Section label="닫기 버튼 · 플로팅" gap={14}>
          {guideVisible ? (
            <ZSTooltip
              message="길게 눌러 순서를 바꿔보세요"
              showClose
              floating
              onClose={() => setGuideVisible(false)}
            />
          ) : (
            <ZSBlockButton
              title="툴팁 다시 보기"
              typo="label.3"
              variant="pastel"
              onPress={() => setGuideVisible(true)}
            />
          )}
        </Section>

        <Section label="꼬리 정렬" gap={14}>
          <ZSTooltip message="tailAlign: start (기본)" style={styles.fullWidth} />
          <ZSTooltip message="tailAlign: center" tailAlign="center" style={styles.fullWidth} />
          <ZSTooltip message="tailAlign: end" tailAlign="end" style={styles.fullWidth} />
        </Section>

        <Section label="커스텀" gap={14}>
          <ZSTooltip
            message="배경·텍스트 색상 커스텀"
            backgroundColor={palette.primary[50]}
            textColor="#ffffff"
          />
          <ZSTooltip tailAlign="center">
            <View style={styles.customContent}>
              <ZSText typo="subTitle.4" style={{ color: palette.background.base }}>커스텀 콘텐츠</ZSText>
              <ZSText typo="caption.2" style={{ color: palette.grey[40] }}>children 으로 자유 구성</ZSText>
            </View>
          </ZSTooltip>
        </Section>

        <CodeBlock
          code={`<ZSTooltip
  message="길게 눌러 순서를 바꿔보세요"
  placement="top"
  showClose
  floating
  onClose={() => ...}
/>`}
        />
      </ZSContainer>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
    paddingTop: 24,
    paddingBottom: 90,
    paddingHorizontal: 20,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  customContent: {
    gap: 2,
    paddingVertical: 4,
  },
});
