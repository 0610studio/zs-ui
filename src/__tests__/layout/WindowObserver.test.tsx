import { act, render } from '@testing-library/react-native';
import { Text } from 'react-native';
import WindowObserver from '../../layout/WindowObserver';
import { getByHostType } from '../utils/hostQueries';

jest.mock('expo', () => {
  const React = require('react');
  return {
    requireNativeView: (_module: string, name: string) => (props: any) => React.createElement(name, props, props.children),
  };
});

describe('WindowObserver (iOS·Android 네이티브)', () => {
  it('네이티브 관찰 뷰가 앱 루트를 감싸고, 보고한 값을 측정값으로 넘긴다', async () => {
    const onObserve = jest.fn();
    const { getByText } = await render(
      <WindowObserver onObserve={onObserve} style={{ flex: 1 }}>
        <Text>app</Text>
      </WindowObserver>,
    );
    const native = getByHostType('ZSWindowObserverView');
    expect(native.props.style).toEqual({ flex: 1 });
    expect(getByText('app')).toBeTruthy();

    const observation = { width: 749.71, height: 832, widthClass: 'medium', heightClass: 'medium', minWidthDp: 600, minHeightDp: 480 };
    await act(() => native.props.onWindowLayoutChange({ nativeEvent: observation }));
    expect(onObserve).toHaveBeenCalledWith(observation);
  });
});
