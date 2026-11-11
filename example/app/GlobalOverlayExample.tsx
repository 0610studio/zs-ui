import { StyleSheet, View } from 'react-native';
import { GlobalOverlay, ZSButton, ZSScreen, ZSText, radiusStyle, useTheme } from '@0610studio/zs-ui';
import Section from '../src/ui/kit/Section';
import DemoRow from '../src/ui/kit/DemoRow';
import { GAP, PAGE_CONTENT } from '../src/ui/kit/layout';
import ScreenHeader from '../src/ui/ScreenHeader';

export default function GlobalOverlayExample() {
  const { colors } = useTheme();

  return (
    <>
      <ScreenHeader title="GlobalOverlay" />
      <ZSScreen backgroundColor="background" style={styles.container}>
        <View style={[styles.banner, radiusStyle('xl'), { backgroundColor: colors.backgroundInverse }]}>
          <ZSText variant="subtitle2" emphasized color="textInverse">컴포넌트 밖에서 호출하는 오버레이</ZSText>
          <ZSText variant="label" color="textInverse">axios interceptor, 전역 에러 핸들러처럼 React 트리 밖에서도 쓸 수 있다.</ZSText>
        </View>

        <Section label="GlobalOverlay.*" surface="list">
          <DemoRow
            title="showAlert"
            caption="확인하면 스낵바로 이어서 알린다"
            onPress={() =>
              GlobalOverlay.showAlert({
                title: '알림',
                message: '컴포넌트 밖에서 호출한 Alert 입니다.',
                confirm: { label: '확인', onPress: () => GlobalOverlay.showSnackbar({ message: '확인했습니다' }) },
                cancel: { label: '취소' },
              })
            }
          />
          <DemoRow
            title="showBottomSheet"
            caption="hideBottomSheet 로 닫기"
            onPress={() =>
              GlobalOverlay.showBottomSheet({
                header: 'Global BottomSheet',
                component: (
                  <View style={{ gap: 12, paddingBottom: 24 }}>
                    <ZSText color="textSecondary">GlobalOverlay 객체로 띄웠다.</ZSText>
                    <ZSButton title="닫기" variant="tonal" color="neutral" fullWidth onPress={GlobalOverlay.hideBottomSheet} />
                  </View>
                ),
              })
            }
          />
          <DemoRow
            title="showSnackbar"
            caption="화면 위 스낵바"
            onPress={() => GlobalOverlay.showSnackbar({ message: 'Snackbar 표시' })}
          />
        </Section>
      </ZSScreen>
    </>
  );
}

const styles = StyleSheet.create({
  container: PAGE_CONTENT,
  banner: { width: '100%', padding: GAP.lg, gap: GAP.xs },
});
