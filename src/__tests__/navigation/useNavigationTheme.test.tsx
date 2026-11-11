import { renderHook } from '@testing-library/react-native';
import { useNavigationTheme } from '../../navigation/useNavigationTheme';
import { setTestTheme } from '../utils/theme';

jest.mock('../../context/ThemeContext', () => require('../utils/theme').mockThemeModule());

const FONTS = { 400: 'Pretendard-Regular', 600: 'Pretendard-SemiBold', 700: 'Pretendard-Bold', 900: 'Pretendard-Black' };

describe('useNavigationTheme', () => {
  afterEach(() => setTestTheme());

  it('헤더(card)·화면 배경은 background, 제목은 text, 뱃지는 error 다 — 내비게이션 primary(헤더 버튼 tint·커서·JS 탭 글자)도 text', async () => {
    const { colors } = setTestTheme({ fonts: FONTS });
    const { result } = await renderHook(() => useNavigationTheme());
    expect(result.current.dark).toBe(false);
    expect(result.current.colors).toEqual({
      primary: colors.text,
      background: colors.background,
      card: colors.background,
      text: colors.text,
      border: colors.border,
      notification: colors.error,
    });
  });

  it('다크 모드면 dark 플래그와 다크 역할', async () => {
    const { colors } = setTestTheme({ mode: 'dark' });
    const { result } = await renderHook(() => useNavigationTheme());
    expect(result.current.dark).toBe(true);
    expect(result.current.colors.card).toBe(colors.background);
    expect(result.current.colors.text).toBe(colors.text);
    expect(result.current.colors.primary).toBe(colors.text);
  });

  it('굵기마다 가장 가까운 브랜드 글꼴을 쓰고 fontWeight 는 기본 테마 값을 둔다', async () => {
    setTestTheme({ fonts: FONTS });
    const { result } = await renderHook(() => useNavigationTheme());
    expect(result.current.fonts).toEqual({
      regular: { fontFamily: 'Pretendard-Regular', fontWeight: '400' },
      medium: { fontFamily: 'Pretendard-SemiBold', fontWeight: '500' },
      bold: { fontFamily: 'Pretendard-Bold', fontWeight: '600' },
      heavy: { fontFamily: 'Pretendard-Black', fontWeight: '700' },
    });
  });

  it('브랜드 글꼴이 없으면 내비게이션 기본 서체', async () => {
    const { result } = await renderHook(() => useNavigationTheme());
    expect(result.current.fonts.regular).toEqual({ fontFamily: 'System', fontWeight: '400' });
    expect(result.current.fonts.heavy).toEqual({ fontFamily: 'System', fontWeight: '700' });
  });

  it('테마가 같으면 같은 객체를 돌려준다', async () => {
    const { result, rerender } = await renderHook(() => useNavigationTheme());
    const first = result.current;
    await rerender({});
    expect(result.current).toBe(first);
  });
});
