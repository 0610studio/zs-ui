import { StyleSheet, View } from 'react-native';
import { ZSContainer, ZSMessageBar, useTheme } from '@0610studio/zs-ui';

type Props = {
  component: string;
};

/**
 * 웹에서 반쪽만 동작하는 예제(Skia 이펙트 · 네이티브 폴딩 감지)는 아무것도 렌더하지 않고 안내만 띄운다.
 */
export default function WebUnsupportedNotice({ component }: Props) {
  const { palette } = useTheme();

  return (
    <ZSContainer
      scrollViewDisabled
      style={[styles.container, { backgroundColor: palette.background.layer2 }]}
    >
      {/* ZSContainer 는 testID 를 DOM 으로 넘기지 않아 e2e 기준점을 안쪽 View 에 둔다 */}
      <View style={styles.notice} testID="web-unsupported-notice">
        <ZSMessageBar
          intent="warning"
          title={component}
          message="웹을 지원하지 않습니다. iOS · Android 앱에서 확인해주세요."
        />
      </View>
    </ZSContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },
  notice: {
    width: '100%',
  },
});
