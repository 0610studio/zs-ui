import React from 'react';
import { act, fireEvent, render as rtlRender, screen } from '@testing-library/react-native';
import { Platform, StyleSheet, Text } from 'react-native';
import { NavigationContext } from 'expo-router/react-navigation';
import ZSScreen from '../../ui/ZSScreen';
import ZSKeyboardStickyView from '../../ui/ZSKeyboardStickyView';
import { BottomBarStoreContext, createBottomBarStore, type BottomBarStore } from '../../context/BottomBarContext';
import { LayoutProvider } from '../../layout/LayoutProvider';
import type { WindowObserverProps } from '../../layout/WindowObserver.types';

jest.mock('../../layout/WindowObserver', () => ({
  __esModule: true,
  default: ({ children }: WindowObserverProps) => children,
}));

jest.mock('../../context/ThemeContext', () => require('../utils/theme').mockThemeModule());

let mockInsetBottom = 0;
let mockWindowY = 0;
let mockStickyY = 0;

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, ...props }: any) => React.createElement('SafeAreaView', props, children),
    SafeAreaProvider: ({ children, ...props }: any) => React.createElement('SafeAreaProvider', props, children),
    useSafeAreaInsets: () => ({ top: 0, bottom: mockInsetBottom, left: 0, right: 0 }),
  };
});

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  const React = require('react');
  return {
    ...RN,
    View: React.forwardRef((props: any, ref: any) => {
      React.useImperativeHandle(ref, () => ({ measureInWindow: (callback: (...frame: number[]) => void) => callback(0, props.testID === 'sticky' ? mockStickyY : mockWindowY, 400, 0) }));
      return React.createElement('View', props, props.children);
    }),
  };
});

function createNavigation(focused = true) {
  const listeners: Record<string, Set<() => void>> = { focus: new Set(), blur: new Set() };
  let isFocused = focused;
  return {
    isFocused: () => isFocused,
    addListener: (event: 'focus' | 'blur', callback: () => void) => {
      listeners[event]!.add(callback);
      return () => listeners[event]!.delete(callback);
    },
    emit(event: 'focus' | 'blur') {
      isFocused = event === 'focus';
      listeners[event]!.forEach((callback) => callback());
    },
  };
}

type Navigation = ReturnType<typeof createNavigation>;

function Screen({ store, navigation, bottom }: { store: BottomBarStore | null; navigation?: Navigation; bottom?: React.ReactNode }) {
  return (
    <LayoutProvider>
      <BottomBarStoreContext.Provider value={store}>
        <NavigationContext.Provider value={navigation as never}>
          <ZSScreen bottomComponent={bottom}>
            <Text>화면</Text>
          </ZSScreen>
        </NavigationContext.Provider>
      </BottomBarStoreContext.Provider>
    </LayoutProvider>
  );
}

const platform = Platform as { OS: string };

describe('ZSScreen — 아래 가림 윗변 알리기(스낵바 바닥)', () => {
  beforeEach(() => {
    platform.OS = 'ios';
    mockInsetBottom = 0;
    mockWindowY = 0;
    mockStickyY = 0;
  });

  afterEach(() => {
    platform.OS = 'ios';
  });

  it.each(['ios', 'android'])('%s — 포커스된 화면은 아래 고정 영역(bottomComponent)의 창 기준 윗변을 알린다', async (os) => {
    platform.OS = os;
    mockWindowY = 744;
    const store = createBottomBarStore();
    await rtlRender(<Screen store={store} navigation={createNavigation()} bottom={<Text>기록하기</Text>} />);
    expect(store.get()?.top).toBe(744);
  });

  it('아래 고정 영역이 없으면 화면 아래 safe area 가 시작하는 점을 잰다 — iOS 는 뿌리가 아래 safe area 를 비우지 않아 그만큼 띄운다', async () => {
    mockInsetBottom = 34;
    mockWindowY = 810;
    const store = createBottomBarStore();
    await rtlRender(<Screen store={store} navigation={createNavigation()} />);
    expect(store.get()?.top).toBe(810);
    const probe = StyleSheet.flatten(screen.getByTestId('zs-screen-bottom-probe', { includeHiddenElements: true }).props.style);
    expect(probe).toMatchObject({ position: 'absolute', bottom: 34, width: 0, height: 0 });
  });

  it('Android 는 뿌리가 아래 safe area 를 이미 비워 점을 바닥(0)에 둔다', async () => {
    platform.OS = 'android';
    mockInsetBottom = 48;
    const store = createBottomBarStore();
    await rtlRender(<Screen store={store} navigation={createNavigation()} />);
    const probe = StyleSheet.flatten(screen.getByTestId('zs-screen-bottom-probe', { includeHiddenElements: true }).props.style);
    expect(probe).toMatchObject({ position: 'absolute', bottom: 0 });
  });

  it('아래 고정 영역이 붙는 뷰(ZSKeyboardStickyView, absolute)면 그 윗변이 더 높을 때 그것을 알린다 — 슬롯 높이가 0 이라 측정 점은 화면 끝이다', async () => {
    mockWindowY = 2361;
    mockStickyY = 2200;
    const store = createBottomBarStore();
    await rtlRender(
      <Screen
        store={store}
        navigation={createNavigation()}
        bottom={
          <ZSKeyboardStickyView testID="sticky">
            <Text>다음</Text>
          </ZSKeyboardStickyView>
        }
      />,
    );
    await act(() => fireEvent(screen.getByTestId('sticky'), 'layout', { nativeEvent: { layout: { x: 0, y: 0, width: 400, height: 80 } } }));
    expect(store.get()?.top).toBe(2200);
  });

  it('떠나면(blur·언마운트) 자기 값만 지우고, 돌아오면(focus) 다시 알린다', async () => {
    mockWindowY = 744;
    const store = createBottomBarStore();
    const first = createNavigation();
    const view = await rtlRender(<Screen store={store} navigation={first} bottom={<Text>기록하기</Text>} />);
    const owner = store.get()?.owner;
    expect(store.get()?.top).toBe(744);

    await act(() => first.emit('blur'));
    expect(store.get()).toBeNull();
    await act(() => first.emit('focus'));
    expect(store.get()).toEqual({ owner, top: 744 });

    store.set({ owner: -1, top: 700 });
    await act(() => first.emit('blur'));
    expect(store.get()).toEqual({ owner: -1, top: 700 });

    store.set({ owner: owner!, top: 744 });
    await view.unmount();
    expect(store.get()).toBeNull();
  });

  it('포커스가 아닌 화면·내비게이터 밖(시트 안)·OverlayProvider 밖은 알리지 않는다', async () => {
    mockWindowY = 744;
    const cases: { store: BottomBarStore | null; navigation?: Navigation }[] = [
      { store: createBottomBarStore(), navigation: createNavigation(false) },
      { store: createBottomBarStore() },
      { store: null, navigation: createNavigation() },
    ];
    for (const { store, navigation } of cases) {
      const view = await rtlRender(<Screen store={store} navigation={navigation} bottom={<Text>기록하기</Text>} />);
      expect(store?.get() ?? null).toBeNull();
      await view.unmount();
    }
  });
});
