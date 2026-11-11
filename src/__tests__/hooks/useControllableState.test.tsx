import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { useControllableState } from '../../model/useControllableState';

function ControllableProbe({ value, onChange }: { value?: string; onChange?: (next: string) => void }) {
  const [current, set] = useControllableState(value, 'default', onChange);
  return (
    <Text testID="out" onPress={() => set('pressed')}>
      {current}
    </Text>
  );
}

describe('useControllableState', () => {
  it('uncontrolled 는 내부 상태를 바꾼다', async () => {
    const onChange = jest.fn();
    await render(<ControllableProbe onChange={onChange} />);
    expect(screen.getByTestId('out').props.children).toBe('default');

    await fireEvent.press(screen.getByTestId('out'));
    expect(screen.getByTestId('out').props.children).toBe('pressed');
    expect(onChange).toHaveBeenCalledWith('pressed');
  });

  it('controlled 는 값을 유지하고 콜백만 부른다', async () => {
    const onChange = jest.fn();
    await render(<ControllableProbe value="fixed" onChange={onChange} />);

    await fireEvent.press(screen.getByTestId('out'));
    expect(screen.getByTestId('out').props.children).toBe('fixed');
    expect(onChange).toHaveBeenCalledWith('pressed');
  });

  it('콜백이 없어도 안전하다', async () => {
    await render(<ControllableProbe />);
    await expect(fireEvent.press(screen.getByTestId('out'))).resolves.not.toThrow();
  });
});
