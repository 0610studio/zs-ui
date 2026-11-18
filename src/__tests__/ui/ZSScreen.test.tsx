import React from 'react';
import { act, render as rtlRender, fireEvent, within } from '@testing-library/react-native';
import { RefreshControl, Text, TextInput, StyleSheet, Platform } from 'react-native';
import { HeaderHeightContext } from 'expo-router/react-navigation';
import { TabBarInsetContext } from '../../navigation/useTabBarInset';
import ZSScreen, { type ZSScreenRef } from '../../ui/ZSScreen';
import { useNotifyInputFocus } from '../../ui/ZSScreen/InputFocusContext';
import { useScreenBottomInset } from '../../ui/ZSScreen/BottomInsetContext';
import { ScreenCoverContext } from '../../context/ScreenCoverContext';
import { LayoutProvider } from '../../layout/LayoutProvider';
import type { WindowObserverProps } from '../../layout/WindowObserver.types';
import { getByHostType, nth, queryAllByHostType } from '../utils/hostQueries';
import { getTestTheme } from '../utils/theme';

let observe: WindowObserverProps['onObserve'] = () => {};

jest.mock('../../layout/WindowObserver', () => ({
  __esModule: true,
  default: ({ onObserve, children }: WindowObserverProps) => {
    observe = onObserve;
    return children;
  },
}));

const render = (ui: React.ReactElement) => rtlRender(ui, { wrapper: LayoutProvider });

jest.mock('../../context/ThemeContext', () => require('../utils/theme').mockThemeModule());

let mockKeyboardHeight = 0;

jest.mock('../../model/useKeyboard', () => ({
  __esModule: true,
  default: jest.fn(({ handleKeyboardShow, handleKeyboardHide }) => {
    if (typeof jest !== 'undefined') {
      (jest as any).__keyboardShow = handleKeyboardShow;
      (jest as any).__keyboardHide = handleKeyboardHide;
    }
    return { isKeyboardVisible: mockKeyboardHeight > 0, keyboardHeight: mockKeyboardHeight };
  }),
}));

let mockInsetTop = 0;
let mockInsetBottom = 0;

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, ...props }: any) => React.createElement('SafeAreaView', props, children),
    SafeAreaProvider: ({ children, ...props }: any) => React.createElement('SafeAreaProvider', props, children),
    useSafeAreaInsets: () => ({ top: mockInsetTop, bottom: mockInsetBottom, left: 0, right: 0 }),
  };
});

const mockScrollTo = jest.fn();
// 테스트마다 ScrollView ref 에 getNativeScrollRef·getInnerViewRef 를 덧붙일 때 쓴다(기본은 없음 → onScroll 값으로 대신한다)
let mockScrollRefs: Record<string, unknown> = {};

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  const React = require('react');
  return {
    ...RN,
    Dimensions: {
      get: jest.fn(() => ({ height: 800, width: 400 })),
    },
    ScrollView: React.forwardRef((props: any, ref: any) => {
      React.useImperativeHandle(ref, () => ({ scrollTo: mockScrollTo, ...mockScrollRefs }));
      return React.createElement('ScrollView', props, props.children);
    }),
  };
});

