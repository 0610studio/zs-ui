import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Stack } from 'expo-router';
import { ZSContainer, ZSText, useOverlay, useTheme } from 'zs-ui';
import MyBottomSheet from '../src/ui/MyBottomSheet';
import MyModal from '../src/ui/MyModal';
import Section from '../src/ui/kit/Section';
import DemoRow from '../src/ui/kit/DemoRow';
import CodeBlock from '../src/ui/kit/CodeBlock';

export default function OverlayExample() {
  const { showAlert, showSnackBar, showBottomSheet, showModality, hideOverlay } = useOverlay();
  const { palette } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Overlay' }} />
      <ZSContainer style={[styles.container, { backgroundColor: palette.background.layer2 }]}>
        <Section label="Alert · 확인 대화상자" gap={0}>
          <DemoRow
            title="showAlert"
            caption="타이틀 · informative · primary/secondary 액션"
            dotColor={palette.primary.main}
            isLast
            onPress={() =>
              showAlert({
                title: '타이틀 테스트 길어지면 줄바꿈이 될 수 있습니다.',
                informative: '테스트 informative 길~~~~~~~~어지면 줄바꿈이 될 수 있습니다.',
                primaryButtonStyle: { backgroundColor: palette.primary.main },
                actions: {
                  primary: { label: '확인', onPress: () => console.log('확인') },
                  secondary: { label: '취소', onPress: () => console.log('취소') },
                },
              })
            }
          />
        </Section>

        <Section label="SnackBar · 상단 알림" gap={0}>
          <DemoRow
            title="showSnackBar · success"
            caption="상단 스낵바 알림"
            dotColor={palette.success.main}
            onPress={() => showSnackBar({ message: Date.now().toString(), type: 'success' })}
          />
          <DemoRow
            title="showSnackBar · error"
            caption="긴 메시지 줄바꿈 테스트"
            dotColor={palette.danger.main}
            isLast
            onPress={() =>
              showSnackBar({
                message: Date.now().toString() + ' 길~~~~~~어진 스낵바 테스트 입니다아아아아아',
                type: 'error',
              })
            }
          />
        </Section>

        <Section label="BottomSheet · 시트" gap={0}>
          <DemoRow
            title="showBottomSheet · floating auto"
            caption="height: 'auto' + 헤더 컴포넌트"
            dotColor={palette.information.main}
            onPress={() =>
              showBottomSheet({
                options: { height: 'auto' },
                headerComponent: (
                  <ZSText style={{ textAlign: 'center', padding: 30, backgroundColor: '#ff00ff' }}>헤더 컴포넌트1</ZSText>
                ),
                component: (
                  <ScrollView contentContainerStyle={{ gap: 10 }}>
                    <View style={{ width: '100%', height: 100, backgroundColor: 'red' }} />
                    <View style={{ width: '100%', height: 100, backgroundColor: 'red' }} />
                    <View style={{ width: '100%', height: 100, backgroundColor: 'red' }} />
                  </ScrollView>
                ),
              })
            }
          />
          <DemoRow
            title="showBottomSheet · fixed 400"
            caption="type: 'fixed' 고정 높이 시트"
            dotColor={palette.information.main}
            onPress={() =>
              showBottomSheet({
                options: { height: 400, type: 'fixed' },
                component: <MyBottomSheet onConfirm={() => console.log('event')} />,
              })
            }
          />
          <DemoRow
            title="showBottomSheet · dismissable false"
            caption="배경 터치·제스처로 닫히지 않음 (버튼으로만 닫기)"
            dotColor={palette.information.main}
            isLast
            onPress={() =>
              showBottomSheet({
                options: {
                  height: 'auto',
                  dismissable: false,
                  onClose: () => showSnackBar({ message: 'onClose 발화', type: 'success' }),
                },
                headerComponent: (
                  <ZSText style={{ textAlign: 'center', paddingBottom: 8 }}>고정 시트 헤더</ZSText>
                ),
                component: (
                  <View style={{ gap: 16, paddingVertical: 12 }}>
                    <ZSText style={{ textAlign: 'center' }}>dismissable false 시트</ZSText>
                    <TouchableOpacity
                      style={{ backgroundColor: palette.primary.main, borderRadius: 12, padding: 14, alignItems: 'center' }}
                      onPress={() => hideOverlay('bottomSheet')}
                    >
                      <ZSText style={{ color: '#ffffff' }}>시트 닫기</ZSText>
                    </TouchableOpacity>
                  </View>
                ),
              })
            }
          />
        </Section>

        <Section label="Modality · 전체화면 모달" gap={0}>
          <DemoRow
            title="showModality"
            caption="화면 전체를 덮는 페이지시트 · 뒤 화면 축소 전환"
            dotColor={palette.warning.main}
            isLast
            onPress={() =>
              showModality({
                component: (
                  <MyModal
                    onConfirm={() => {
                      console.log('event');
                      hideOverlay('modal');
                    }}
                  />
                ),
              })
            }
          />
        </Section>

        <CodeBlock
          code={`const { showAlert, showSnackBar,
        showBottomSheet, showModality } = useOverlay();

showSnackBar({ message: '...', type: 'success' });`}
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
});
