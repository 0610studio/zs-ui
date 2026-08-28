import { fireEvent, render } from '@testing-library/react-native';
import ZSSwitch from '../../ui/ZSSwitch';

jest.mock('../../context/ThemeContext', () => {
  const palette = require('../../theme/palette').default({ mode: 'light' });

  return {
    useTheme: () => ({ palette }),
  };
});

describe('ZSSwitch', () => {
  it('웹 접근성 checked 상태를 현재 값과 함께 노출한다', () => {
    const { getByTestId, rerender } = render(
      <ZSSwitch testID='switch' isActive={false} onToggle={jest.fn()} />
    );

    expect(getByTestId('switch').props['aria-checked']).toBe(false);

    rerender(<ZSSwitch testID='switch' isActive onToggle={jest.fn()} />);
    expect(getByTestId('switch').props['aria-checked']).toBe(true);
  });

  it('disabled 상태를 노출하고 onToggle을 호출하지 않는다', () => {
    const onToggle = jest.fn();
    const { getByTestId } = render(
      <ZSSwitch testID='switch' isActive disabled onToggle={onToggle} />
    );

    fireEvent.press(getByTestId('switch'));

    expect(onToggle).not.toHaveBeenCalled();
    expect(getByTestId('switch').props['aria-disabled']).toBe(true);
  });
});