describe('ZSScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockKeyboardHeight = 0;
  });

  it('children을 렌더한다', async () => {
    const { getByText } = await render(
      <ZSScreen>
        <Text>Test Content</Text>
      </ZSScreen>
    );

    expect(getByText('Test Content')).toBeTruthy();
  });

  it('backgroundColor prop을 받는다', async () => {
    const { getByText } = await render(
      <ZSScreen backgroundColor="#FF0000">
        <Text>Test</Text>
      </ZSScreen>
    );

    expect(getByText('Test')).toBeTruthy();
  });

  it('scrollEnabled가 false일 때 ScrollView를 사용하지 않는다', async () => {
    const { getByText } = await render(
      <ZSScreen scrollEnabled={false}>
        <Text>Test</Text>
      </ZSScreen>
    );

    expect(getByText('Test')).toBeTruthy();
    expect(queryAllByHostType('ScrollView')).toHaveLength(0);
  });

  it('scrollEnabled 기본값은 true 라 ScrollView 로 감싼다', async () => {
    await render(
      <ZSScreen>
        <Text>Test</Text>
      </ZSScreen>
    );

    expect(queryAllByHostType('ScrollView')).toHaveLength(1);
  });

  it('평소에는 iOS 상태바 탭 scroll-to-top 을 받는다', async () => {
    await render(
      <ZSScreen>
        <Text>Test</Text>
      </ZSScreen>
    );

    expect(getByHostType('ScrollView').props.scrollsToTop).toBe(true);
  });

  it('zs-ui 오버레이가 화면을 덮으면 scroll-to-top 을 끈다 — 오버레이 위쪽 버튼 탭에 가려진 화면이 맨 위로 가지 않게', async () => {
    await render(
      <ScreenCoverContext.Provider value>
        <ZSScreen>
          <Text>Test</Text>
        </ZSScreen>
      </ScreenCoverContext.Provider>
    );

    expect(getByHostType('ScrollView').props.scrollsToTop).toBe(false);
  });

  it.each([true, false])('View 속성은 style 과 같은 콘텐츠 뷰에 전달된다 (scrollEnabled=%s)', async (scrollEnabled) => {
    const { getByTestId } = await render(
      <ZSScreen scrollEnabled={scrollEnabled} testID="container-content" accessibilityLabel="본문" style={{ padding: 7 }}>
        <Text>child</Text>
      </ZSScreen>
    );
    const content = getByTestId('container-content');
    expect(content.props.accessibilityLabel).toBe('본문');
    expect(StyleSheet.flatten(content.props.style)).toMatchObject({ padding: 7 });
    expect(within(content).getByText('child')).toBeTruthy();
  });

  it('topComponent를 렌더한다', async () => {
    const { getByText } = await render(
      <ZSScreen topComponent={<Text>Top Component</Text>}>
        <Text>Content</Text>
      </ZSScreen>
    );

    expect(getByText('Top Component')).toBeTruthy();
    expect(getByText('Content')).toBeTruthy();
  });

  it('bottomComponent를 렌더한다', async () => {
    const { getByText } = await render(
      <ZSScreen bottomComponent={<Text>Bottom Component</Text>}>
        <Text>Content</Text>
      </ZSScreen>
    );

    expect(getByText('Bottom Component')).toBeTruthy();
    expect(getByText('Content')).toBeTruthy();
  });

  it('edges prop을 받는다', async () => {
    const { getByText } = await render(
      <ZSScreen edges={['top']}>
        <Text>Test</Text>
      </ZSScreen>
    );

    expect(getByText('Test')).toBeTruthy();
  });

  it('showsVerticalScrollIndicator prop을 받는다', async () => {
    const { getByText } = await render(
      <ZSScreen showsVerticalScrollIndicator={false}>
        <Text>Test</Text>
      </ZSScreen>
    );

    expect(getByText('Test')).toBeTruthy();
  });

  it('onScroll 이벤트를 처리한다', async () => {
    const mockOnScroll = jest.fn();
    await render(
      <ZSScreen onScroll={mockOnScroll}>
        <Text>Test</Text>
      </ZSScreen>
    );

    await fireEvent.scroll(getByHostType('ScrollView'), {
      nativeEvent: {
        contentOffset: { y: 100 },
      },
    });

    expect(mockOnScroll).toHaveBeenCalled();
  });

  it('ref를 사용할 수 있다', async () => {
    const ref = React.createRef<ZSScreenRef>();
    await render(
      <ZSScreen ref={ref} scrollEnabled>
        <Text>Test</Text>
      </ZSScreen>
    );

    expect(ref.current).not.toBeNull();
  });

  it('scrollEventThrottle prop을 받는다', async () => {
    const { getByText } = await render(
      <ZSScreen scrollEventThrottle={32}>
        <Text>Test</Text>
      </ZSScreen>
    );

    expect(getByText('Test')).toBeTruthy();
  });

  it('keyboardScrollExtraOffset prop을 받는다', async () => {
    const { getByText } = await render(
      <ZSScreen keyboardScrollExtraOffset={50}>
        <Text>Test</Text>
      </ZSScreen>
    );

    expect(getByText('Test')).toBeTruthy();
  });

  describe('safe area 영역별 자동 처리 (iOS)', () => {
    const rootOf = (tree: Awaited<ReturnType<typeof render>>) => nth(queryAllByHostType('SafeAreaView', tree.container), 0);

    it('edges 미지정이면 루트는 좌·우만, 스크롤 상·하는 UIKit 자동 조정', async () => {
      const tree = await render(<ZSScreen><Text>Test</Text></ZSScreen>);
      expect(rootOf(tree).props.edges).toEqual(['left', 'right']);
      expect(getByHostType('ScrollView', tree.container).props.contentInsetAdjustmentBehavior).toBe('automatic');
    });

    it('컨테이너 자리에 SafeAreaProvider 를 중첩해 inset 을 창이 아닌 컨테이너 위치 기준으로 받는다', async () => {
      const tree = await render(<ZSScreen><Text>Test</Text></ZSScreen>);
      const provider = getByHostType('SafeAreaProvider', tree.container);
      expect(queryAllByHostType('SafeAreaView', provider)[0]).toBe(rootOf(tree));
    });

    it('edges 를 지정하면 그 방향만 SafeAreaView 로 처리하고 자동 조정은 끈다', async () => {
      const tree = await render(<ZSScreen edges={['bottom']}><Text>Test</Text></ZSScreen>);
      expect(rootOf(tree).props.edges).toEqual(['bottom']);
      expect(getByHostType('ScrollView', tree.container).props.contentInsetAdjustmentBehavior).toBe('never');
    });

    it('bottomComponent 는 하단 inset 을 자기 위치 기준으로 받는다', async () => {
      const tree = await render(<ZSScreen bottomComponent={<Text>CTA</Text>}><Text>Test</Text></ZSScreen>);
      const edgesList = queryAllByHostType('SafeAreaView', tree.container).map((node: any) => node.props.edges);
      expect(edgesList).toContainEqual(['bottom']);
    });

    it('bottomComponent 가 있으면 [본문 + bottomComponent] 열 전체가 하단 inset 을 margin 으로 받는다 (absolute 자식이 열 bounds 안에 놓이게)', async () => {
      const tree = await render(<ZSScreen bottomComponent={<Text>CTA</Text>}><Text>Body</Text></ZSScreen>);
      const region = queryAllByHostType('SafeAreaView', tree.container).find((node: any) => node.props.mode === 'margin');
      expect(region?.props.edges).toEqual(['bottom']);
      expect(queryAllByHostType('ScrollView', region!)).toHaveLength(1);
      expect(within(region!).getByText('CTA')).toBeTruthy();
    });

    it('bottomComponent 정렬 뷰는 position: static — absolute 자식(ZSKeyboardStickyView)의 기준이 되지 않는다', async () => {
      const tree = await render(<ZSScreen bottomComponent={<Text>CTA</Text>}><Text>Body</Text></ZSScreen>);
      const host = tree.getByText('CTA').parent;
      expect(StyleSheet.flatten(host?.props.style).position).toBe('static');
    });

    it('scrollEnabled={false} 콘텐츠는 상·하 inset 을 SafeAreaView 로 받는다', async () => {
      const tree = await render(<ZSScreen scrollEnabled={false}><Text>Test</Text></ZSScreen>);
      const edgesList = queryAllByHostType('SafeAreaView', tree.container).map((node: any) => node.props.edges);
      expect(edgesList).toContainEqual(['top', 'bottom']);
    });

    it('표면색은 backgroundColor prop, 없으면 콘텐츠 style 배경을 쓴다', async () => {
      const withProp = await render(<ZSScreen backgroundColor="#111111" style={{ backgroundColor: '#222222' }}><Text>A</Text></ZSScreen>);
      expect(StyleSheet.flatten(rootOf(withProp).props.style).backgroundColor).toBe('#111111');
      const fromStyle = await render(<ZSScreen style={{ backgroundColor: '#222222' }}><Text>B</Text></ZSScreen>);
      expect(StyleSheet.flatten(rootOf(fromStyle).props.style).backgroundColor).toBe('#222222');
    });

    it('backgroundColor 는 테마 색 이름도 받는다 — 직접 지정한 색(rgba)은 그대로 쓴다', async () => {
      const { colors } = getTestTheme();
      const named = await render(<ZSScreen backgroundColor="surface2"><Text>A</Text></ZSScreen>);
      expect(StyleSheet.flatten(rootOf(named).props.style).backgroundColor).toBe(colors.surface2);
      await named.unmount();
      const raw = await render(<ZSScreen backgroundColor="rgba(0, 0, 0, 0.5)"><Text>B</Text></ZSScreen>);
      expect(StyleSheet.flatten(rootOf(raw).props.style).backgroundColor).toBe('rgba(0, 0, 0, 0.5)');
    });

    it('표면색은 루트 한 곳에서만 칠한다 — 루트와 콘텐츠 사이에 배경을 다시 칠하는 뷰가 없다', async () => {
      const tree = await render(<ZSScreen backgroundColor="#111111"><Text>Body</Text></ZSScreen>);
      const painted = tree.container.queryAll((node) => StyleSheet.flatten(node.props.style)?.backgroundColor !== undefined);
      expect(painted).toEqual([rootOf(tree)]);
    });
  });

  describe('iOS 짧은 페이지 — 콘텐츠 높이에서 자동 조정 inset 을 뺀다', () => {
    const platform = Platform as { OS: string };
    const scrollViewOf = (tree: Awaited<ReturnType<typeof render>>) => getByHostType('ScrollView', tree.container);
    const contentStyleOf = (tree: Awaited<ReturnType<typeof render>>) => StyleSheet.flatten(scrollViewOf(tree).props.contentContainerStyle);
    const layoutScrollView = (tree: Awaited<ReturnType<typeof render>>, height = 800) =>
      fireEvent(scrollViewOf(tree), 'layout', { nativeEvent: { layout: { x: 0, y: 0, width: 400, height } } });

    beforeEach(() => {
      mockInsetTop = 100;
      mockInsetBottom = 34;
    });

    afterEach(() => {
      platform.OS = 'ios';
      mockInsetTop = 0;
      mockInsetBottom = 0;
    });

    it('재기 전에는 flexGrow 로 채우고, 재면 스크롤 뷰 높이 − 위·아래 inset 을 최소 높이로 둔다 — 짧은 페이지가 inset 만큼 끌려 올라가 머물지 않는다', async () => {
      const tree = await render(<ZSScreen><Text>Body</Text></ZSScreen>);
      expect(contentStyleOf(tree)).toMatchObject({ flexGrow: 1 });
      expect(contentStyleOf(tree).minHeight).toBeUndefined();

      await layoutScrollView(tree);
      expect(contentStyleOf(tree)).toMatchObject({ flexGrow: 0, minHeight: 800 - 100 - 34 });
    });

    it('스크롤 뷰 높이가 바뀌면(회전·키보드 밖 레이아웃) 다시 맞춘다', async () => {
      const tree = await render(<ZSScreen><Text>Body</Text></ZSScreen>);
      await layoutScrollView(tree);
      await layoutScrollView(tree, 400);
      expect(contentStyleOf(tree).minHeight).toBe(400 - 100 - 34);
    });

    it('topComponent 가 위 inset 을, bottomComponent 가 아래 inset 을 받으면 그쪽은 빼지 않는다', async () => {
      const withTop = await render(<ZSScreen topComponent={<Text>Top</Text>}><Text>Body</Text></ZSScreen>);
      await layoutScrollView(withTop);
      expect(contentStyleOf(withTop).minHeight).toBe(800 - 34);
      await withTop.unmount();

      const withBottom = await render(<ZSScreen bottomComponent={<Text>CTA</Text>}><Text>Body</Text></ZSScreen>);
      await layoutScrollView(withBottom);
      expect(contentStyleOf(withBottom).minHeight).toBe(800 - 100);
    });

    it('키보드 여백은 그대로 콘텐츠 하단에 둔다 — 넘치면 콘텐츠가 늘어 포커스 스크롤이 동작한다', async () => {
      mockKeyboardHeight = 300;
      const tree = await render(<ZSScreen><Text>Body</Text></ZSScreen>);
      await layoutScrollView(tree);
      expect(contentStyleOf(tree)).toMatchObject({ paddingBottom: 300 + 30, minHeight: 666 });
    });

    it('당겨서 새로고침은 그대로 — 튕김을 켜고 alwaysBounceVertical 은 건드리지 않는다(ScrollView 기본 true)', async () => {
      const control = <RefreshControl refreshing={false} />;
      const tree = await render(<ZSScreen refreshControl={control}><Text>Body</Text></ZSScreen>);
      await layoutScrollView(tree);
      expect(scrollViewOf(tree).props).toMatchObject({ bounces: true, refreshControl: control, contentInsetAdjustmentBehavior: 'automatic' });
      expect(scrollViewOf(tree).props.alwaysBounceVertical).toBeUndefined();
    });

    it('edges 를 지정하면(자동 조정 없음) 재지 않고 flexGrow 그대로다', async () => {
      const tree = await render(<ZSScreen edges={['top']}><Text>Body</Text></ZSScreen>);
      expect(scrollViewOf(tree).props.onLayout).toBeUndefined();
      expect(contentStyleOf(tree)).toMatchObject({ flexGrow: 1 });
      expect(contentStyleOf(tree).minHeight).toBeUndefined();
    });

    it('Android 는 inset 을 패딩으로 받으므로 재지 않고 flexGrow 그대로다', async () => {
      platform.OS = 'android';
      const tree = await render(<ZSScreen><Text>Body</Text></ZSScreen>);
      expect(scrollViewOf(tree).props.onLayout).toBeUndefined();
      expect(contentStyleOf(tree)).toMatchObject({ flexGrow: 1 });
      expect(contentStyleOf(tree).minHeight).toBeUndefined();
    });
  });

  describe('당겨서 새로고침 (refreshControl·bounces)', () => {
    const scrollView = () => getByHostType('ScrollView');

    it('refreshControl 이 없으면 끝에서 튕기지 않고 Android 오버스크롤도 끈다', async () => {
      await render(<ZSScreen><Text>Body</Text></ZSScreen>);
      expect(scrollView().props).toMatchObject({ bounces: false, overScrollMode: 'never' });
      expect(scrollView().props.refreshControl).toBeUndefined();
    });

    it('refreshControl 을 주면 스크롤 뷰에 그대로 넘기고 튕김·오버스크롤을 켠다', async () => {
      const onRefresh = jest.fn();
      const control = <RefreshControl refreshing={false} onRefresh={onRefresh} />;
      await render(<ZSScreen refreshControl={control}><Text>Body</Text></ZSScreen>);
      expect(scrollView().props.refreshControl).toBe(control);
      expect(scrollView().props).toMatchObject({ bounces: true, overScrollMode: 'auto' });
    });

    it('bounces 를 주면 refreshControl 유무보다 우선한다', async () => {
      const bouncy = await render(<ZSScreen bounces><Text>Body</Text></ZSScreen>);
      expect(getByHostType('ScrollView', bouncy.container).props).toMatchObject({ bounces: true, overScrollMode: 'auto' });
      await bouncy.unmount();

      const control = <RefreshControl refreshing={false} />;
      const still = await render(<ZSScreen bounces={false} refreshControl={control}><Text>Body</Text></ZSScreen>);
      expect(getByHostType('ScrollView', still.container).props).toMatchObject({ bounces: false, overScrollMode: 'never', refreshControl: control });
    });

    it('scrollEnabled={false} 면 refreshControl 을 쓰지 않는다', async () => {
      await render(
        <ZSScreen scrollEnabled={false} refreshControl={<RefreshControl refreshing={false} />}>
          <Text>Body</Text>
        </ZSScreen>,
      );
      expect(queryAllByHostType('ScrollView')).toHaveLength(0);
      expect(queryAllByHostType('RefreshControl')).toHaveLength(0);
    });
  });

  describe('키보드 하단 여백', () => {
    it('스크롤 콘텐츠 하단에 키보드 높이 + 포커스 여유(keyboardScrollExtraOffset)만큼 여백을 둔다 — 가린 만큼 올려도 끝을 넘지 않는다', async () => {
      mockKeyboardHeight = 300;
      const tree = await render(<ZSScreen><Text>Body</Text></ZSScreen>);
      expect(StyleSheet.flatten(getByHostType('ScrollView', tree.container).props.contentContainerStyle).paddingBottom).toBe(300 + 30);
      await tree.unmount();
      const extra = await render(<ZSScreen keyboardScrollExtraOffset={120}><Text>Body</Text></ZSScreen>);
      expect(StyleSheet.flatten(getByHostType('ScrollView', extra.container).props.contentContainerStyle).paddingBottom).toBe(300 + 120);
    });

    it('키보드가 없으면 여백이 없다', async () => {
      const tree = await render(<ZSScreen><Text>Body</Text></ZSScreen>);
      expect(StyleSheet.flatten(getByHostType('ScrollView', tree.container).props.contentContainerStyle).paddingBottom).toBe(0);
    });
  });

  describe('maxContentWidth', () => {
    const IPAD_LANDSCAPE = { width: 1210, height: 834, horizontalSizeClass: 'regular', verticalSizeClass: 'regular', readableWidth: 896 } as const;
    const IPHONE_PORTRAIT = { width: 402, height: 874, horizontalSizeClass: 'compact', verticalSizeClass: 'regular', readableWidth: 370 } as const;
    const columnsOf = (tree: Awaited<ReturnType<typeof render>>) =>
      tree.container
        .queryAll((node) => StyleSheet.flatten(node.props.style)?.maxWidth !== undefined)
        .map((node) => ({ type: node.type, maxWidth: StyleSheet.flatten(node.props.style).maxWidth, alignSelf: StyleSheet.flatten(node.props.style).alignSelf }));

    it('기본은 넓은 창에서도 전폭이다 — 화면 여백 안에서 꽉 채운다', async () => {
      const tree = await render(<ZSScreen><Text>Body</Text></ZSScreen>);
      await act(() => observe(IPAD_LANDSCAPE));
      expect(columnsOf(tree)).toEqual([]);
    });

    it("'readable' 이면 콘텐츠를 가독 폭 가운데 열로 제한하고 스크롤 뷰는 전폭을 유지한다", async () => {
      const tree = await render(<ZSScreen maxContentWidth="readable"><Text>Body</Text></ZSScreen>);
      await act(() => observe(IPAD_LANDSCAPE));
      expect(columnsOf(tree)).toEqual([{ type: 'View', maxWidth: 896, alignSelf: 'center' }]);
      expect(StyleSheet.flatten(getByHostType('ScrollView', tree.container).props.style)?.maxWidth).toBeUndefined();
    });

    it('compact 창에서는 적용하지 않는다', async () => {
      const tree = await render(<ZSScreen maxContentWidth="readable"><Text>Body</Text></ZSScreen>);
      await act(() => observe(IPHONE_PORTRAIT));
      expect(columnsOf(tree)).toEqual([]);
    });

    it("숫자는 그 폭으로, 'none' 은 전폭으로 둔다", async () => {
      const fixed = await render(<ZSScreen maxContentWidth={600}><Text>Body</Text></ZSScreen>);
      await act(() => observe(IPAD_LANDSCAPE));
      expect(columnsOf(fixed).map((column) => column.maxWidth)).toEqual([600]);
      await fixed.unmount();

      const none = await render(<ZSScreen maxContentWidth="none"><Text>Body</Text></ZSScreen>);
      await act(() => observe(IPAD_LANDSCAPE));
      expect(columnsOf(none)).toEqual([]);
    });

    it('topComponent·bottomComponent 도 같은 열에 맞춘다 (bottomComponent 는 static 정렬 뷰)', async () => {
      const tree = await render(
        <ZSScreen maxContentWidth="readable" topComponent={<Text>Top</Text>} bottomComponent={<Text>CTA</Text>}>
          <Text>Body</Text>
        </ZSScreen>,
      );
      await act(() => observe(IPAD_LANDSCAPE));
      expect(columnsOf(tree).map((column) => column.type)).toEqual(['View', 'View', 'View']);
      expect(columnsOf(tree).every((column) => column.maxWidth === 896)).toBe(true);
    });

    it('scrollEnabled={false} 콘텐츠도 같은 열에 맞춘다', async () => {
      const tree = await render(<ZSScreen maxContentWidth="readable" scrollEnabled={false}><Text>Body</Text></ZSScreen>);
      await act(() => observe(IPAD_LANDSCAPE));
      expect(columnsOf(tree)).toEqual([{ type: 'SafeAreaView', maxWidth: 896, alignSelf: 'center' }]);
    });
  });

  describe('bottomComponentPlacement', () => {
    const FOLD_OPEN = { width: 884, height: 660, horizontalSizeClass: 'regular', verticalSizeClass: 'regular', readableWidth: 640 } as const;
    const PHONE = { width: 402, height: 874, horizontalSizeClass: 'compact', verticalSizeClass: 'regular', readableWidth: 370 } as const;
    const sideOf = (tree: Awaited<ReturnType<typeof render>>) => tree.queryByTestId('zs-screen-bottom-side');
    const slotOf = (tree: Awaited<ReturnType<typeof render>>) =>
      tree.container.queryAll((node) => node.type === 'View' && StyleSheet.flatten(node.props.style)?.width === '50%')[0]!;
    const layout = (height: number) => ({ nativeEvent: { layout: { x: 0, y: 0, width: 400, height } } });

    let seenInset: number[] = [];
    const InsetProbe = () => {
      seenInset.push(useScreenBottomInset());
      return null;
    };

    beforeEach(() => {
      seenInset = [];
    });

    it("기본('full')은 넓은 창에서도 전폭 흐름 영역이고 아래 여백 값은 0 이다", async () => {
      const tree = await render(
        <ZSScreen bottomComponent={<Text>CTA</Text>}>
          <InsetProbe />
        </ZSScreen>,
      );
      await act(() => observe(FOLD_OPEN));
      expect(sideOf(tree)).toBeNull();
      expect(seenInset.at(-1)).toBe(0);
    });

    it("넓은 창 'start' 는 본문 위 바닥에 절반 폭으로 띄우고, 그 높이를 useScreenBottomInset 과 스크롤 아래 여백으로 준다", async () => {
      const tree = await render(
        <ZSScreen bottomComponent={<Text>CTA</Text>} bottomComponentPlacement="start">
          <InsetProbe />
        </ZSScreen>,
      );
      await act(() => observe(FOLD_OPEN));
      const side = sideOf(tree);
      expect(StyleSheet.flatten(side?.props.style)).toMatchObject({ position: 'absolute', left: 0, right: 0, bottom: 0 });
      expect(within(side!).getByText('CTA')).toBeTruthy();
      expect(StyleSheet.flatten(slotOf(tree).parent!.props.style)?.justifyContent).toBeUndefined();

      await act(() => fireEvent(slotOf(tree), 'layout', layout(88)));
      expect(seenInset.at(-1)).toBe(88);
      const content = StyleSheet.flatten(getByHostType('ScrollView', tree.container).props.contentContainerStyle);
      expect(content.paddingBottom).toBe(88);
    });

    it("'end' 는 끝 쪽으로 붙인다", async () => {
      const tree = await render(
        <ZSScreen bottomComponent={<Text>CTA</Text>} bottomComponentPlacement="end" scrollEnabled={false}>
          <Text>Body</Text>
        </ZSScreen>,
      );
      await act(() => observe(FOLD_OPEN));
      expect(sideOf(tree)).not.toBeNull();
      expect(StyleSheet.flatten(slotOf(tree).parent!.props.style)?.justifyContent).toBe('flex-end');
    });

    it('compact 창은 한 열이라 전폭으로 둔다', async () => {
      const tree = await render(
        <ZSScreen bottomComponent={<Text>CTA</Text>} bottomComponentPlacement="start">
          <InsetProbe />
        </ZSScreen>,
      );
      await act(() => observe(PHONE));
      expect(sideOf(tree)).toBeNull();
      expect(tree.container.queryAll((node) => node.type === 'View' && StyleSheet.flatten(node.props.style)?.width === '50%')).toHaveLength(0);
      expect(seenInset.at(-1)).toBe(0);
    });

    it('edges 를 직접 줘도 같은 자리에 둔다', async () => {
      const tree = await render(
        <ZSScreen edges={['top']} bottomComponent={<Text>CTA</Text>} bottomComponentPlacement="start">
          <Text>Body</Text>
        </ZSScreen>,
      );
      await act(() => observe(FOLD_OPEN));
      expect(sideOf(tree)).not.toBeNull();
    });
  });

  describe('키보드 포커스 스크롤', () => {
    const focusInput = ({ y, height, inside = true }: { y: number; height: number; inside?: boolean }) => {
      const input = {
        measureLayout: (_relativeTo: unknown, onSuccess: (...args: number[]) => void, onFail: () => void) =>
          (inside ? onSuccess(0, y, 300, height) : onFail()),
        measureInWindow: (callback: (...args: number[]) => void) => callback(0, y, 300, height),
      };
      jest.spyOn(TextInput.State, 'currentlyFocusedInput').mockReturnValue(input as any);
    };

    const showKeyboard = async (screenY: number) => {
      await act(() => {
        (jest as any).__keyboardShow({ endCoordinates: { screenX: 0, screenY, width: 402, height: 874 - screenY } });
        jest.advanceTimersByTime(100);
      });
    };

    beforeEach(() => {
      jest.useFakeTimers();
      mockScrollTo.mockClear();
      mockScrollRefs = {};
    });

    afterEach(() => {
      jest.useRealTimers();
      jest.restoreAllMocks();
    });

    it('iOS 자동 인셋 아래(정지 offset 이 -인셋)서도 지금 offset 에 가린 만큼만 더한다 — 목표가 음수여도 그대로 넘긴다', async () => {
      const tree = await render(<ZSScreen keyboardScrollExtraOffset={20}><Text>Body</Text></ZSScreen>);
      await fireEvent.scroll(getByHostType('ScrollView', tree.container), { nativeEvent: { contentOffset: { x: 0, y: -116 } } });
      focusInput({ y: 500, height: 40 });
      await showKeyboard(520);
      expect(mockScrollTo).toHaveBeenCalledWith({ y: -116 + 40, animated: true });
    });

    it('지금 offset 은 스크롤 뷰 윗변과 콘텐츠 윗변의 차이로 잰다 — onScroll 을 한 번도 받지 않았어도 맞다', async () => {
      mockScrollRefs = {
        getNativeScrollRef: () => ({ measureInWindow: (cb: (...args: number[]) => void) => cb(0, 100, 400, 700) }),
        getInnerViewRef: () => ({ measureInWindow: (cb: (...args: number[]) => void) => cb(0, 216, 400, 2000) }),
      };
      await render(<ZSScreen keyboardScrollExtraOffset={20}><Text>Body</Text></ZSScreen>);
      focusInput({ y: 500, height: 40 });
      await showKeyboard(520);
      expect(mockScrollTo).toHaveBeenCalledWith({ y: (100 - 216) + 40, animated: true });
    });

    it('scrollToOverflowEnabled 는 iOS 자동 인셋(edges 생략)에서만 켠다 — 네이티브 scrollTo 의 0 하한을 풀어 -인셋 ~ 0 목표를 허용한다', async () => {
      const platform = Platform as { OS: string };
      const auto = await render(<ZSScreen><Text>Body</Text></ZSScreen>);
      expect(getByHostType('ScrollView', auto.container).props.scrollToOverflowEnabled).toBe(true);
      await auto.unmount();
      const manual = await render(<ZSScreen edges={['top']}><Text>Body</Text></ZSScreen>);
      expect(getByHostType('ScrollView', manual.container).props.scrollToOverflowEnabled).toBeUndefined();
      await manual.unmount();
      platform.OS = 'android';
      try {
        const android = await render(<ZSScreen><Text>Body</Text></ZSScreen>);
        expect(getByHostType('ScrollView', android.container).props.scrollToOverflowEnabled).toBeUndefined();
      } finally {
        platform.OS = 'ios';
      }
    });

    it('가려진 입력은 가려진 만큼(+여유)만 올린다', async () => {
      await render(<ZSScreen keyboardScrollExtraOffset={20}><Text>Body</Text></ZSScreen>);
      focusInput({ y: 500, height: 40 });
      await showKeyboard(520);
      expect(mockScrollTo).toHaveBeenCalledWith({ y: 40, animated: true });
    });

    it('현재 스크롤 위치에서 더 올린다', async () => {
      const tree = await render(<ZSScreen keyboardScrollExtraOffset={20}><Text>Body</Text></ZSScreen>);
      await fireEvent.scroll(getByHostType('ScrollView', tree.container), { nativeEvent: { contentOffset: { x: 0, y: 200 } } });
      focusInput({ y: 500, height: 40 });
      await showKeyboard(520);
      expect(mockScrollTo).toHaveBeenCalledWith({ y: 240, animated: true });
    });

    it('이미 보이는 입력은 움직이지 않는다', async () => {
      await render(<ZSScreen><Text>Body</Text></ZSScreen>);
      focusInput({ y: 120, height: 40 });
      await showKeyboard(520);
      expect(mockScrollTo).not.toHaveBeenCalled();
    });

    it('컨테이너 밖(시트·모달) 입력은 다루지 않는다', async () => {
      await render(<ZSScreen><Text>Body</Text></ZSScreen>);
      focusInput({ y: 700, height: 40, inside: false });
      await showKeyboard(520);
      expect(mockScrollTo).not.toHaveBeenCalled();
    });

    it('키보드가 떠 있는 동안 포커스가 바뀐 입력을 알리면 다시 잰다 (Android 는 키보드 이벤트가 다시 오지 않는다)', async () => {
      let notify: (() => void) | null = null;
      function FocusProbe() {
        notify = useNotifyInputFocus();
        return null;
      }
      await render(<ZSScreen keyboardScrollExtraOffset={20}><FocusProbe /></ZSScreen>);
      focusInput({ y: 300, height: 40 });
      await showKeyboard(520);
      expect(mockScrollTo).not.toHaveBeenCalled();
      focusInput({ y: 600, height: 40 });
      await act(() => {
        notify?.();
        jest.advanceTimersByTime(100);
      });
      expect(mockScrollTo).toHaveBeenCalledWith({ y: 600 + 40 + 20 - 520, animated: true });
    });

    it('키보드가 내려가 있으면 포커스 알림은 아무것도 하지 않는다 (키보드 표시 이벤트가 처리한다)', async () => {
      let notify: (() => void) | null = null;
      function FocusProbe() {
        notify = useNotifyInputFocus();
        return null;
      }
      await render(<ZSScreen><FocusProbe /></ZSScreen>);
      focusInput({ y: 700, height: 40 });
      await act(() => {
        notify?.();
        jest.advanceTimersByTime(100);
      });
      expect(mockScrollTo).not.toHaveBeenCalled();
    });

    it('scrollToFocusedInput=false 면 스크롤하지 않는다', async () => {
      await render(<ZSScreen scrollToFocusedInput={false}><Text>Body</Text></ZSScreen>);
      focusInput({ y: 700, height: 40 });
      await showKeyboard(520);
      expect(mockScrollTo).not.toHaveBeenCalled();
    });
  });

  describe('투명 헤더 아래 (useStackTheme 기본)', () => {
    const platform = Platform as { OS: string };
    const rootOf = (tree: Awaited<ReturnType<typeof render>>) => nth(queryAllByHostType('SafeAreaView', tree.container), 0);
    const scrimOf = (tree: Awaited<ReturnType<typeof render>>) =>
      queryAllByHostType('View', tree.container).find((node: any) => node.props.pointerEvents === 'none' && StyleSheet.flatten(node.props.style)?.position === 'absolute');
    const renderUnderHeader = (ui: React.ReactElement) => render(
      <HeaderHeightContext.Provider value={80}>{ui}</HeaderHeightContext.Provider>,
    );

    afterEach(() => {
      platform.OS = 'ios';
      mockInsetTop = 0;
    });

    it('iOS: topComponent 는 safe area(내비게이션 바 포함)만큼 비킨다 — 고정 영역은 UIKit 스크롤 자동 조정을 받지 못한다', async () => {
      const tree = await render(<ZSScreen topComponent={<Text>Top</Text>}><Text>Test</Text></ZSScreen>);
      const topWrapper = queryAllByHostType('SafeAreaView', tree.container).find((node: any) => within(node).queryByText('Top') && !within(node).queryByText('Test'));
      expect(topWrapper?.props.edges).toEqual(['top']);
    });

    it('iOS: 헤더 높이를 직접 더하지 않는다 — 스크롤은 UIKit 이 비킨다', async () => {
      mockInsetTop = 100;
      const tree = await renderUnderHeader(<ZSScreen><Text>Test</Text></ZSScreen>);
      expect(StyleSheet.flatten(getByHostType('ScrollView', tree.container).props.contentContainerStyle).paddingTop).toBeUndefined();
      expect(scrimOf(tree)).toBeUndefined();
    });

    it('iOS: refreshControl 은 그대로 넘긴다 — 스피너 자리는 UIKit 이 스크롤 inset 으로 비킨다', async () => {
      mockInsetTop = 100;
      const control = <RefreshControl refreshing={false} />;
      const tree = await renderUnderHeader(<ZSScreen refreshControl={control}><Text>Test</Text></ZSScreen>);
      expect(getByHostType('ScrollView', tree.container).props.refreshControl).toBe(control);
    });

    describe('Android', () => {
      beforeEach(() => {
        platform.OS = 'android';
      });

      it('헤더가 덮으면 스크롤 뷰는 헤더 뒤까지 깔고 콘텐츠만 헤더 높이만큼 내린다 — 루트 상단 inset 은 뺀다', async () => {
        mockInsetTop = 24;
        const tree = await renderUnderHeader(<ZSScreen><Text>Test</Text></ZSScreen>);
        expect(rootOf(tree).props.edges).toEqual(['left', 'right', 'bottom']);
        expect(StyleSheet.flatten(getByHostType('ScrollView', tree.container).props.contentContainerStyle).paddingTop).toBe(80);
      });

      const veilOpacityOf = (tree: Awaited<ReturnType<typeof render>>) => {
        const layer = scrimOf(tree)?.queryAll((n: any) => typeof StyleSheet.flatten(n.props?.style)?.opacity === 'number')[0];
        return layer ? StyleSheet.flatten(layer.props.style).opacity : undefined;
      };

      it('헤더 자리는 멈춰 있으면 투명(화면 바탕 그대로)이고, 콘텐츠가 헤더 아래로 스크롤되면 흐림 막이 나타난다', async () => {
        mockInsetTop = 24;
        const ui = () => (
          <HeaderHeightContext.Provider value={80}>
            <ZSScreen backgroundColor="#F0F1F3"><Text>Test</Text></ZSScreen>
          </HeaderHeightContext.Provider>
        );
        const tree = await render(ui());
        const scrimStyle = () => StyleSheet.flatten(scrimOf(tree)?.props.style);
        expect(scrimStyle()).toMatchObject({ top: 0, height: 80 });
        expect(scrimStyle().backgroundColor).toBeUndefined();
        expect(veilOpacityOf(tree)).toBe(0);

        await fireEvent.scroll(getByHostType('ScrollView', tree.container), { nativeEvent: { contentOffset: { x: 0, y: 30 } } });
        await tree.rerender(ui());
        expect(veilOpacityOf(tree)).toBe(1);

        await fireEvent.scroll(getByHostType('ScrollView', tree.container), { nativeEvent: { contentOffset: { x: 0, y: 0 } } });
        await tree.rerender(ui());
        expect(veilOpacityOf(tree)).toBe(0);
      });

      it('backgroundColor 를 색 이름으로 주면 화면 바탕이 그 색이고, 헤더 자리는 투명하게 그 색을 보인다', async () => {
        mockInsetTop = 24;
        const { colors } = getTestTheme();
        const tree = await renderUnderHeader(<ZSScreen backgroundColor="surface2"><Text>Test</Text></ZSScreen>);
        expect(StyleSheet.flatten(rootOf(tree).props.style).backgroundColor).toBe(colors.surface2);
        expect(StyleSheet.flatten(scrimOf(tree)?.props.style).backgroundColor).toBeUndefined();
      });

      it('backgroundColor 가 없으면 화면 바탕은 background 다', async () => {
        mockInsetTop = 24;
        const { colors } = getTestTheme();
        const tree = await renderUnderHeader(<ZSScreen><Text>Test</Text></ZSScreen>);
        expect(StyleSheet.flatten(rootOf(tree).props.style).backgroundColor).toBe(colors.background);
        expect(StyleSheet.flatten(scrimOf(tree)?.props.style).backgroundColor).toBeUndefined();
      });

      it('불투명 헤더면(컨테이너가 헤더 아래에서 시작해 상단 inset 0) 아무것도 더하지 않는다', async () => {
        const tree = await renderUnderHeader(<ZSScreen><Text>Test</Text></ZSScreen>);
        expect(rootOf(tree).props.edges).toEqual(['left', 'right', 'top', 'bottom']);
        expect(StyleSheet.flatten(getByHostType('ScrollView', tree.container).props.contentContainerStyle).paddingTop).toBeUndefined();
        expect(scrimOf(tree)).toBeUndefined();
      });

      it('Stack 화면 밖이면 상태바 inset 만 받는다', async () => {
        mockInsetTop = 24;
        const tree = await render(<ZSScreen><Text>Test</Text></ZSScreen>);
        expect(rootOf(tree).props.edges).toEqual(['left', 'right', 'top', 'bottom']);
        expect(scrimOf(tree)).toBeUndefined();
      });

      it('topComponent 가 있으면 topComponent 가 비키고 스크롤은 그 아래에서 시작한다 — 페이드 없음', async () => {
        mockInsetTop = 24;
        const tree = await renderUnderHeader(<ZSScreen topComponent={<Text>Top</Text>}><Text>Test</Text></ZSScreen>);
        const topWrapper = queryAllByHostType('View', tree.container).find((node: any) => StyleSheet.flatten(node.props.style)?.paddingTop === 80);
        expect(topWrapper && within(topWrapper).queryByText('Top')).toBeTruthy();
        expect(topWrapper && within(topWrapper).queryByText('Test')).toBeNull();
        expect(StyleSheet.flatten(getByHostType('ScrollView', tree.container).props.contentContainerStyle).paddingTop).toBeUndefined();
        expect(scrimOf(tree)).toBeUndefined();
      });

      it('scrollEnabled={false} 본문은 헤더 높이만큼 내린다 — 흐르지 않으니 페이드 없음', async () => {
        mockInsetTop = 24;
        const tree = await renderUnderHeader(<ZSScreen scrollEnabled={false}><Text>Test</Text></ZSScreen>);
        const bodyWrapper = queryAllByHostType('View', tree.container).find((node: any) => StyleSheet.flatten(node.props.style)?.paddingTop === 80);
        expect(bodyWrapper && within(bodyWrapper).queryByText('Test')).toBeTruthy();
        expect(scrimOf(tree)).toBeUndefined();
      });

      describe('refreshControl 스피너 위치', () => {
        const refreshControlOf = (tree: Awaited<ReturnType<typeof render>>) => getByHostType('ScrollView', tree.container).props.refreshControl;

        it('헤더가 덮으면 스피너를 헤더 높이만큼 내린다 — 나머지 props 는 그대로다', async () => {
          mockInsetTop = 24;
          const onRefresh = jest.fn();
          const tree = await renderUnderHeader(
            <ZSScreen refreshControl={<RefreshControl refreshing onRefresh={onRefresh} colors={['#ff0000']} />}>
              <Text>Test</Text>
            </ZSScreen>,
          );
          expect(refreshControlOf(tree).props).toEqual({ refreshing: true, onRefresh, colors: ['#ff0000'], progressViewOffset: 80 });
        });

        it('앱이 progressViewOffset 을 정했으면 그대로 둔다', async () => {
          mockInsetTop = 24;
          const control = <RefreshControl refreshing={false} progressViewOffset={12} />;
          const tree = await renderUnderHeader(<ZSScreen refreshControl={control}><Text>Test</Text></ZSScreen>);
          expect(refreshControlOf(tree)).toBe(control);
        });

        it('불투명 헤더거나 topComponent 가 비키면 내리지 않는다', async () => {
          const control = <RefreshControl refreshing={false} />;
          const opaque = await renderUnderHeader(<ZSScreen refreshControl={control}><Text>Test</Text></ZSScreen>);
          expect(refreshControlOf(opaque)).toBe(control);
          await opaque.unmount();

          mockInsetTop = 24;
          const withTop = await renderUnderHeader(<ZSScreen refreshControl={control} topComponent={<Text>Top</Text>}><Text>Test</Text></ZSScreen>);
          expect(refreshControlOf(withTop)).toBe(control);
        });
      });

      it('edges 를 지정하면 헤더 처리도 하지 않는다 — 앱이 useHeaderInset 으로 직접 맞춘다', async () => {
        mockInsetTop = 24;
        const tree = await renderUnderHeader(<ZSScreen edges={['top']}><Text>Test</Text></ZSScreen>);
        expect(rootOf(tree).props.edges).toEqual(['top']);
        expect(scrimOf(tree)).toBeUndefined();
      });
    });
  });
});

