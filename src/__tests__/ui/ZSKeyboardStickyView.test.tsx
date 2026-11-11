import React from 'react';
import { act, fireEvent, render as rtlRender } from '@testing-library/react-native';
import { Platform, StyleSheet, Text } from 'react-native';
import ZSKeyboardStickyView from '../../ui/ZSKeyboardStickyView';
import { LayoutProvider } from '../../layout/LayoutProvider';
import type { WindowObserverProps } from '../../layout/WindowObserver.types';
import { getTestTheme } from '../utils/theme';
import { queryAllByHostType } from '../utils/hostQueries';
import { TabBarInsetContext } from '../../navigation/useTabBarInset';

let observe: WindowObserverProps['onObserve'] = () => {};

jest.mock('../../layout/WindowObserver', () => ({
  __esModule: true,
  default: ({ onObserve, children }: WindowObserverProps) => {
    observe = onObserve;
    return children;
  },
}));

const render = (ui: React.ReactElement) => rtlRender(ui, { wrapper: LayoutProvider });

const contentStyleOf = (tree: Awaited<ReturnType<typeof render>>, text: string) => {
  let host = tree.getByText(text).parent;
  while (host && typeof host.type !== 'string') host = host.parent;
  return StyleSheet.flatten(host?.props.style);
};

jest.mock('../../context/ThemeContext', () => require('../utils/theme').mockThemeModule());

jest.mock('../../model/useKeyboard', () => ({
  __esModule: true,
  default: () => ({
    isKeyboardVisible: false,
    keyboardHeight: 0,
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34 }),
}));

describe('ZSKeyboardStickyView', () => {
  it('children을 렌더한다', async () => {
    const { getByText } = await render(
      <ZSKeyboardStickyView>
        <Text>Test Content</Text>
      </ZSKeyboardStickyView>
    );

    expect(getByText('Test Content')).toBeTruthy();
  });

  it('keyboardShowOffset prop을 받는다', async () => {
    const { getByText } = await render(
      <ZSKeyboardStickyView keyboardShowOffset={10}>
        <Text>Test Content</Text>
      </ZSKeyboardStickyView>
    );

    expect(getByText('Test Content')).toBeTruthy();
  });

  it('keyboardHideOffset prop을 받는다', async () => {
    const { getByText } = await render(
      <ZSKeyboardStickyView keyboardHideOffset={20}>
        <Text>Test Content</Text>
      </ZSKeyboardStickyView>
    );

    expect(getByText('Test Content')).toBeTruthy();
  });

  it('showOnlyKeyboardVisible이 true일 때 키보드가 보일 때만 표시한다', async () => {
    jest.spyOn(require('../../model/useKeyboard'), 'default').mockReturnValue({
      isKeyboardVisible: false,
      keyboardHeight: 0,
    });

    const { getByText } = await render(
      <ZSKeyboardStickyView showOnlyKeyboardVisible>
        <Text>Test Content</Text>
      </ZSKeyboardStickyView>
    );

    expect(getByText('Test Content')).toBeTruthy();
  });

  it('onLayout 을 루트 뷰에 전달한다', async () => {
    const onLayout = jest.fn();
    const tree = await render(
      <ZSKeyboardStickyView testID="above" onLayout={onLayout}>
        <Text>Test Content</Text>
      </ZSKeyboardStickyView>
    );

    const layoutEvent = { nativeEvent: { layout: { x: 0, y: 0, width: 390, height: 64 } } };
    await fireEvent(tree.getByTestId('above'), 'layout', layoutEvent);
    expect(onLayout).toHaveBeenCalledWith(layoutEvent);
  });

  it('사용자 style 은 내부 absolute 배치 위에 합쳐진다', async () => {
    const tree = await render(
      <ZSKeyboardStickyView testID="above" style={{ paddingHorizontal: 16 }}>
        <Text>Test Content</Text>
      </ZSKeyboardStickyView>
    );

    expect(StyleSheet.flatten(tree.getByTestId('above').props.style)).toMatchObject({
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 16,
    });
  });

  it('기본은 전폭 — ZSScreen 과 같은 maxContentWidth 를 주면 같은 열에 맞춘다(absolute 라 감싼 뷰의 폭 제한을 받지 않는다)', async () => {
    const wide = { width: 1210, height: 834, horizontalSizeClass: 'regular', verticalSizeClass: 'regular', readableWidth: 896 } as const;
    const full = await render(<ZSKeyboardStickyView><Text>CTA</Text></ZSKeyboardStickyView>);
    await act(() => observe(wide));
    expect(contentStyleOf(full, 'CTA').maxWidth).toBeUndefined();
    await full.unmount();

    const tree = await render(<ZSKeyboardStickyView maxContentWidth="readable"><Text>CTA</Text></ZSKeyboardStickyView>);
    await act(() => observe(wide));
    expect(contentStyleOf(tree, 'CTA').maxWidth).toBe(896);
    await act(() => observe({ width: 402, height: 874, horizontalSizeClass: 'compact', verticalSizeClass: 'regular', readableWidth: 386 }));
    expect(contentStyleOf(tree, 'CTA').maxWidth).toBeUndefined();
  });

  it('backgroundColor 는 테마 색 이름이면 그 색으로 칠하고, 직접 지정한 색은 그대로 쓴다', async () => {
    const { colors } = getTestTheme();
    const named = await render(<ZSKeyboardStickyView backgroundColor="surface2"><Text>이름</Text></ZSKeyboardStickyView>);
    expect(contentStyleOf(named, '이름').backgroundColor).toBe(colors.surface2);
    await named.unmount();

    const raw = await render(<ZSKeyboardStickyView backgroundColor="rgba(0, 0, 0, 0.5)"><Text>직접</Text></ZSKeyboardStickyView>);
    expect(contentStyleOf(raw, '직접').backgroundColor).toBe('rgba(0, 0, 0, 0.5)');
  });

  it('backgroundColor 가 없으면 칠하지 않는다', async () => {
    const tree = await render(<ZSKeyboardStickyView><Text>CTA</Text></ZSKeyboardStickyView>);
    expect(contentStyleOf(tree, 'CTA').backgroundColor).toBeUndefined();
  });
});

describe('ZSKeyboardStickyView 떠 있는 탭 바 (Android 탭 기본)', () => {
  const platform = Platform as { OS: string };
  afterEach(() => {
    platform.OS = 'ios';
    jest.restoreAllMocks();
  });

  it('키보드가 탭 바를 덮으므로 ZSScreen 이 탭 바 위로 올린 만큼 덜 올린다', async () => {
    platform.OS = 'android';
    jest.spyOn(require('../../model/useKeyboard'), 'default').mockReturnValue({ isKeyboardVisible: true, keyboardHeight: 300 });
    const tree = await render(
      <TabBarInsetContext.Provider value={84}>
        <ZSKeyboardStickyView>
          <Text>CTA</Text>
        </ZSKeyboardStickyView>
      </TabBarInsetContext.Provider>,
    );
    const inner = queryAllByHostType('View', tree.container).find((node: any) => StyleSheet.flatten(node.props.style)?.paddingBottom !== undefined);
    expect(StyleSheet.flatten(inner?.props.style).paddingBottom).toBe(300 - 84);
  });
});
