import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ZSButton, ZSScreen, ZSText, ZSTooltip, useTheme, withOpacity } from '@0610studio/zs-ui';
import Section from '../src/ui/kit/Section';
import ScreenHeader from '../src/ui/ScreenHeader';
import { PAGE_CONTENT } from '../src/ui/kit/layout';

export default function TooltipExample() {
  const { colors } = useTheme();
  const [guideVisible, setGuideVisible] = useState(true);

  return (
    <>
      <ScreenHeader title="ZSTooltip" />
      <ZSScreen backgroundColor="background" style={styles.container}>
        <Section label="기본" surface="plain" gap={14}>
          <ZSTooltip message="위에 뜨는 툴팁 (placement: top)" />
          <ZSTooltip message="아래에 뜨는 툴팁 (placement: bottom)" placement="bottom" />
        </Section>

        <Section label="닫기 버튼 · 플로팅" surface="plain" gap={14}>
          {guideVisible ? (
            <ZSTooltip
              message="길게 눌러 순서를 바꿔보세요"
              showClose
              floating
              onClose={() => setGuideVisible(false)}
            />
          ) : (
            <ZSButton
              title="툴팁 다시 보기"
              size="small"
              variant="tonal"
              onPress={() => setGuideVisible(true)}
            />
          )}
        </Section>

        <Section label="화살표 정렬" surface="plain" gap={14}>
          <ZSTooltip message="arrowAlign: start (기본)" style={styles.fullWidth} />
          <ZSTooltip message="arrowAlign: center" arrowAlign="center" style={styles.fullWidth} />
          <ZSTooltip message="arrowAlign: end" arrowAlign="end" style={styles.fullWidth} />
        </Section>

        <Section label="커스텀" surface="plain" gap={14}>
          <ZSTooltip
            message="배경·텍스트 색상 커스텀"
            backgroundColor={colors.primary}
            textColor={colors.onPrimary}
          />
          <ZSTooltip arrowAlign="center">
            <View style={styles.customContent}>
              <ZSText variant="label" emphasized color="textInverse">커스텀 콘텐츠</ZSText>
              <ZSText variant="overline" color={withOpacity(colors.textInverse, 0.75)}>children 으로 자유 구성</ZSText>
            </View>
          </ZSTooltip>
        </Section>
      </ZSScreen>
    </>
  );
}

const styles = StyleSheet.create({
  container: { ...PAGE_CONTENT, paddingBottom: 90 },
  fullWidth: {
    alignSelf: 'stretch',
  },
  customContent: {
    gap: 2,
    paddingVertical: 4,
  },
});
