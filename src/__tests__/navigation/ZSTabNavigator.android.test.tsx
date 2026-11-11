import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { Platform, StyleSheet, Text } from 'react-native';
import { HeaderHeightContext } from 'expo-router/react-navigation';
import type { TestInstance } from 'test-renderer';
import ZSTabNavigator from '../../navigation/ZSTabNavigator.android';
import { appendPlaceholderDescriptors, appendPlaceholderRoutes } from '../../navigation/tabPlaceholders';
import { getByHostType, nth, queryAllByHostType } from '../utils/hostQueries';
import { getTestTheme, setTestTheme } from '../utils/theme';
import { HeaderFillContext } from '../../navigation/headerFill';
import { useTabBarInset } from '../../navigation/useTabBarInset';
import { withOpacity } from '../../theme/color';

jest.mock('expo', () => {
  const React = require('react');
  return {
    requireNativeView: (_module: string, name: string) => (props: any) => React.createElement(name, props, props.children),
  };
});

jest.mock('react-native-screens', () => {
  const React = require('react');
  const host = (name: string) => (props: any) => React.createElement(name, props, props.children);
  return { Screen: host('Screen'), ScreenContainer: host('ScreenContainer') };
});

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const inset = { top: 0, left: 0, right: 0, bottom: 0 };
  return {
    SafeAreaProvider: (props: any) => React.createElement('SafeAreaProvider', props, props.children),
    useSafeAreaInsets: () => inset,
  };
});

jest.mock(
  'expo-symbols',
  () => ({
    unstable_getMaterialSymbolSourceAsync: jest.fn((name: string) =>
      name === 'slow' ? new Promise(() => {}) : Promise.resolve({ uri: `file:///symbols/${name}.png` })),
  }),
  { virtual: true },
);

jest.mock('../../context/ThemeContext', () => require('../utils/theme').mockThemeModule());

let mockWindowY: number | null = null;

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  const React = require('react');
  return {
    ...RN,
    View: React.forwardRef((props: any, ref: any) => {
      React.useImperativeHandle(ref, () =>
        mockWindowY === null ? {} : { measureInWindow: (callback: (...frame: number[]) => void) => callback(0, mockWindowY!, 750, 832) });
      return React.createElement('View', props, props.children);
    }),
  };
});

let mockWidthClass = 'compact';
let mockHeightClass = 'medium';
let mockPosture = 'unknown';
let mockBarAxis = 'vertical';
jest.mock('../../layout/LayoutContext', () => ({
  useWindowLayout: () => ({ widthClass: mockWidthClass, heightClass: mockHeightClass }),
  useDevicePosture: () => ({ posture: mockPosture }),
  useBarAxis: () => [mockBarAxis, jest.fn()],
}));

const FONTS = { 400: 'Pretendard-Regular', 500: 'Pretendard-Medium', 600: 'Pretendard-SemiBold' };
const platform = Platform as { OS: string; Version?: number | string };

type Content = React.ComponentType<any> & {};

function navigatorParts() {
  const { createdNavigators } = require('expo-router');
  const navigator = createdNavigators[createdNavigators.length - 1];
  return { Content: navigator.content as Content, options: navigator.options };
}

const ROUTES = [
  { key: 'feed-1', name: 'feed', href: undefined },
  { key: 'profile', name: 'profile', href: undefined },
  { key: 'secret-1', name: 'secret', href: undefined },
];

async function setup(
  overrides: { index?: number; android?: object; descriptors?: Record<string, any>; headerHeight?: number; unselectedIconColor?: string; unselectedLabelColor?: string } = {},
) {
  const descriptors = {
    'feed-1': { options: { title: '피드', icon: { md: 'list' } }, render: () => <Text>feed scene</Text> },
    profile: { options: { title: '프로필', icon: { drawable: 'ic_person', md: 'person' }, badge: 2 }, render: () => <Text>profile scene</Text> },
    'secret-1': { options: { title: '숨김', hidden: true }, render: () => <Text>secret scene</Text> },
    ...overrides.descriptors,
  };
  const actions = { navigate: jest.fn(), back: jest.fn() };
  const emitter = { emit: jest.fn(() => ({ defaultPrevented: false })) };
  const { Content } = navigatorParts();
  const props = (index: number) => ({
    state: { index, routes: ROUTES },
    descriptors,
    actions,
    emitter,
    android: overrides.android,
    unselectedIconColor: overrides.unselectedIconColor,
    unselectedLabelColor: overrides.unselectedLabelColor,
  });
  const withHeader = (ui: React.ReactElement) =>
    overrides.headerHeight === undefined ? ui : <HeaderHeightContext.Provider value={overrides.headerHeight}>{ui}</HeaderHeightContext.Provider>;
  const view = await render(withHeader(<Content {...props(overrides.index ?? 0)} />));
  await act(async () => {});
  return {
    ...view,
    actions,
    emitter,
    rerenderAt: (index: number) => view.rerender(withHeader(<Content {...props(index)} />)),
    tabBar: () => getByHostType('ZSTabBarView', view.container),
    screens: () =>
      queryAllByHostType('Screen', view.container)
        .map((node) => [node.props.children.props.children.props.children.props.children.props.children, node.props.activityState]),
  };
}