describe('ZSScreen 떠 있는 탭 바 아래 (Android 탭 기본)', () => {
  const platform = Platform as { OS: string };
  const rootOf = (tree: Awaited<ReturnType<typeof render>>) => nth(queryAllByHostType('SafeAreaView', tree.container), 0);
  const renderInTab = (ui: React.ReactElement) => render(<TabBarInsetContext.Provider value={84}>{ui}</TabBarInsetContext.Provider>);

  beforeEach(() => {
    platform.OS = 'android';
    mockInsetBottom = 32;
  });
  afterEach(() => {
    platform.OS = 'ios';
    mockInsetBottom = 0;
    mockKeyboardHeight = 0;
  });

  it('스크롤 뷰는 탭 바 뒤까지 깔고 콘텐츠를 아래 inset·탭 바 위에서 끝낸다 — 루트 하단 inset 은 뺀다', async () => {
    const tree = await renderInTab(<ZSScreen><Text>Test</Text></ZSScreen>);
    expect(rootOf(tree).props.edges).toEqual(['left', 'right', 'top']);
    expect(StyleSheet.flatten(getByHostType('ScrollView', tree.container).props.contentContainerStyle).paddingBottom).toBe(32 + 84);
  });

  it('키보드가 열리면 키보드 높이(+포커스 여유)가 대신한다 — 키보드가 탭 바를 덮는다', async () => {
    mockKeyboardHeight = 300;
    const tree = await renderInTab(<ZSScreen><Text>Test</Text></ZSScreen>);
    expect(StyleSheet.flatten(getByHostType('ScrollView', tree.container).props.contentContainerStyle).paddingBottom).toBe(300 + 30);
  });

  it('고정 본문은 루트가 아래 inset 을 받고 탭 바만큼 더 비킨다', async () => {
    const tree = await renderInTab(<ZSScreen scrollEnabled={false}><Text>Test</Text></ZSScreen>);
    expect(rootOf(tree).props.edges).toEqual(['left', 'right', 'top', 'bottom']);
    const body = queryAllByHostType('View', tree.container).find((node: any) => StyleSheet.flatten(node.props.style)?.paddingBottom === 84);
    expect(body && within(body).getByText('Test')).toBeTruthy();
  });

  it('bottomComponent 는 탭 바 위에 놓인다 — 본문·bottomComponent 열이 탭 바 높이만큼 위에서 끝난다', async () => {
    const tree = await renderInTab(<ZSScreen bottomComponent={<Text>CTA</Text>}><Text>Test</Text></ZSScreen>);
    const column = queryAllByHostType('View', tree.container).find((node: any) => StyleSheet.flatten(node.props.style)?.marginBottom === 84);
    expect(column && within(column).getByText('CTA')).toBeTruthy();
    expect(StyleSheet.flatten(getByHostType('ScrollView', tree.container).props.contentContainerStyle).paddingBottom).toBe(0);
  });

  it('창 아래끝에 닿지 않은 컨테이너(아래 inset 0)나 iOS 는 아무것도 더하지 않는다', async () => {
    mockInsetBottom = 0;
    const offBottom = await renderInTab(<ZSScreen><Text>Test</Text></ZSScreen>);
    expect(rootOf(offBottom).props.edges).toEqual(['left', 'right', 'top', 'bottom']);
    await offBottom.unmount();

    platform.OS = 'ios';
    mockInsetBottom = 34;
    const ios = await renderInTab(<ZSScreen><Text>Test</Text></ZSScreen>);
    expect(StyleSheet.flatten(getByHostType('ScrollView', ios.container).props.contentContainerStyle).paddingBottom).toBe(0);
  });
});
