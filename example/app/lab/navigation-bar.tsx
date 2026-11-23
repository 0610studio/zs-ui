import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ZSChip, ZSScreen, ZSText, useHeaderInset, useNavigationBarOnDark, useTheme } from '@0610studio/zs-ui';
import ScreenHeader from '../../src/ui/ScreenHeader';

const ROWS = Array.from({ length: 24 }, (_, index) => index + 1);
const CAMERA_BLACK = '#000000';

/**
 * Android 하단 내비게이션 바 — 앱 루트 ZSNavigationBarFade(바 뒤 화면 바탕색 페이드)와
 * 어두운 면 화면(useNavigationBarOnDark: 흰 버튼 · 페이드 끔). iOS 는 홈 인디케이터 뒤를 칠하지 않는다.
 */
export default function LabNavigationBar() {
  const { colors } = useTheme();
  const [dark, setDark] = useState(false);
  const { bottom } = useSafeAreaInsets();
  // edges 를 직접 주면 투명 헤더 비킴도 직접 한다(Android 헤더 높이, iOS 는 UIKit 이 처리해 0)
  const headerInset = useHeaderInset();
  const ink = dark ? '#ffffff' : colors.text;

  return (
    <>
      <ScreenHeader title="내비게이션 바" />
      {/* 내용이 바 밑을 지나가야 페이드가 보인다 — 아래 safe area 를 빼고 화면 끝까지 깔고, 끝 줄 뒤에만 아래 inset 만큼 비운다.
          어두운 면은 머리글 아래 묶음에만 깔아 머리글·상태 표시줄은 테마 색 그대로 읽힌다 */}
      <ZSScreen edges={['left', 'right']} backgroundColor="background" style={[styles.screen, { paddingTop: headerInset }]} testID="lab-navigation-bar-scroll">
        {dark ? <DarkSurface /> : null}
        <View style={[styles.content, { backgroundColor: dark ? CAMERA_BLACK : colors.background, paddingBottom: styles.content.padding + bottom }]} testID="lab-navigation-bar-surface">
          <ZSChip label="어두운 면(카메라)" selected={dark} onSelectedChange={() => setDark(!dark)} testID="lab-navigation-bar-dark" />
          <ZSText variant="body2" style={{ color: ink }}>
            {dark
              ? 'useNavigationBarOnDark() — 이 화면이 보이는 동안 버튼·손잡이는 흰색이고 바 뒤 페이드를 끈다.'
              : '바 뒤에 화면 바탕색 투명 → 80% 페이드(ZSNavigationBarFade). 아래 줄이 바 밑으로 지나가며 흐려진다.'}
          </ZSText>
          {ROWS.map((row) => (
            <View key={row} style={[styles.row, { backgroundColor: dark ? '#222222' : colors.surface2 }]}>
              <ZSText variant="subtitle2" style={{ color: ink }}>{`줄 ${row}`}</ZSText>
            </View>
          ))}
        </View>
      </ZSScreen>
    </>
  );
}

function DarkSurface() {
  useNavigationBarOnDark();
  return null;
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1 },
  content: { flexGrow: 1, padding: 20, gap: 12 },
  row: { height: 56, borderRadius: 16, justifyContent: 'center', paddingHorizontal: 16 },
});
