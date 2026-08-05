import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { GlobalOverlay, ZSContainer, ZSPressable, ZSText, useTheme } from 'zs-ui';
import Section from '../src/ui/kit/Section';
import DemoRow from '../src/ui/kit/DemoRow';
import CodeBlock from '../src/ui/kit/CodeBlock';

export default function GlobalOverlayExample() {
  const { palette } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'GlobalOverlay' }} />
      <ZSContainer style={[styles.container, { backgroundColor: palette.background.layer2 }]}>
        {/* 컨셉 설명 배너 */}
        <View style={[styles.banner, { backgroundColor: palette.grey[80] }]}>
          <ZSText typo="subTitle.2" style={{ color: palette.grey[5] }}>컴포넌트 밖에서 호출하는 오버레이</ZSText>
          <ZSText typo="caption.1" style={{ color: palette.grey[40] }}>
            axios interceptor, 전역 에러 핸들러처럼 React 트리 밖에서도 사용할 수 있습니다.
          </ZSText>
        </View>

        <Section label="GlobalOverlay.*" gap={0}>
          <DemoRow
            title="showAlert"
            caption="확인 시 스낵바 체이닝"
            dotColor={palette.primary.main}
            onPress={() =>
              GlobalOverlay.showAlert({
                title: '알림',
                informative: '컴포넌트에서 호출된 Global Alert입니다.',
                actions: {
                  primary: {
                    label: '확인',
                    onPress: () => GlobalOverlay.showSnackBar({ message: '확인 버튼 클릭됨!', type: 'success' }),
                  },
                  secondary: {
                    label: '취소',
                    onPress: () => console.log('취소됨'),
                  },
                },
              })
            }
          />
          <DemoRow
            title="showBottomSheet"
            caption="height 200 · hideOverlay 로 닫기"
            dotColor={palette.information.main}
            onPress={() =>
              GlobalOverlay.showBottomSheet({
                component: (
                  <View style={{ padding: 20, gap: 12 }}>
                    <ZSText>Global BottomSheet</ZSText>
                    <ZSText>GlobalOverlay 객체를 통해 호출되었습니다.</ZSText>
                    <ZSPressable
                      onPress={() => GlobalOverlay.hideOverlay('bottomSheet')}
                      color="danger"
                      style={styles.closeButton}
                    >
                      <ZSText color="white">닫기</ZSText>
                    </ZSPressable>
                  </View>
                ),
                options: { height: 200 },
              })
            }
          />
          <DemoRow
            title="showSnackBar"
            caption="success 스낵바"
            dotColor={palette.success.main}
            onPress={() => GlobalOverlay.showSnackBar({ message: 'SnackBar 표시', type: 'success' })}
          />
        </Section>

        <CodeBlock
          code={`import { GlobalOverlay } from '@0610studio/zs-ui';

// React 컴포넌트 밖에서도 호출 가능
GlobalOverlay.showSnackBar({
  message: '저장 완료',
  type: 'success',
});`}
        />
      </ZSContainer>
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
  banner: {
    width: '100%',
    borderRadius: 14,
    padding: 16,
    gap: 4,
  },
  closeButton: {
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
});
