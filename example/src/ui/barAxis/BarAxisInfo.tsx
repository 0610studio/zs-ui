import { StyleSheet } from 'react-native';
import { ZSText, useTheme } from '@0610studio/zs-ui';
import ScreenScrollView from '../kit/ScreenScrollView';

export default function BarAxisInfo() {
  const { colors } = useTheme();

  return (
    <ScreenScrollView style={{ backgroundColor: colors.surface1 }} contentContainerStyle={styles.content}>
      <ZSText variant="subtitle1" emphasized>세로 탭</ZSText>
      <ZSText variant="body2" color="textSecondary">
        iPhone Duo를 접었을 때와 펼쳐서 가로로 들었을 때 시계·뒤로 버튼·탭이 오른쪽 세로 막대에 모여요. 폴더블 Android를 펼치면 탭이 화면 옆 레일로 가요.
      </ZSText>
      <ZSText variant="subtitle1" emphasized>가로 탭</ZSText>
      <ZSText variant="body2" color="textSecondary">
        시계와 제목은 위, 탭 바는 아래에 둬요. 폴더블 Android를 펼쳐도, 태블릿에서도 탭은 아래에 있어요. 넓은 창만 레일로 쓰려면 앱에서 useBarAxis 로 바꿔요.
      </ZSText>
      <ZSText variant="subtitle1" emphasized>둘이 같아 보일 때</ZSText>
      <ZSText variant="body2" color="textSecondary">
        일반 iPhone·iPad와 Android 폰에는 세로 막대가 없어서 두 배치가 똑같이 보여요. 차이는 iPhone Duo와 펼친 폴더블에서 볼 수 있어요.
      </ZSText>
      <ZSText variant="label" color="textSecondary">
        실제 앱은 화면마다 바꾸지 않고 앱 전체에 한 번 정해요(LayoutProvider barAxis).
      </ZSText>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 12,
  },
});
