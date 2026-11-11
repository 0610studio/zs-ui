import { renderHook } from '@testing-library/react-native';
import { useStyles } from '../../model/useStyles';
import { getTestTheme, setTestTheme } from '../utils/theme';

jest.mock('../../context/ThemeContext', () => require('../utils/theme').mockThemeModule());

describe('useStyles', () => {
  afterEach(() => setTestTheme());

  it('테마(색·글꼴)로 스타일을 만든다', async () => {
    const { colors, typography } = getTestTheme();
    const { result } = await renderHook(() =>
      useStyles(({ colors, typography }) => ({ title: { ...typography.subtitle1, color: colors.primary } })),
    );
    expect(result.current).toEqual({ title: { ...typography.subtitle1, color: colors.primary } });
    expect(colors.primary).toBeTruthy();
  });

  it('테마가 같으면 다시 만들지 않고, 바뀌면 다시 만든다', async () => {
    const create = jest.fn(({ colors }) => ({ box: { backgroundColor: colors.background } }));
    const { result, rerender } = await renderHook(() => useStyles(create));
    const first = result.current;
    await rerender({});
    expect(result.current).toBe(first);
    expect(create).toHaveBeenCalledTimes(1);

    const dark = setTestTheme({ mode: 'dark' });
    await rerender({});
    expect(create).toHaveBeenCalledTimes(2);
    expect(result.current.box.backgroundColor).toBe(dark.colors.background);
  });
});
