import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { ZSBlockButton, ZSContainer, ZSPortal, ZSText, ZSView, useTheme } from '@0610studio/zs-ui';
import Section from '../src/ui/kit/Section';
import CodeBlock from '../src/ui/kit/CodeBlock';

export default function ZSPortalExample() {
  const [isPortalVisible, setIsPortalVisible] = useState(false);
  const { palette } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'ZSPortal' }} />
      <ZSContainer style={[styles.container, { backgroundColor: palette.background.layer2 }]}>
        <Section label="ZSPortal · 최상위 레이어" gap={12}>
          <ZSText typo="caption.1" color="secondary">
            현재 컴포넌트의 overflow와 zIndex 제약을 벗어나 최상위 레이어에 렌더링합니다.
          </ZSText>
          <ZSBlockButton title="포털 열기" intent="information" variant="solid" typo="label.2" onPress={() => setIsPortalVisible(true)} />
        </Section>

        <CodeBlock
          code={`<ZSPortal isFocused={isOpen}>
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
                부모 레이아웃의 잘림과 쌓임 순서에 영향받지 않는 최상위 콘텐츠입니다.
              </ZSText>
              <ZSBlockButton title="닫기" intent="primary" variant="solid" typo="label.2" onPress={() => setIsPortalVisible(false)} />
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
