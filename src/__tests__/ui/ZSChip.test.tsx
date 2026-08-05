import { fireEvent, render } from '@testing-library/react-native';
import ZSChip from '../../ui/ZSChip';

jest.mock('../../context/ThemeContext', () => {
  const paletteFn = require('../../theme/palette').default;
  const typographyFn = require('../../theme/typography').default;
  const palette = paletteFn({ mode: 'light' });
  const typography = typographyFn({ themeFonts: {} });
  return {
    ThemeProvider: ({ children }: any) => children,
    useTheme: () => ({ palette, typography }),
  };
});

describe('ZSChip', () => {
  it('라벨을 렌더한다', () => {
    const { getByText } = render(<ZSChip label='강아지' />);
    expect(getByText('강아지')).toBeTruthy();
  });

  it('누르면 onChange가 다음 선택 상태(true)로 호출된다', () => {
    const onChange = jest.fn();
    const { getByText } = render(<ZSChip label='강아지' onChange={onChange} />);

    fireEvent.press(getByText('강아지'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('비제어 모드: 다시 누르면 false로 토글되고 accessibilityState가 따라간다', () => {
    const onChange = jest.fn();
    const { getByTestId } = render(
      <ZSChip testID='chip' label='강아지' initialSelected onChange={onChange} />
    );

    expect(getByTestId('chip').props.accessibilityState.selected).toBe(true);
    fireEvent.press(getByTestId('chip'));
    expect(onChange).toHaveBeenCalledWith(false);
    expect(getByTestId('chip').props.accessibilityState.selected).toBe(false);
  });

  it('제어 모드: selected를 넘기면 내부 토글 없이 onChange만 호출된다', () => {
    const onChange = jest.fn();
    const { getByTestId } = render(
      <ZSChip testID='chip' label='강아지' selected={false} onChange={onChange} />
    );

    fireEvent.press(getByTestId('chip'));
    expect(onChange).toHaveBeenCalledWith(true);
    // 외부 상태가 바뀌지 않았으므로 선택 상태 유지
    expect(getByTestId('chip').props.accessibilityState.selected).toBe(false);
  });

  it('disabled면 눌러도 onChange가 호출되지 않는다', () => {
    const onChange = jest.fn();
    const { getByText } = render(<ZSChip label='강아지' disabled onChange={onChange} />);

    fireEvent.press(getByText('강아지'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('checkIcon: 선택 상태에서만 체크 아이콘을 렌더한다', () => {
    const { queryByTestId, rerender } = render(
      <ZSChip label='강아지' checkIcon selected={false} />
    );
    expect(queryByTestId('zs-chip-check')).toBeNull();

    rerender(<ZSChip label='강아지' checkIcon selected />);
    expect(queryByTestId('zs-chip-check')).toBeTruthy();
  });

  it('checkIcon이 false(기본)면 선택돼도 체크 아이콘이 없다', () => {
    const { queryByTestId } = render(<ZSChip label='강아지' selected />);
    expect(queryByTestId('zs-chip-check')).toBeNull();
  });
});
