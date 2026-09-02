import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import ZSTab, { type ZSTabItem } from '../../ui/ZSTab';

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

const ITEMS: ZSTabItem[] = [
  { value: 'all', label: '전체' },
  { value: 'ongoing', label: '진행중' },
  { value: 'done', label: '완료' },
];

const layoutEvent = (x: number, width: number) => ({
  nativeEvent: { layout: { x, y: 0, width, height: 44 } },
});

const measureItems = (getByTestId: any, count = ITEMS.length) => {
  for (let index = 0; index < count; index += 1) {
    fireEvent(getByTestId(`zs-tab-item-${index}`), 'layout', layoutEvent(index * 100, 100));
  }
};

const indicatorStyle = (getByTestId: any) =>
  StyleSheet.flatten(getByTestId('zs-tab-indicator').props.style);

describe('ZSTab', () => {
  it('아이템 개수만큼 탭을 렌더한다', () => {
    const { getByTestId, getByText, queryByTestId } = render(<ZSTab items={ITEMS} />);

    ITEMS.forEach((item, index) => {
      expect(getByTestId(`zs-tab-item-${index}`)).toBeTruthy();
      expect(getByText(item.label)).toBeTruthy();
    });
    expect(queryByTestId('zs-tab-item-3')).toBeNull();
  });

  it('측정 전에는 인디케이터를 렌더하지 않는다', () => {
    const { queryByTestId } = render(<ZSTab items={ITEMS} />);

    expect(queryByTestId('zs-tab-indicator')).toBeNull();
  });

  it('레이아웃이 측정되면 인디케이터가 선택 아이템의 위치·폭을 따른다', () => {
    const { getByTestId, rerender } = render(<ZSTab items={ITEMS} value='ongoing' />);

    measureItems(getByTestId);
    // shared value 는 effect 에서 갱신되므로 다음 렌더에서 확인한다
    rerender(<ZSTab items={ITEMS} value='ongoing' />);

    const style = indicatorStyle(getByTestId);
    expect(style.width).toBe(100);
    expect(style.transform).toEqual([{ translateX: 100 }]);
  });

  it('탭을 누르면 onChange 가 value 와 index 로 호출된다', () => {
    const onChange = jest.fn();
    const { getByText } = render(<ZSTab items={ITEMS} onChange={onChange} />);

    fireEvent.press(getByText('완료'));
    expect(onChange).toHaveBeenCalledWith('done', 2);
  });

  it('이미 선택된 탭을 눌러도 onChange 가 호출되지 않는다', () => {
    const onChange = jest.fn();
    const { getByText } = render(<ZSTab items={ITEMS} initialValue='all' onChange={onChange} />);

    fireEvent.press(getByText('전체'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('비제어 모드에서 누른 탭이 선택 상태가 된다', () => {
    const { getByText, getByTestId } = render(<ZSTab items={ITEMS} />);

    expect(getByTestId('zs-tab-item-0').props.accessibilityState.selected).toBe(true);

    fireEvent.press(getByText('진행중'));
    expect(getByTestId('zs-tab-item-1').props.accessibilityState.selected).toBe(true);
    expect(getByTestId('zs-tab-item-0').props.accessibilityState.selected).toBe(false);
  });

  it('제어 모드에서는 value 가 선택 상태를 결정한다', () => {
    const { getByText, getByTestId } = render(<ZSTab items={ITEMS} value='done' onChange={jest.fn()} />);

    expect(getByTestId('zs-tab-item-2').props.accessibilityState.selected).toBe(true);

    fireEvent.press(getByText('전체'));
    expect(getByTestId('zs-tab-item-2').props.accessibilityState.selected).toBe(true);
  });

  it('선택된 탭은 라이트 모드에서 대비가 확보된 intent 색상을 사용한다', () => {
    const { getByText } = render(<ZSTab items={ITEMS} value='all' />);

    expect(StyleSheet.flatten(getByText('전체').props.style).color).toBe('#996000');
  });

  it('value 가 items 에 없으면 첫 아이템을 선택으로 본다', () => {
    const { getByTestId } = render(<ZSTab items={ITEMS} value='없는값' />);

    expect(getByTestId('zs-tab-item-0').props.accessibilityState.selected).toBe(true);
  });

  it('disabled 면 눌러도 onChange 가 호출되지 않는다', () => {
    const onChange = jest.fn();
    const { getByText } = render(<ZSTab items={ITEMS} disabled onChange={onChange} />);

    fireEvent.press(getByText('완료'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('아이템 단위 disabled 도 눌리지 않는다', () => {
    const onChange = jest.fn();
    const items: ZSTabItem[] = [...ITEMS.slice(0, 2), { value: 'done', label: '완료', disabled: true }];
    const { getByText, getByTestId } = render(<ZSTab items={items} onChange={onChange} />);

    fireEvent.press(getByText('완료'));
    expect(onChange).not.toHaveBeenCalled();
    expect(getByTestId('zs-tab-item-2').props.accessibilityState.disabled).toBe(true);
  });

  it('indicatorColor 로 인디케이터 색을 덮어쓴다', () => {
    const { getByTestId, rerender } = render(<ZSTab items={ITEMS} indicatorColor='#FF0000' />);

    measureItems(getByTestId);
    rerender(<ZSTab items={ITEMS} indicatorColor='#FF0000' />);

    expect(indicatorStyle(getByTestId).backgroundColor).toBe('#FF0000');
  });

  it('hug 레이아웃은 아이템에 flex 를 주지 않는다', () => {
    const { getByTestId } = render(<ZSTab items={ITEMS} layout='hug' />);

    const style = StyleSheet.flatten(getByTestId('zs-tab-item-0').props.style);
    expect(style.flex).toBeUndefined();
  });

  it('fill(기본) 레이아웃은 아이템을 균등 분할한다', () => {
    const { getByTestId } = render(<ZSTab items={ITEMS} />);

    const style = StyleSheet.flatten(getByTestId('zs-tab-item-0').props.style);
    expect(style.flex).toBe(1);
  });

  it('tablist · tab 접근성 역할을 부여한다', () => {
    const { getByTestId } = render(<ZSTab items={ITEMS} testID='tabs' />);

    expect(getByTestId('tabs').props.accessibilityRole).toBe('tablist');
    expect(getByTestId('zs-tab-item-0').props.accessibilityRole).toBe('tab');
  });
});