const press = (tabBar: TestInstance, key: string) => act(() => tabBar.props.onTabPress({ nativeEvent: { key } }));

describe('ZSTabNavigator Android', () => {
  beforeEach(() => {
    platform.OS = 'android';
    setTestTheme({ fonts: FONTS, platform: 'android' });
    mockWidthClass = 'compact';
    mockHeightClass = 'medium';
    mockPosture = 'unknown';
    mockBarAxis = 'vertical';
  });
  afterEach(() => {
    platform.OS = 'ios';
  });

  it('ZSTabNavigator.Screen 을 내비게이터 Screen 으로 넘기고 android 옵션·비선택 색을 전달한다', async () => {
    const tabPress = jest.fn();
    const root = (await render(
      <ZSTabNavigator android={{ navigationMode: 'rail' }} unselectedIconColor="textSecondary" unselectedLabelColor="#888888">
        <ZSTabNavigator.Screen name="feed" options={{ title: '피드' }} />
        <ZSTabNavigator.Screen name="profile" options={{ title: '프로필', badge: true }} listeners={{ tabPress }} />
      </ZSTabNavigator>,
    )).container;
    expect(getByHostType('Navigator', root).props).toMatchObject({
      android: { navigationMode: 'rail' },
      unselectedIconColor: 'textSecondary',
      unselectedLabelColor: '#888888',
    });
    const screens = queryAllByHostType('Navigator.Screen', root);
    expect(screens.map((node) => [node.props.name, node.props.options, node.props.listeners])).toEqual([
      ['feed', { title: '피드' }, undefined],
      ['profile', { title: '프로필', badge: true }, { tabPress }],
    ]);
  });

  it('아직 열지 않은 탭도 보이도록 자리 표시 처리를 쓴다', async () => {
    const { options } = navigatorParts();
    expect(options).toEqual({ processDescriptors: appendPlaceholderDescriptors, processState: appendPlaceholderRoutes });
  });

  it('딥링크 뒤에도 뒤로 갈 탭이 history 에 남도록 expo-router 탭 history 보정을 쓴다', async () => {
    const { unstable_useReconcileTabHistory } = require('expo-router');
    unstable_useReconcileTabHistory.mockClear();
    await setup();
    expect(unstable_useReconcileTabHistory).toHaveBeenCalledWith();
  });

  it('compact 창은 하단 바(아이콘 위 라벨) — 기본은 장면 위에 뜬 알약, 알약 크기만 한 뷰를 아래 가운데에 둔다', async () => {
    const { tabBar, container } = await setup();
    expect(tabBar().props).toMatchObject({ mode: 'bar', testID: 'zs-tab-navigator-bar', selectedKey: 'feed-1', iconPosition: 'top', dark: false, floating: true });
    const views = queryAllByHostType('View', container);
    const layout = nth(views, 0);
    const host = nth(views, 1);
    expect(layout.props.style).toEqual([{ flex: 1 }, { flexDirection: 'column' }]);
    expect(layout.children.map((child: any) => child.type)).toEqual(['ZSTabsContentView', 'View']);
    expect(host.props.pointerEvents).toBe('box-none');
    expect(host.props.style).toEqual([{ position: 'absolute', start: 0, end: 0, alignItems: 'center' }, { bottom: 12 }]);
    const pill = host.children[0] as TestInstance;
    expect(pill.props.pointerEvents).toBe('box-none');
    expect(pill.children.map((child: any) => child.type)).toEqual(['ZSTabBarView']);
    expect(tabBar().props.colors.background).toBe('transparent');
    await act(() => tabBar().props.onLayout({ nativeEvent: { layout: { x: 0, y: 0, width: 280, height: 70 } } }));
    expect(pill.children.map((child: any) => child.type)).toEqual(['View', 'View', 'View', 'ZSTabBarView']);
    await act(() => tabBar().props.onLayout({ nativeEvent: { layout: { x: 0, y: 0, width: 0, height: 0 } } }));
    expect(pill.children.map((child: any) => child.type)).toEqual(['ZSTabBarView']);
  });

  describe('알약 바탕 — 막(veil): 블러 + 막 + 얇은 테두리 + 떠 있는 그림자', () => {
    const layersOf = async () => {
      const view = await setup();
      await act(() => view.tabBar().props.onLayout({ nativeEvent: { layout: { x: 0, y: 0, width: 280, height: 70 } } }));
      const layers = (getByHostType('ZSTabBarView', view.container).parent?.children ?? []) as TestInstance[];
      const [shadow, clip, outline] = [nth(layers, 0), nth(layers, 1), nth(layers, 2)];
      return { container: view.container, shadow, clip, outline, veil: nth(clip.children as TestInstance[], 1) };
    };
    const sigmaDpOf = (intensity: number, reduction: number) => (0.57735 * ((intensity * 4) / reduction) + 0.5) / 3;

    afterEach(() => {
      delete platform.Version;
    });

    it('라이트: 장면 전체를 흐린 블러 + 흰(surface1) 80% 막, 맨 위 먹 8% 머리카락 테두리, 바깥 SHADOW.md 그림자', async () => {
      const theme = setTestTheme({ fonts: FONTS, platform: 'android' });
      const { container, shadow, clip, outline, veil } = await layersOf();
      const target = getByHostType('BlurTargetView', container);
      expect(getByHostType('ZSTabsContentView', container).children[0]).toBe(target);
      const blur = getByHostType('BlurView', container);
      expect(blur.props.blurTarget).toBe(target.props.forwardedRef);
      expect(blur.props).toMatchObject({ blurMethod: 'dimezisBlurViewSdk31Plus', tint: 'light', intensity: 12 });
      expect(sigmaDpOf(blur.props.intensity, blur.props.blurReductionFactor)).toBeCloseTo(22, 5);
      expect(StyleSheet.flatten(shadow.props.style)).toMatchObject({ borderRadius: 999, top: 4, start: 4, boxShadow: theme.shadows.md.boxShadow });
      expect(StyleSheet.flatten(shadow.props.style).opacity).toBeUndefined();
      expect(StyleSheet.flatten(outline.props.style)).toMatchObject({ borderRadius: 999, borderWidth: StyleSheet.hairlineWidth, borderColor: withOpacity(theme.colors.text, 0.08) });
      expect(StyleSheet.flatten(clip.props.style)).toMatchObject({ borderRadius: 999, overflow: 'hidden' });
      expect(StyleSheet.flatten(veil.props.style)).toMatchObject({ backgroundColor: theme.colors.surface1, opacity: 0.8 });
    });

    it('다크: #2A2A2A 80% 막(바탕과 구분), 흰 10% 테두리, 어두운 tint', async () => {
      const theme = setTestTheme({ fonts: FONTS, platform: 'android', mode: 'dark' });
      const { container, outline, veil } = await layersOf();
      expect(getByHostType('BlurView', container).props.tint).toBe('dark');
      expect(StyleSheet.flatten(veil.props.style)).toMatchObject({ backgroundColor: '#2A2A2A', opacity: 0.8 });
      expect(StyleSheet.flatten(outline.props.style).borderColor).toBe(withOpacity(theme.colors.text, 0.1));
    });

    it('Android 11 이하(흐리지 않음)는 막을 96% 로 — 31 이상은 80%', async () => {
      const theme = setTestTheme({ fonts: FONTS, platform: 'android' });
      platform.Version = 30;
      const old = await layersOf();
      expect(StyleSheet.flatten(old.veil.props.style)).toMatchObject({ backgroundColor: theme.colors.surface1, opacity: 0.96 });
      await act(async () => {});
      platform.Version = 31;
      const current = await layersOf();
      expect(StyleSheet.flatten(current.veil.props.style).opacity).toBe(0.8);
    });
  });

  it("android.barStyle 'standard' 면 장면 아래에 붙은 M3 바", async () => {
    const { tabBar, container } = await setup({ android: { barStyle: 'standard' } });
    expect(tabBar().props).toMatchObject({ mode: 'bar', floating: false });
    const layout = getByHostType('View', container);
    expect(layout.children.map((child: any) => child.type)).toEqual(['ZSTabsContentView', 'ZSTabBarView']);
  });

  it('알약이 덮는 높이(알약 + 아래 여백 12 + 콘텐츠 간격 10)를 탭 화면에 알린다 — standard·레일은 0', async () => {
    function Inset() {
      return <Text>{`inset-${useTabBarInset()}`}</Text>;
    }
    const descriptors = { 'feed-1': { options: { title: '피드' }, render: () => <Inset /> } };
    const floating = await setup({ descriptors });
    expect(floating.getByText('inset-0')).toBeTruthy();
    await act(() => floating.tabBar().props.onLayout({ nativeEvent: { layout: { x: 0, y: 0, width: 280, height: 72 } } }));
    expect(floating.getByText('inset-94')).toBeTruthy();
    await floating.unmount();

    const standard = await setup({ descriptors, android: { barStyle: 'standard' } });
    await act(() => standard.tabBar().props.onLayout({ nativeEvent: { layout: { x: 0, y: 0, width: 750, height: 96 } } }));
    expect(standard.getByText('inset-0')).toBeTruthy();
    await standard.unmount();

    mockWidthClass = 'medium';
    const rail = await setup({ descriptors });
    await act(() => rail.tabBar().props.onLayout({ nativeEvent: { layout: { x: 0, y: 0, width: 96, height: 600 } } }));
    expect(rail.getByText('inset-0')).toBeTruthy();
  });

  it('탭 화면마다 SafeAreaProvider 를 둔다 — inset 을 앱 루트(창)가 아니라 탭 화면 위치로 잰다(iOS NativeTabs 와 같다)', async () => {
    const { container, rerenderAt } = await setup();
    await rerenderAt(1);
    const screens = queryAllByHostType('Screen', container);
    expect(screens).toHaveLength(2);
    screens.forEach((node) => {
      expect(node.children.map((child: any) => child.type)).toEqual(['SafeAreaProvider']);
    });
  });

  it('medium 이상은 시작 측 레일 — row-reverse 라 장면 뷰 순서는 그대로', async () => {
    mockWidthClass = 'medium';
    const { tabBar, container } = await setup();
    expect(tabBar().props).toMatchObject({ mode: 'rail', testID: 'zs-tab-navigator-rail', iconPosition: 'start' });
    const layout = getByHostType('View', container);
    expect(layout.props.style).toEqual([{ flex: 1 }, { flexDirection: 'row-reverse' }]);
    expect(layout.children.map((child: any) => child.type)).toEqual(['ZSTabsContentView', 'ZSTabBarView']);
  });

  it('넓은 창이어도 높이가 compact 면(폰 가로) 하단 바 — 넓은 바는 아이콘 앞 라벨(M3 Expressive)', async () => {
    mockWidthClass = 'expanded';
    mockHeightClass = 'compact';
    const { tabBar } = await setup();
    expect(tabBar().props).toMatchObject({ mode: 'bar', iconPosition: 'start' });
  });

  it('테이블탑 자세면 아래 반쪽에 하단 바', async () => {
    mockWidthClass = 'medium';
    mockPosture = 'tabletop';
    const { tabBar } = await setup();
    expect(tabBar().props.mode).toBe('bar');
  });

  it("LayoutProvider barAxis 'horizontal' 이면 medium 창(폴더블 펼침)도 하단 바 — 아이콘 앞 라벨", async () => {
    mockWidthClass = 'medium';
    mockBarAxis = 'horizontal';
    const { tabBar } = await setup();
    expect(tabBar().props).toMatchObject({ mode: 'bar', testID: 'zs-tab-navigator-bar', iconPosition: 'start' });
  });

  it("barAxis 'horizontal' 이면 expanded 창(태블릿 가로)도 알약 하단 바", async () => {
    mockWidthClass = 'expanded';
    mockBarAxis = 'horizontal';
    const { tabBar } = await setup();
    expect(tabBar().props).toMatchObject({ mode: 'bar', floating: true, iconPosition: 'start' });
  });

  it("android.navigationMode 를 지정하면 창 크기와 상관없이 그 모드", async () => {
    mockWidthClass = 'expanded';
    const { tabBar } = await setup({ android: { navigationMode: 'bar' } });
    expect(tabBar().props).toMatchObject({ mode: 'bar', hideOnKeyboard: false });
    expect(tabBar().props).not.toHaveProperty('labelVisibilityMode');
  });

  it('다크 테마면 dark 를 넘긴다', async () => {
    setTestTheme({ fonts: FONTS, platform: 'android', mode: 'dark' });
    const { tabBar } = await setup();
    expect(tabBar().props.dark).toBe(true);
  });

  it('앱 글자 확대 상한을 넘긴다 — 라벨·뱃지는 이것과 바 상한(1.3) 중 작은 쪽까지 커진다', async () => {
    const { tabBar } = await setup();
    expect(tabBar().props.maxFontScale).toBe(2);
    setTestTheme({ fonts: FONTS, platform: 'android', maxFontSizeMultiplier: 1.2 });
    const next = await setup();
    expect(next.tabBar().props.maxFontScale).toBe(1.2);
  });

  it('android.hideOnKeyboard 를 네이티브 탭 UI 로 넘긴다 (기본 false)', async () => {
    const { tabBar } = await setup({ android: { hideOnKeyboard: true } });
    expect(tabBar().props.hideOnKeyboard).toBe(true);
  });

  it('숨긴 탭은 항목에서 빼고, 아이콘은 drawable → md 순, 뱃지는 문자열로 — 라우트 이름은 항목 testTag 용으로 넘긴다', async () => {
    const { tabBar } = await setup();
    expect(tabBar().props.items).toStrictEqual([
      { key: 'feed-1', name: 'feed', title: '피드', icon: 'file:///symbols/list.png', badge: undefined, accessibilityLabel: undefined },
      { key: 'profile', name: 'profile', title: '프로필', icon: 'ic_person', badge: '2', accessibilityLabel: undefined },
    ]);
  });

  it('accessibilityLabel 을 항목에 넘긴다 — 네이티브가 contentDescription 으로 단다', async () => {
    const { tabBar } = await setup({
      descriptors: { profile: { options: { title: '프로필', accessibilityLabel: '내 프로필 탭' }, render: () => null } },
    });
    expect(tabBar().props.items.map((item: any) => [item.key, item.accessibilityLabel])).toEqual([
      ['feed-1', undefined],
      ['profile', '내 프로필 탭'],
    ]);
  });

  it('md 아이콘을 그리는 동안은 src 로, src 는 에셋 uri 로', async () => {
    const { tabBar } = await setup({
      descriptors: {
        'feed-1': { options: { title: '피드', icon: { md: 'slow', src: 7 } }, render: () => null },
        profile: { options: { title: '프로필', icon: { src: { uri: 'https://example.com/p.png' } } }, render: () => null },
      },
    });
    expect(tabBar().props.items.map((item: any) => item.icon)).toEqual(['asset://7', 'https://example.com/p.png']);
  });

  it.each(['rejected', 'empty'])('md 변환이 %s 로 실패해도 src를 유지하고 다음 마운트에서 재시도한다', async (failure) => {
    const renderSymbol = jest.requireMock('expo-symbols').unstable_getMaterialSymbolSourceAsync as jest.Mock;
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const name = `retry-${failure}`;
    const options = {
      descriptors: {
        'feed-1': { options: { title: '피드', icon: { md: name, src: 7 } }, render: () => null },
      },
    };
    if (failure === 'rejected') renderSymbol.mockRejectedValueOnce(new Error('font unavailable'));
    else renderSymbol.mockResolvedValueOnce(null);

    try {
      const first = await setup(options);
      expect(first.tabBar().props.items[0].icon).toBe('asset://7');
      await first.unmount();
      const second = await setup(options);
      expect(second.tabBar().props.items[0].icon).toBe(`file:///symbols/${name}.png`);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining(name));
    } finally {
      warn.mockRestore();
    }
  });

  it('M3 내비게이션 바 역할을 탭 색으로(선택은 주색 표시색 primaryMark·surface4 바탕), 라벨은 500 굵기 브랜드 서체로 넘긴다', async () => {
    const { colors } = setTestTheme({ fonts: FONTS, platform: 'android' });
    const { tabBar } = await setup({ android: { barStyle: 'standard' } });
    expect(tabBar().props.colors).toEqual({
      background: colors.surface3,
      selected: colors.primaryMark,
      selectedLabel: colors.primaryMark,
      unselectedIcon: colors.text,
      unselectedLabel: colors.text,
      indicator: colors.surface4,
      ripple: `${colors.text}1a`,
      badgeBackground: colors.error,
      badgeText: colors.onError,
    });
    expect(tabBar().props.fontFamily).toBe('Pretendard-Medium');
  });

  it('unselectedIconColor·unselectedLabelColor 를 비선택 아이콘·라벨 색으로 넘긴다 — 색 역할 이름은 테마 색으로', async () => {
    const { colors } = setTestTheme({ fonts: FONTS, platform: 'android' });
    const { tabBar } = await setup({ unselectedIconColor: 'textSecondary', unselectedLabelColor: '#888888' });
    expect(tabBar().props.colors).toMatchObject({ unselectedIcon: colors.textSecondary, unselectedLabel: '#888888', selected: colors.primaryMark });
  });

  it('레일은 표면을 칠하지 않는다 — 레일 열·투명 헤더 영역이 화면 배경을 따른다 (하단 바는 자기 표면 유지)', async () => {
    mockWidthClass = 'medium';
    const { tabBar } = await setup();
    expect(tabBar().props.mode).toBe('rail');
    expect(tabBar().props.colors.background).toBe('transparent');
    expect(tabBar().props.colors.indicator).toBe(getTestTheme().colors.surface4);
  });

  it('연 탭만 그리고, 연 탭은 숨겨도 유지한다 (지연 마운트)', async () => {
    const { screens, rerenderAt } = await setup();
    expect(screens()).toEqual([['feed scene', 2]]);
    await rerenderAt(1);
    expect(screens()).toEqual([
      ['feed scene', 0],
      ['profile scene', 2],
    ]);
    await rerenderAt(0);
    expect(screens()).toEqual([
      ['feed scene', 2],
      ['profile scene', 0],
    ]);
  });

  it('다른 탭을 누르면 tabPress 를 보내고 그 탭으로 이동한다', async () => {
    const { tabBar, emitter, actions } = await setup();
    await press(tabBar(), 'profile');
    expect(emitter.emit).toHaveBeenCalledWith({ type: 'tabPress', target: 'profile', canPreventDefault: true });
    expect(actions.navigate).toHaveBeenCalledWith('profile', undefined);
  });

  it('선택된 탭을 다시 누르면 tabPress 만 보낸다 — 탭 안 Stack 이 맨 앞으로 돌아간다', async () => {
    const { tabBar, emitter, actions } = await setup();
    await press(tabBar(), 'feed-1');
    expect(emitter.emit).toHaveBeenCalledWith({ type: 'tabPress', target: 'feed-1', canPreventDefault: true });
    expect(actions.navigate).not.toHaveBeenCalled();
  });

  it('tabPress 를 preventDefault 하면 이동하지 않는다', async () => {
    const { tabBar, emitter, actions } = await setup();
    emitter.emit.mockReturnValueOnce({ defaultPrevented: true });
    await press(tabBar(), 'profile');
    expect(actions.navigate).not.toHaveBeenCalled();
  });

  it('disabled 탭을 누르면 tabPress 만 보내고 선택하지 않는다 (iOS NativeTabs disabled 와 같다)', async () => {
    const { tabBar, emitter, actions } = await setup({
      descriptors: { profile: { options: { title: '프로필', disabled: true }, render: () => null } },
    });
    await press(tabBar(), 'profile');
    expect(emitter.emit).toHaveBeenCalledWith({ type: 'tabPress', target: 'profile', canPreventDefault: true });
    expect(actions.navigate).not.toHaveBeenCalled();
    expect(tabBar().props.selectedKey).toBe('feed-1');
  });

  it('disabled 여도 탭 바에 남는다 — 숨김(hidden)과 다르다', async () => {
    const { tabBar } = await setup({
      descriptors: { profile: { options: { title: '프로필', disabled: true }, render: () => null } },
    });
    expect(tabBar().props.items.map((item: any) => item.key)).toEqual(['feed-1', 'profile']);
  });

  it('모르는 key 는 무시한다', async () => {
    const { tabBar, emitter } = await setup();
    await press(tabBar(), 'unknown');
    expect(emitter.emit).not.toHaveBeenCalled();
  });
});

