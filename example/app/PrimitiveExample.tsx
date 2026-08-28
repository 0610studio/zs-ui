import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import {
  AnimatedWrapper,
  ErrorComponent,
  TextAtom,
  ZSBlockButton,
  ZSContainer,
  ZSPortal,
  ZSText,
  ZSView,
  useTheme,
} from '@0610studio/zs-ui';
import Section from '../src/ui/kit/Section';
import CodeBlock from '../src/ui/kit/CodeBlock';

const ELEVATION_LEVELS: readonly [1, 4, 8] = [1, 4, 8];

export default function PrimitiveExample() {
  const [animationKey, setAnimationKey] = useState(0);
  const [isPortalVisible, setIsPortalVisible] = useState(false);
  const { palette } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: '기본 프리미티브' }} />
      <ZSContainer style={[styles.container, { backgroundColor: palette.background.layer2 }]}>
        <Section label="ZSView · 테마 뷰" gap={12}>
          <View style={styles.cardRow}>
            {ELEVATION_LEVELS.map(elevationLevel => (
              <ZSView
                key={elevationLevel}
                color="base"
                elevationLevel={elevationLevel}
                style={styles.elevationCard}
              >
                <ZSText typo="caption.1">level {elevationLevel}</ZSText>
              </ZSView>
            ))}
          </View>
        </Section>

        <Section label="AnimatedWrapper · 진입 애니메이션" gap={12}>
          <AnimatedWrapper
            key={animationKey}
            isAnimation
            color="primary.10"
            elevationLevel={3}
            style={styles.animatedCard}
          >
            <ZSText typo="subTitle.2" color="primary">FadeInDown</ZSText>
            <ZSText typo="caption.1" color="secondary">테마 배경과 그림자를 함께 적용합니다.</ZSText>
          </AnimatedWrapper>
          <ZSBlockButton
            title="애니메이션 다시 실행"
            intent="primary"
            variant="pastel"
            typo="label.2"
            onPress={() => setAnimationKey(currentKey => currentKey + 1)}
          />
        </Section>

        <Section label="TextAtom · 최소 텍스트" gap={12}>
          <TextAtom style={[styles.rawText, { color: palette.text.base }]}>React Native TextProps만 받는 원시 텍스트</TextAtom>
          <ZSText typo="caption.1" color="secondary">
            앱 UI에는 타이포그래피와 색상 토큰을 제공하는 ZSText를 우선 사용하세요.
          </ZSText>
        </Section>

        <Section label="ErrorComponent · 인라인 오류" gap={12}>
          <ErrorComponent errorMessage="필수 입력 항목입니다." errorColor={palette.danger.main} />
        </Section>

        <Section label="ZSPortal · 최상위 레이어" gap={12}>
          <ZSText typo="caption.1" color="secondary">
            현재 컴포넌트의 레이아웃을 벗어나 OverlayProvider의 최상위 레이어에 렌더링합니다.
          </ZSText>
          <ZSBlockButton
            title="포털 열기"
            intent="information"
            variant="solid"
            typo="label.2"
            onPress={() => setIsPortalVisible(true)}
          />
        </Section>

        <CodeBlock
          code={`<AnimatedWrapper isAnimation color="primary.10" elevationLevel={3}>
  <ZSText>애니메이션 카드</ZSText>
</AnimatedWrapper>

<ZSPortal isFocused={isOpen}>
  <PortalContent />
</ZSPortal>`}
        />
      </ZSContainer>

      {isPortalVisible && (
        <ZSPortal>
          <View style={[styles.portalBackdrop, { backgroundColor: palette.modalBgColor }]}>
            <ZSView color="base" elevationLevel={8} style={styles.portalCard}>
              <ZSText typo="title.3">ZSPortal</ZSText>
              <ZSText typo="body.3" color="secondary" style={styles.portalDescription}>
                중첩된 부모의 overflow와 zIndex 영향을 받지 않는 최상위 레이어입니다.
              </ZSText>
              <ZSBlockButton
                title="닫기"
                intent="primary"
                variant="solid"
                typo="label.2"
                onPress={() => setIsPortalVisible(false)}
              />
            </ZSView>
          </View>
        </ZSPortal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
    paddingTop: 24,
    paddingBottom: 48,
    paddingHorizontal: 20,
  },
  cardRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
  },
  elevationCard: {
    flex: 1,
    height: 72,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  animatedCard: {
    width: '100%',
    minHeight: 96,
    borderRadius: 14,
    padding: 18,
    justifyContent: 'center',
    gap: 4,
  },
  rawText: {
    fontSize: 16,
    lineHeight: 24,
  },
  portalBackdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  portalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 18,
    padding: 24,
  },
  portalDescription: {
    marginTop: 8,
    marginBottom: 20,
  },
});
