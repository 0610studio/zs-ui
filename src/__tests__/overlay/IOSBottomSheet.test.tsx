import { useState } from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react-native';
import { Dimensions, I18nManager, StyleSheet, Text, TextInput } from 'react-native';
import { useVerticalBarEdgeIOS } from 'expo-status-bar';
import * as GestureHandler from 'react-native-gesture-handler';
import IOSBottomSheet from '../../overlay/IOSBottomSheet';
import { LayoutProvider } from '../../layout/LayoutProvider';
import type { WindowObserverProps } from '../../layout/WindowObserver.types';
import type { MockGesture } from '../__mocks__/react-native-gesture-handler';
import { getByHostType, queryAllByHostType } from '../utils/hostQueries';

let observe: WindowObserverProps['onObserve'] = () => {};

jest.mock('../../context/ThemeContext', () => require('../utils/theme').mockThemeModule());
jest.mock('../../layout/WindowObserver', () => ({
  __esModule: true,
  default: ({ children, onObserve }: WindowObserverProps) => { observe = onObserve; return children; },
}));

const edge = jest.mocked(useVerticalBarEdgeIOS);
const pan = jest.spyOn(GestureHandler, 'usePanGesture');
const lastPan = () => pan.mock.results.at(-1)!.value as unknown as MockGesture;

function Sheet({ axis, open = true, dismissible = true, onClose = jest.fn(), snapPoints }: {
  axis?: 'horizontal' | 'vertical'; open?: boolean; dismissible?: boolean; onClose?: () => void; snapPoints?: string[];
}) {
  return <LayoutProvider barAxis={axis}><IOSBottomSheet open={open} dismissible={dismissible} onClose={onClose} snapPoints={snapPoints}><Text>내용</Text></IOSBottomSheet></LayoutProvider>;
}