describe('ZSTabNavigator Android — 투명 헤더 아래 레일', () => {
  const marginTopOf = (tabBar: TestInstance) => tabBar.props.style?.marginTop;

  beforeEach(() => {
    platform.OS = 'android';
    mockWidthClass = 'medium';
    mockWindowY = null;
  });
  afterEach(() => {
    platform.OS = 'ios';
    mockWidthClass = 'compact';
    mockWindowY = null;
  });

  it('레일은 헤더 높이(상태바 포함)만큼 내려 헤더 아래에서 시작한다 — 장면은 헤더 뒤까지 깔린다', async () => {
    const { tabBar } = await setup({ headerHeight: 80 });
    expect(tabBar().props.mode).toBe('rail');
    expect(marginTopOf(tabBar())).toBe(80);
  });

  it('탭 루트가 창 위끝에 있다고 재면 그대로 내린다', async () => {
    mockWindowY = 0;
    const view = await setup({ headerHeight: 80 });
    await fireEvent(view.tabBar().parent!, 'layout', { nativeEvent: { layout: { x: 0, y: 0, width: 750, height: 832 } } });
    expect(marginTopOf(view.tabBar())).toBe(80);
  });

  it('불투명 헤더 아래(탭 루트가 헤더 아래에서 시작)면 내리지 않는다', async () => {
    mockWindowY = 80;
    const view = await setup({ headerHeight: 80 });
    await fireEvent(view.tabBar().parent!, 'layout', { nativeEvent: { layout: { x: 0, y: 80, width: 750, height: 752 } } });
    expect(marginTopOf(view.tabBar())).toBeUndefined();
  });

  it('하단 바는 위치를 바꾸지 않는다', async () => {
    mockWidthClass = 'compact';
    const { tabBar } = await setup({ headerHeight: 80 });
    expect(tabBar().props.mode).toBe('bar');
    expect(marginTopOf(tabBar())).toBeUndefined();
  });

  it('Stack 화면 밖(헤더 없음)이면 내리지 않는다', async () => {
    const { tabBar } = await setup();
    expect(marginTopOf(tabBar())).toBeUndefined();
  });

  describe('레일 위 칸 바탕 — 장면 밖이라 화면의 헤더 바탕이 닿지 않는다', () => {
    const fills = (container: TestInstance) =>
      queryAllByHostType('View', container).filter((node) => node.props.testID === 'zs-tab-navigator-rail-header-fill');
    const progress = { value: 0 };
    const Reporter = ({ from }: { from: string }) => {
      const report = React.useContext(HeaderFillContext);
      React.useEffect(() => {
        report?.({ progress: progress as never, from, to: '#000000' });
        return () => report?.(null);
      }, [report, from]);
      return null;
    };
    const descriptors = {
      'feed-1': { options: { title: '피드' }, render: () => <Reporter from="#111111" /> },
      profile: { options: { title: '프로필' }, render: () => <Text>profile scene</Text> },
    };
    const layoutRail = (tabBar: TestInstance, width: number) =>
      fireEvent(tabBar, 'layout', { nativeEvent: { layout: { x: 0, y: 80, width, height: 752 } } });

    it('선택된 탭이 알린 헤더 바탕으로 레일 폭 × 헤더 높이를 시작 측 위에 칠한다', async () => {
      const view = await setup({ headerHeight: 80, descriptors });
      await layoutRail(view.tabBar(), 96);
      const fill = nth(fills(view.container), 0);
      expect(StyleSheet.flatten(fill.props.style)).toMatchObject({ position: 'absolute', top: 0, start: 0, width: 96, height: 80, backgroundColor: '#111111' });
      expect(fill.props.pointerEvents).toBe('none');
    });

    it('헤더 바탕이 없는 탭으로 옮기면 칠하지 않는다', async () => {
      const view = await setup({ headerHeight: 80, descriptors });
      await layoutRail(view.tabBar(), 96);
      await view.rerenderAt(1);
      expect(fills(view.container)).toHaveLength(0);
      await view.rerenderAt(0);
      expect(fills(view.container)).toHaveLength(1);
    });

    it('레일이 내려가지 않으면(헤더 없음·하단 바) 칠하지 않는다', async () => {
      const view = await setup({ descriptors });
      await layoutRail(view.tabBar(), 96);
      expect(fills(view.container)).toHaveLength(0);
      mockWidthClass = 'compact';
      const bar = await setup({ headerHeight: 80, descriptors });
      await layoutRail(bar.tabBar(), 750);
      expect(fills(bar.container)).toHaveLength(0);
    });
  });
});
