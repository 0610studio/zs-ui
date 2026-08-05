import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { ZSContainer, ZSSwitch, ZSText, useTheme } from 'zs-ui';
import Section from '../src/ui/kit/Section';
import CodeBlock from '../src/ui/kit/CodeBlock';

export default function SwitchExample() {
  const { palette } = useTheme();
  const [basicActive, setBasicActive] = useState(true);
  const [customActive, setCustomActive] = useState(false);
  const [largeActive, setLargeActive] = useState(true);
  const [smallActive, setSmallActive] = useState(false);

  return (
    <>
      <Stack.Screen options={{ title: 'ZSSwitch' }} />
      <ZSContainer style={[styles.container, { backgroundColor: palette.background.layer2 }]}>
        <Section label="기본" gap={4}>
          <View style={styles.switchRow}>
            <ZSText typo="body.2">기본 (primary)</ZSText>
            <ZSSwitch
              isActive={basicActive}
              onToggle={() => setBasicActive(!basicActive)}
            />
          </View>
          <View style={styles.switchRow}>
            <ZSText typo="body.2">비활성화 (disabled)</ZSText>
            <ZSSwitch
              isActive
              disabled
              onToggle={() => console.log('disabled 상태에서는 호출되지 않음')}
            />
          </View>
        </Section>

        <Section label="커스텀 색상" gap={4}>
          <View style={styles.switchRow}>
            <ZSText typo="body.2">트랙 · 썸 색상 지정</ZSText>
            <ZSSwitch
              isActive={customActive}
              onToggle={() => setCustomActive(!customActive)}
              trackColorInactive="#ffcccc"
              trackColorActive="#ff6b6b"
              thumbColor="#ffffff"
            />
          </View>
        </Section>

        <Section label="크기" gap={4}>
          <View style={styles.switchRow}>
            <ZSText typo="body.2">크기 100</ZSText>
            <ZSSwitch
              isActive={largeActive}
              onToggle={() => setLargeActive(!largeActive)}
              width={100}
            />
          </View>
          <View style={styles.switchRow}>
            <ZSText typo="body.2">크기 30</ZSText>
            <ZSSwitch
              isActive={smallActive}
              onToggle={() => setSmallActive(!smallActive)}
              width={30}
            />
          </View>
        </Section>

        <CodeBlock
          code={`<ZSSwitch
  isActive={isActive}
  onToggle={() => setIsActive(!isActive)}
  width={50}
  trackColorActive="#ff6b6b"
  disabled={false}
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
  switchRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
});
