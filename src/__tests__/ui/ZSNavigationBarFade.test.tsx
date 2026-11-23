import { act, render, screen } from '@testing-library/react-native';
import { Platform, StyleSheet } from 'react-native';
import ZSNavigationBarFade from '../../ui/ZSNavigationBarFade';
import { useNavigationBarOnDark } from '../../navigation/useNavigationBarOnDark';
import { getTestTheme, setTestTheme } from '../utils/theme';

let mockBottom = 48;
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: mockBottom }) }));
jest.mock('../../context/ThemeContext', () => require('../utils/theme').mockThemeModule());

const platform = Platform as { OS: string };
// 페이드는 스크린 리더에서 숨긴 요소라 기본 쿼리에 잡히지 않는다
const HIDDEN = { includeHiddenElements: true };
const fadeStyle = () => StyleSheet.flatten(screen.getByTestId('zs-navigation-bar-fade', HIDDEN).props.style);

function DarkScreen() {
  useNavigationBarOnDark();
  return null;
}

describe('ZSNavigationBarFade', () => {
  beforeEach(() => {
    platform.OS = 'android';
    mockBottom = 48;
    setTestTheme();
  });

  afterEach(() => {
    platform.OS = 'ios';
  });

  it('Android 는 아래 inset 높이만큼 화면 바탕색 투명 → 80% 페이드를 깔고, 터치·스크린 리더는 통과한다', async () => {
    await render(<ZSNavigationBarFade />);
    const background = getTestTheme().colors.background;
    expect(fadeStyle()).toMatchObject({
      position: 'absolute', left: 0, right: 0, bottom: 0, height: 48,
      backgroundImage: `linear-gradient(to bottom, ${background}00, ${background}cc)`,
    });
    expect(screen.getByTestId('zs-navigation-bar-fade', HIDDEN).props).toMatchObject({
      pointerEvents: 'none',
      accessibilityElementsHidden: true,
      importantForAccessibility: 'no-hide-descendants',
    });
  });

  it('다크 모드는 다크 바탕색, 색·불투명도를 바꿀 수 있다', async () => {
    const dark = setTestTheme({ mode: 'dark' }).colors.background;
    await render(<ZSNavigationBarFade />);
    expect(fadeStyle().backgroundImage).toBe(`linear-gradient(to bottom, ${dark}00, ${dark}cc)`);
    await act(() => screen.rerender(<ZSNavigationBarFade color="#112233" opacity={0.5} />));
    expect(fadeStyle().backgroundImage).toBe('linear-gradient(to bottom, #11223300, #11223380)');
  });

  it('iOS 이거나 아래 inset 이 0 이면 그리지 않는다', async () => {
    platform.OS = 'ios';
    await render(<ZSNavigationBarFade />);
    expect(screen.queryByTestId('zs-navigation-bar-fade', HIDDEN)).toBeNull();
    platform.OS = 'android';
    mockBottom = 0;
    await act(() => screen.rerender(<ZSNavigationBarFade testID="again" />));
    expect(screen.queryByTestId('again', HIDDEN)).toBeNull();
  });

  it('어두운 면 화면(useNavigationBarOnDark)이 보이는 동안만 끈다', async () => {
    await render(<><ZSNavigationBarFade /><DarkScreen /></>);
    expect(screen.queryByTestId('zs-navigation-bar-fade', HIDDEN)).toBeNull();
    await act(() => screen.rerender(<><ZSNavigationBarFade /></>));
    expect(screen.getByTestId('zs-navigation-bar-fade', HIDDEN)).toBeTruthy();
  });
});
