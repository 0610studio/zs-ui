import { useEffect, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { ZSBanner, ZSKeyboardStickyView, ZSScreen, ZSText, radiusStyle, useTheme } from '@0610studio/zs-ui';
import CtaButton from '../src/ui/CtaButton';
import { TextFieldExample } from '../src/ui/TextFieldExample';
import ScreenHeader from '../src/ui/ScreenHeader';

export default function ZSScreenExample() {
  const [ctaLayoutHeight, setCtaLayoutHeight] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const { colors } = useTheme();

  useEffect(() => {
    if (!refreshing) return undefined;
    const timer = setTimeout(() => {
      setRefreshCount((count) => count + 1);
      setRefreshing(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [refreshing]);

  return (
    <>
      <ScreenHeader title="ZSScreen" />
      <ZSScreen
        keyboardScrollExtraOffset={190}
        backgroundColor="background"
        style={[styles.container, { paddingBottom: 30 + ctaLayoutHeight }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => setRefreshing(true)}
            tintColor={colors.text}
            colors={[colors.text]}
            progressBackgroundColor={colors.surface3}
          />
        }
        bottomComponent={
          <ZSKeyboardStickyView onLayout={(event) => setCtaLayoutHeight(event.nativeEvent.layout.height)}>
            <CtaButton
              disabled={false}
              primaryButtonText="CTA 버튼"
              onPrimaryButtonPress={() => console.log('CTA 버튼 클릭')}
              secondaryButtonText="취소"
              onSecondaryButtonPress={() => {}}
            />
          </ZSKeyboardStickyView>
        }
      >
        <ZSBanner
          status="info"
          title="키보드 대응 스크롤 데모"
          message="입력 필드를 탭하면 키보드 위로 CTA 버튼이 따라 올라오고, 포커스 필드가 가려지지 않게 스크롤됩니다."
        />

        <View style={[styles.banner, radiusStyle('xl'), { backgroundColor: colors.surface2 }]}>
          <ZSText variant="caption" emphasized>당겨서 새로고침</ZSText>
          <ZSText variant="label" color="textSecondary" testID="screen-refresh-count">
            {refreshCount === 0 ? '화면 맨 위에서 아래로 당겨 보세요. 투명 헤더 아래에서도 스피너가 헤더 밑에서 나옵니다.' : `${refreshCount}번 새로고침했습니다.`}
          </ZSText>
        </View>

        <TextFieldExample title="입력 필드" />
      </ZSScreen>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 24,
  },
  banner: {
    width: '100%',
    padding: 16,
    gap: 4,
  },
});