describe('iOS sheet presentation', () => {
  beforeEach(() => { jest.useFakeTimers(); edge.mockReturnValue(null); });
  afterEach(() => { jest.runOnlyPendingTimers(); jest.useRealTimers(); });

  it('keeps the native sheet on an ordinary iPhone', async () => {
    await render(<Sheet />);
    expect(getByHostType('BottomSheet').props.index).toBe(0);
    expect(screen.queryByTestId('zs-bottom-sheet-window')).toBeNull();
  });

  it('presents the native sheet from the topmost screen and closes when that screen takes it down', async () => {
    const onClose = jest.fn();
    await render(<Sheet onClose={onClose} />);
    const anchor = getByHostType('ZSPresentationAnchorView');
    expect(getByHostType('BottomSheet').parent).toBe(anchor);
    await act(() => anchor.props.onDetach());
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('keeps native sheets when Duo explicitly uses vertical bars', async () => {
    edge.mockReturnValue('trailing');
    await render(<Sheet axis="vertical" />);
    expect(getByHostType('BottomSheet').props.index).toBe(0);
  });

  it('uses the existing window for the default horizontal bars on Duo', async () => {
    edge.mockReturnValue('trailing');
    await render(<Sheet />);
    expect(screen.getByTestId('zs-bottom-sheet-window')).toBeTruthy();
    expect(queryAllByHostType('BottomSheet')).toHaveLength(0);
    expect(queryAllByHostType('ZSPresentationAnchorView')).toHaveLength(0);
  });

  it('also works without LayoutProvider and retains draft state through folding', async () => {
    edge.mockReturnValue('trailing');
    const get = jest.spyOn(Dimensions, 'get');
    get.mockReturnValue({ width: 466, height: 678, scale: 3, fontScale: 1 });
    function Draft() { const [value, setValue] = useState(''); return <TextInput testID="draft" value={value} onChangeText={setValue} />; }
    const ui = () => <IOSBottomSheet open dismissible onClose={jest.fn()}><Draft /></IOSBottomSheet>;
    try {
      await render(ui());
      await fireEvent.changeText(screen.getByTestId('draft'), '작성 중인 기록');
      get.mockReturnValue({ width: 951, height: 669, scale: 3, fontScale: 1 });
      edge.mockReturnValue(null);
      await screen.rerender(ui());
      expect(screen.getByTestId('draft').props.value).toBe('작성 중인 기록');
      expect(StyleSheet.flatten(screen.getByTestId('zs-bottom-sheet-window').props.style)).toMatchObject({ width: '100%' });
    } finally { get.mockRestore(); }
  });

  it.each([false, true])('keeps the whole sheet outside an occluding hinge and retains its draft when unfolded (RTL %s)', async (rtl) => {
    edge.mockReturnValue('trailing');
    const get = jest.spyOn(Dimensions, 'get');
    get.mockReturnValue({ width: 951, height: 669, scale: 3, fontScale: 1 });
    const previousRTL = I18nManager.isRTL;
    I18nManager.isRTL = rtl;
    const onClose = jest.fn();
    function Draft() { const [value, setValue] = useState(''); return <TextInput testID="draft" value={value} onChangeText={setValue} />; }
    const ui = () => <LayoutProvider><IOSBottomSheet open dismissible onClose={onClose}><Text>제목</Text><Draft /><Text>확인</Text></IOSBottomSheet></LayoutProvider>;
    const observation = {
      width: 951, height: 669,
      displayFeatures: [{ type: 'fold', x: 455.5, y: 0, width: 40, height: 669, orientation: 'vertical', active: true, state: 'halfOpened' }],
    } as const;
    try {
      await render(ui());
      await act(() => observe(observation as any));
      const sheet = screen.getByTestId('zs-bottom-sheet-window');
      const frame = StyleSheet.flatten(sheet.props.style);
      expect(frame).toMatchObject({ width: 455.5, marginStart: rtl ? 495.5 : 0, marginEnd: rtl ? 0 : 495.5 });
      expect(rtl ? frame.marginEnd : frame.marginStart).toBe(0);
      expect(within(sheet).getByTestId('zs-bottom-sheet-handle')).toBeTruthy();
      expect(within(sheet).getByTestId('draft')).toBeTruthy();
      expect(within(sheet).getByText('제목')).toBeTruthy();
      expect(within(sheet).getByText('확인')).toBeTruthy();
      await fireEvent.changeText(screen.getByTestId('draft'), '2021-03-15');

      await act(() => observe({ ...observation, displayFeatures: [] }));
      edge.mockReturnValue(null);
      await screen.rerender(ui());
      expect(StyleSheet.flatten(screen.getByTestId('zs-bottom-sheet-window').props.style)).toMatchObject({ width: '100%' });
      expect(screen.getByTestId('draft').props.value).toBe('2021-03-15');
      expect(onClose).not.toHaveBeenCalled();

      await act(() => lastPan().__config.onDeactivate({ translationY: 200, velocityY: 1500 }));
      await act(() => jest.runOnlyPendingTimers());
      expect(onClose).toHaveBeenCalledTimes(1);
    } finally { get.mockRestore(); I18nManager.isRTL = previousRTL; }
  });

  it.each([false, true])('keeps an asymmetric right pane at the same physical position (RTL %s)', async (rtl) => {
    edge.mockReturnValue('trailing');
    const get = jest.spyOn(Dimensions, 'get');
    get.mockReturnValue({ width: 1000, height: 669, scale: 3, fontScale: 1 });
    const previousRTL = I18nManager.isRTL;
    I18nManager.isRTL = rtl;
    try {
      await render(<Sheet />);
      await act(() => observe({
        width: 1000, height: 669,
        displayFeatures: [{ type: 'fold', x: 350, y: 0, width: 40, height: 669, orientation: 'vertical', active: true, state: 'halfOpened' }],
      }));
      const frame = StyleSheet.flatten(screen.getByTestId('zs-bottom-sheet-window').props.style);
      const physicalLeft = rtl ? frame.marginEnd : frame.marginStart;
      expect(physicalLeft).toBe(390);
      expect(physicalLeft + frame.width).toBe(1000);
      expect(frame.marginLeft).toBeUndefined();
      expect(frame.marginRight).toBeUndefined();
    } finally { get.mockRestore(); I18nManager.isRTL = previousRTL; }
  });

  it('closes only after the animation and calls onClose once', async () => {
    edge.mockReturnValue('trailing');
    const onClose = jest.fn();
    await render(<Sheet onClose={onClose} />);
    await fireEvent.press(screen.getByTestId('zs-bottom-sheet-backdrop'));
    expect(onClose).not.toHaveBeenCalled();
    await screen.rerender(<Sheet open={false} onClose={onClose} />);
    await act(() => jest.runOnlyPendingTimers());
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('blocks outside taps and swipe dismissal when nondismissible, but allows programmatic close', async () => {
    edge.mockReturnValue('trailing');
    const onClose = jest.fn();
    await render(<Sheet dismissible={false} onClose={onClose} />);
    await fireEvent.press(screen.getByTestId('zs-bottom-sheet-backdrop'));
    await act(() => lastPan().__config.onDeactivate({ translationY: 200, velocityY: 1500 }));
    await act(() => jest.runOnlyPendingTimers());
    expect(onClose).not.toHaveBeenCalled();
    await screen.rerender(<Sheet open={false} dismissible={false} onClose={onClose} />);
    await act(() => jest.runOnlyPendingTimers());
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('swipes between detents before dismissing from the smallest one', async () => {
    edge.mockReturnValue('leading');
    const onClose = jest.fn();
    await render(<Sheet onClose={onClose} snapPoints={['50%', '100%']} />);
    const height = () => StyleSheet.flatten(screen.getByTestId('zs-bottom-sheet-window').props.style).height;
    const start = height();
    await act(() => lastPan().__config.onDeactivate({ translationY: -100, velocityY: -500 }));
    expect(height()).toBeGreaterThan(start);
    await act(() => lastPan().__config.onDeactivate({ translationY: 100, velocityY: 500 }));
    expect(height()).toBe(start);
    expect(onClose).not.toHaveBeenCalled();
    await act(() => lastPan().__config.onDeactivate({ translationY: 200, velocityY: 1500 }));
    await act(() => jest.runOnlyPendingTimers());
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
