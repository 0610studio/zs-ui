import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { PopOverButton, ZSContainer, ZSText, ZSView, Theme, useTheme } from 'zs-ui';
import { useStyleSheetCreate } from 'zs-ui';
import RenderPopOverMenu from '../src/ui/RenderPopOverMenu';
import Section from '../src/ui/kit/Section';
import CodeBlock from '../src/ui/kit/CodeBlock';

function PopOverTrigger({ styles }: { styles: ReturnType<typeof createTriggerStyles> }) {
  return (
    <ZSView style={styles.popOverButtonContainer}>
      <ZSText typo="label.2">팝오버 메뉴</ZSText>
      <ZSView style={styles.popOverIcon}>
        <ZSView style={styles.dot} />
        <ZSView style={[styles.dot, { marginVertical: 3 }]} />
        <ZSView style={styles.dot} />
      </ZSView>
    </ZSView>
  );
}

export default function PopOverExample() {
  const styles = useStyleSheetCreate(createTriggerStyles);
  const { palette } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'PopOver' }} />
      <ZSContainer style={[pageStyles.container, { backgroundColor: palette.background.layer2 }]}>
        <Section label="우측 정렬" gap={10}>
          <View style={{ width: '100%', alignItems: 'flex-end' }}>
            <PopOverButton width={140} height={50} popOverMenuComponent={<RenderPopOverMenu />}>
              <PopOverTrigger styles={styles} />
            </PopOverButton>
          </View>
        </Section>

        <Section label="좌측 정렬" gap={10}>
          <PopOverButton width={140} height={50} popOverMenuComponent={<RenderPopOverMenu />}>
            <PopOverTrigger styles={styles} />
          </PopOverButton>
        </Section>

        {/* 화면 하단에서 열리는 케이스 확인용 스페이서 */}
        <View style={{ width: 10, height: 160 }} />

        <Section label="하단 위치" gap={10}>
          <PopOverButton width={140} height={50} popOverMenuComponent={<RenderPopOverMenu />}>
            <PopOverTrigger styles={styles} />
          </PopOverButton>
        </Section>

        <CodeBlock
          code={`<PopOverButton
  width={140}
  height={50}
  popOverMenuComponent={<MyMenu />}
>
  <TriggerView />
</PopOverButton>`}
        />
      </ZSContainer>
    </>
  );
}

const pageStyles = StyleSheet.create({
  container: {
    gap: 20,
    paddingTop: 24,
    paddingBottom: 48,
    paddingHorizontal: 20,
  },
});

const createTriggerStyles = (palette: Theme) => StyleSheet.create({
  popOverButtonContainer: {
    paddingRight: 10,
    paddingLeft: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: palette.grey[50],
    borderRadius: 30,
    paddingVertical: 10,
    flex: 1,
  },
  popOverIcon: {
    marginLeft: 10,
    width: 30,
    height: 30,
    borderRadius: 18,
    borderWidth: 2.2,
    borderColor: palette.grey[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.grey[50],
  },
});
