import React from 'react';
import { act, fireEvent, render as rtlRender, renderHook } from '@testing-library/react-native';
import { Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { HeaderHeightContext } from 'expo-router/react-navigation';
import { TabBarInsetContext } from '../../navigation/useTabBarInset';
import ZSPaneLayout from '../../ui/ZSPaneLayout';
import { LayoutProvider } from '../../layout/LayoutProvider';
import { usePaneLayout } from '../../layout/PaneContext';
import type { WindowObserverProps } from '../../layout/WindowObserver.types';
import { getByHostType, nth, queryAllByHostType } from '../utils/hostQueries';
import { getTestTheme } from '../utils/theme';
import { HeaderFillContext } from '../../navigation/headerFill';

let observe: WindowObserverProps['onObserve'] = () => {};

jest.mock('../../layout/WindowObserver', () => ({
  __esModule: true,
  default: ({ onObserve, children }: WindowObserverProps) => {
    observe = onObserve;
    return children;
  },
}));

jest.mock('../../context/ThemeContext', () => require('../utils/theme').mockThemeModule());

let mockWindowFrame: [number, number, number, number] | null = null;

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  const React = require('react');
  return {
    ...RN,
    View: React.forwardRef((props: any, ref: any) => {
      React.useImperativeHandle(ref, () =>
        mockWindowFrame && { measureInWindow: (callback: (...frame: number[]) => void) => callback(...mockWindowFrame!) });
      return React.createElement('View', props, props.children);
    }),
  };
});

beforeEach(() => {
  mockWindowFrame = null;
});

let mockInsetTop = 0;
let mockFrameY = 0;
let mockInsetBottom = 0;
let mockInsetRight = 0;

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, ...props }: any) => React.createElement('SafeAreaView', props, children),
    SafeAreaProvider: ({ children, ...props }: any) => React.createElement('SafeAreaProvider', props, children),
    useSafeAreaInsets: () => ({ top: mockInsetTop, bottom: mockInsetBottom, left: 0, right: mockInsetRight }),
    useSafeAreaFrame: () => ({ x: 0, y: mockFrameY, width: 750, height: 832 }),
  };
});

const IPAD_LANDSCAPE = { width: 1210, height: 834, horizontalSizeClass: 'regular', verticalSizeClass: 'regular', readableWidth: 896 } as const;
const IPHONE_PORTRAIT = { width: 402, height: 874, horizontalSizeClass: 'compact', verticalSizeClass: 'regular', readableWidth: 386 } as const;

const render = async (ui: React.ReactElement, observation: Parameters<WindowObserverProps['onObserve']>[0]) => {
  const tree = await rtlRender(ui, { wrapper: LayoutProvider });
  await act(() => observe(observation));
  return tree;
};

const PANES = { primary: <Text>목록</Text>, secondary: <Text>상세</Text> };

const edgesOf = (tree: Awaited<ReturnType<typeof render>>, testID: string) =>
  getByHostType('SafeAreaView', tree.getByTestId(testID)).props.edges;

describe('ZSPaneLayout', () => {
  it('compact 창은 1단 — 기본(hide)은 secondary 를 그리지 않는다', async () => {
    const tree = await render(<ZSPaneLayout {...PANES} />, IPHONE_PORTRAIT);
    expect(tree.getByText('목록')).toBeTruthy();
    expect(tree.queryByText('상세')).toBeNull();
    expect(edgesOf(tree, 'zs-pane-primary')).toEqual(['left', 'right', 'top', 'bottom']);
  });

  it("compact 창에서 compactBehavior='stack' 이면 primary 아래에 secondary 를 쌓는다", async () => {
    const tree = await render(<ZSPaneLayout {...PANES} compactBehavior="stack" />, IPHONE_PORTRAIT);
    expect(tree.getByText('목록')).toBeTruthy();
    expect(tree.getByText('상세')).toBeTruthy();
    expect(tree.queryByTestId('zs-pane-secondary')).toBeNull();
  });

  it('넓은 창은 비율로 2단 — 각 pane 은 자기 쪽 inset 만 받는다', async () => {
    const tree = await render(<ZSPaneLayout {...PANES} />, IPAD_LANDSCAPE);
    const primary = tree.getByTestId('zs-pane-primary');
    expect(StyleSheet.flatten(primary.props.style).width).toBe(Math.round((1210 - StyleSheet.hairlineWidth) * 0.4));
    expect(edgesOf(tree, 'zs-pane-primary')).toEqual(['left', 'top', 'bottom']);
    expect(edgesOf(tree, 'zs-pane-secondary')).toEqual(['right', 'top', 'bottom']);
    expect(tree.getByText('상세')).toBeTruthy();
  });

  it('비율은 레일 같은 좌우 inset 을 뺀 보이는 폭에 곱한다 — 끝 쪽 pane 은 그 inset 을 패딩으로 받는다 (iPhone Duo 펼침)', async () => {
    mockInsetRight = 84;
    const DUO_OPEN = { width: 951, height: 669, horizontalSizeClass: 'regular', verticalSizeClass: 'regular', readableWidth: 867 } as const;
    const tree = await render(<ZSPaneLayout {...PANES} primaryFraction={0.5} />, DUO_OPEN);
    expect(StyleSheet.flatten(tree.getByTestId('zs-pane-primary').props.style).width).toBe(Math.round((951 - 84 - StyleSheet.hairlineWidth) * 0.5));
    expect(edgesOf(tree, 'zs-pane-secondary')).toEqual(['right', 'top', 'bottom']);
    mockInsetRight = 0;
  });

  it('pane 폭은 바깥 View 만 갖고 SafeAreaView 는 항상 flex: 1 — Android 에서 폭·inset 이 함께 바뀌며 이전 폭이 남는 문제 방지', async () => {
    const tree = await render(<ZSPaneLayout {...PANES} />, IPAD_LANDSCAPE);
    const primary = tree.getByTestId('zs-pane-primary');
    expect(StyleSheet.flatten(primary.props.style).width).toBe(Math.round((1210 - StyleSheet.hairlineWidth) * 0.4));
    expect(StyleSheet.flatten(getByHostType('SafeAreaView', primary).props.style)).toEqual({ flex: 1 });
  });

  it('1단 ↔ 2단이 바뀌면 pane 트리를 새로 마운트한다 (Android 에서 이전 네이티브 프레임이 남는 문제 방지)', async () => {
    let mounts = 0;
    function MountProbe() {
      React.useEffect(() => { mounts += 1; }, []);
      return <Text>목록</Text>;
    }
    const tree = await render(<ZSPaneLayout primary={<MountProbe />} secondary={<Text>상세</Text>} />, IPAD_LANDSCAPE);
    const base = mounts;
    await act(() => observe(IPHONE_PORTRAIT));
    expect(mounts).toBe(base + 1);
    await act(() => observe({ ...IPHONE_PORTRAIT, height: 880 }));
    expect(mounts).toBe(base + 1);
    await tree.unmount();
  });

  it('scroll 이면 iOS 는 상·하를 UIKit 자동 조정에 맡기고 좌우만 패딩한다', async () => {
    const tree = await render(<ZSPaneLayout {...PANES} scroll />, IPAD_LANDSCAPE);
    expect(edgesOf(tree, 'zs-pane-primary')).toEqual(['left']);
    expect(edgesOf(tree, 'zs-pane-secondary')).toEqual(['right']);
    expect(queryAllByHostType('ScrollView', tree.container).map((node) => node.props.contentInsetAdjustmentBehavior)).toEqual(['automatic', 'automatic']);
  });

  it('iOS 기본은 border hairline 구분선이고 간격은 없다(UISplitViewController)', async () => {
    const { colors } = getTestTheme();
    const tree = await render(<ZSPaneLayout {...PANES} testID="row" />, IPAD_LANDSCAPE);
    expect(tree.queryByTestId('zs-pane-gap')).toBeNull();
    const row = tree.getByTestId('row');
    const divider = row.children[1] as any;
    expect(StyleSheet.flatten(divider.props.style)).toMatchObject({ width: StyleSheet.hairlineWidth, backgroundColor: colors.border });
  });

  it('spacing 을 주면 iOS 도 그만큼 비우고 구분선 대신 간격을 둔다', async () => {
    const tree = await render(<ZSPaneLayout {...PANES} spacing={16} />, IPAD_LANDSCAPE);
    expect(StyleSheet.flatten(tree.getByTestId('zs-pane-gap').props.style)).toEqual({ width: 16 });
  });

  it('backgroundColor 를 주지 않으면 surface 로 칠한다', async () => {
    const { colors } = getTestTheme();
    const tree = await render(<ZSPaneLayout {...PANES} />, IPAD_LANDSCAPE);
    expect(StyleSheet.flatten(getByHostType('SafeAreaProvider', tree.container).props.style).backgroundColor).toBe(colors.background);
    await tree.unmount();
    const custom = await render(<ZSPaneLayout {...PANES} backgroundColor="#101010" />, IPAD_LANDSCAPE);
    expect(StyleSheet.flatten(getByHostType('SafeAreaProvider', custom.container).props.style).backgroundColor).toBe('#101010');
  });

  it('backgroundColor 는 테마 색 이름도 받는다', async () => {
    const { colors } = getTestTheme();
    const tree = await render(<ZSPaneLayout {...PANES} backgroundColor="surface2" />, IPAD_LANDSCAPE);
    expect(StyleSheet.flatten(getByHostType('SafeAreaProvider', tree.container).props.style).backgroundColor).toBe(colors.surface2);
  });

  it('구분선은 끄거나 직접 그릴 수 있다', async () => {
    const custom = await render(<ZSPaneLayout {...PANES} divider={<Text>구분</Text>} />, IPAD_LANDSCAPE);
    expect(custom.getByText('구분')).toBeTruthy();
    await custom.unmount();

    const none = await render(<ZSPaneLayout {...PANES} divider={false} />, IPAD_LANDSCAPE);
    expect(StyleSheet.flatten(none.getByTestId('zs-pane-primary').props.style).width).toBe(484);
  });

  it('ScrollView 안에 두면 개발 모드에서 경고한다', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    await render(
      <ScrollView.Context.Provider value={{ horizontal: false }}>
        <ZSPaneLayout {...PANES} />
      </ScrollView.Context.Provider>,
      IPAD_LANDSCAPE,
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('[ZSPaneLayout] ScrollView 안에 두지 마세요'));
    warn.mockRestore();
  });

  describe('usePaneLayout', () => {
    function PaneProbe({ name }: { name: string }) {
      const pane = usePaneLayout();
      return <Text>{`${name}:${pane.role}-${pane.width}-${pane.widthClass}`}</Text>;
    }

    const PROBES = { primary: <PaneProbe name="p" />, secondary: <PaneProbe name="s" /> };

    it('각 pane 은 자기 폭과 그 폭의 크기 클래스를 준다 — 첫 프레임은 분할 추정값', async () => {
      const tree = await render(<ZSPaneLayout {...PROBES} />, IPAD_LANDSCAPE);
      expect(tree.getByText('p:primary-484-compact')).toBeTruthy();
      expect(tree.getByText(`s:secondary-${1210 - StyleSheet.hairlineWidth - 484}-medium`)).toBeTruthy();
    });

    it('onLayout 으로 inset 을 뺀 실제 콘텐츠 폭이 확정된다', async () => {
      const tree = await render(<ZSPaneLayout {...PROBES} />, IPAD_LANDSCAPE);
      const content = nth(tree.getByTestId('zs-pane-secondary').queryAll((node) => typeof node.props.onLayout === 'function'), 0);
      await fireEvent(content, 'layout', { nativeEvent: { layout: { x: 0, y: 0, width: 664, height: 800 } } });
      expect(tree.getByText('s:secondary-664-medium')).toBeTruthy();
    });

    it('1단에서는 유일한 pane 이 single 이다 (stack 이면 secondary 도 같은 pane)', async () => {
      const tree = await render(<ZSPaneLayout {...PROBES} compactBehavior="stack" />, IPHONE_PORTRAIT);
      expect(tree.getByText('p:single-402-compact')).toBeTruthy();
      expect(tree.getByText('s:single-402-compact')).toBeTruthy();
    });

    it('pane 크기 클래스는 창 크기 클래스를 넘지 않는다 (iPhone 가로 1단 874pt 도 compact)', async () => {
      const tree = await render(
        <ZSPaneLayout {...PROBES} />,
        { width: 874, height: 402, horizontalSizeClass: 'compact', verticalSizeClass: 'compact', readableWidth: 734 },
      );
      expect(tree.getByText('p:single-874-compact')).toBeTruthy();
    });

    it('pane 밖에서 쓰면 명확한 에러를 던진다', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      await expect(renderHook(() => usePaneLayout())).rejects.toThrow('usePaneLayout must be used within a ZSPaneLayout pane');
      jest.mocked(console.error).mockRestore();
    });
  });
});

describe('ZSPaneLayout 접힘선 경계 분할', () => {
  const FOLD7_OPEN = {
    width: 749.7,
    height: 832,
    widthClass: 'medium',
    heightClass: 'medium',
    displayFeatures: [{ type: 'fold', x: 374.9, y: 0, width: 0, height: 832, orientation: 'vertical', state: 'flat', active: false }],
  } as const;
  const BOOK = {
    ...FOLD7_OPEN,
    displayFeatures: [{ ...FOLD7_OPEN.displayFeatures[0], state: 'halfOpened', active: true }],
  } as const;

  const renderAt = async (x: number, width: number, observation: object = BOOK) => {
    mockWindowFrame = [x, 100, width, 700];
    const tree = await rtlRender(<ZSPaneLayout {...PANES} testID="pane" />, { wrapper: LayoutProvider });
    await act(() => observe(observation as any));
    await fireEvent(tree.getByTestId('pane'), 'layout', { nativeEvent: { layout: { width, height: 700 } } });
    return tree;
  };

  it('화면을 가르는 접힘선 위치를 레이아웃 좌표로 옮겨 그 경계로 primary 폭을 정한다', async () => {
    const tree = await renderAt(0, 749.7);
    expect(tree.getByTestId('zs-pane-primary').props.style).toEqual({ width: 374.9 });
  });

  it('가르는 접힘선이면 레이아웃이 밀려 한쪽이 좁아도 그 경계를 지킨다 (레일 옆)', async () => {
    const tree = await renderAt(80, 669.7);
    expect(tree.getByTestId('zs-pane-primary').props.style).toEqual({ width: 374.9 - 80 });
  });

  it('평평한 접힘선은 경계로 나누지 않고 비율 분할이다 (Fold7 펼침)', async () => {
    const tree = await renderAt(0, 749.7, FOLD7_OPEN);
    expect(tree.getByTestId('zs-pane-primary').props.style).toEqual({ width: 300 });
  });
});

describe('ZSPaneLayout 테이블탑', () => {
  const TABLETOP = {
    width: 832,
    height: 749.7,
    widthClass: 'medium',
    heightClass: 'medium',
    displayFeatures: [{ type: 'fold', x: 0, y: 374.9, width: 832, height: 0, orientation: 'horizontal', state: 'halfOpened', active: true }],
  } as const;

  const renderTabletop = async (tabletop: boolean) => {
    mockWindowFrame = [0, 116, 832, 633.7];
    const tree = await rtlRender(<ZSPaneLayout {...PANES} tabletop={tabletop} testID="pane" />, { wrapper: LayoutProvider });
    await act(() => observe(TABLETOP as any));
    await fireEvent(tree.getByTestId('pane'), 'layout', { nativeEvent: { layout: { width: 832, height: 633.7 } } });
    return tree;
  };

  it('켜면 접힘선 위가 primary(위 inset), 아래가 secondary(아래 inset) — 좌우는 둘 다', async () => {
    const tree = await renderTabletop(true);
    expect(tree.getByTestId('pane').props.style).toEqual({ flex: 1, flexDirection: 'column' });
    expect(tree.getByTestId('zs-pane-primary').props.style).toEqual({ height: 374.9 - 116 });
    expect(edgesOf(tree, 'zs-pane-primary')).toEqual(['left', 'right', 'top']);
    expect(edgesOf(tree, 'zs-pane-secondary')).toEqual(['left', 'right', 'bottom']);
  });

  it('끄면(기본) 가로 접힘선이어도 좌우 비율 분할', async () => {
    const tree = await renderTabletop(false);
    expect(tree.getByTestId('pane').props.style).toEqual({ flex: 1, flexDirection: 'row' });
  });

  it('usePaneLayout 높이 — 위 pane 은 접힘선까지라 창이 medium 이어도 compact 다', async () => {
    function HeightProbe({ name }: { name: string }) {
      const pane = usePaneLayout();
      return <Text>{`${name}:${Math.round(pane.height)}-${pane.heightClass}`}</Text>;
    }
    mockWindowFrame = [0, 116, 832, 633.7];
    const tree = await rtlRender(<ZSPaneLayout primary={<HeightProbe name="p" />} secondary={<HeightProbe name="s" />} tabletop testID="pane" />, {
      wrapper: LayoutProvider,
    });
    await act(() => observe(TABLETOP as any));
    await fireEvent(tree.getByTestId('pane'), 'layout', { nativeEvent: { layout: { width: 832, height: 633.7 } } });
    expect(tree.getByText(`p:${Math.round(374.9 - 116)}-compact`)).toBeTruthy();
    expect(tree.getByText(`s:${Math.round(633.7 - (374.9 - 116))}-compact`)).toBeTruthy();

    const content = nth(tree.getByTestId('zs-pane-primary').queryAll((node) => typeof node.props.onLayout === 'function'), 0);
    await fireEvent(content, 'layout', { nativeEvent: { layout: { x: 0, y: 0, width: 832, height: 240 } } });
    expect(tree.getByText('p:240-compact')).toBeTruthy();
  });
});

describe('usePaneLayout 높이 (2단·1단)', () => {
  function HeightProbe({ name }: { name: string }) {
    const pane = usePaneLayout();
    return <Text>{`${name}:${pane.height}-${pane.heightClass}`}</Text>;
  }

  it('좌우 2단은 레이아웃 높이를 나눠 갖지 않는다 — 측정 전에는 창 높이로 추정', async () => {
    const tree = await render(<ZSPaneLayout primary={<HeightProbe name="p" />} secondary={<HeightProbe name="s" />} />, IPAD_LANDSCAPE);
    expect(tree.getByText('p:834-medium')).toBeTruthy();
    expect(tree.getByText('s:834-medium')).toBeTruthy();
  });

  it('pane 높이 클래스는 창 높이 클래스를 넘지 않는다', async () => {
    const tree = await render(<ZSPaneLayout primary={<HeightProbe name="p" />} />, IPHONE_PORTRAIT);
    const content = nth(tree.getByTestId('zs-pane-primary').queryAll((node) => typeof node.props.onLayout === 'function'), 0);
    await fireEvent(content, 'layout', { nativeEvent: { layout: { x: 0, y: 0, width: 402, height: 960 } } });
    expect(tree.getByText('p:960-medium')).toBeTruthy();
  });
});

describe('투명 헤더 아래 (Android, useStackTheme 기본)', () => {
  const platform = Platform as { OS: string };
  const renderUnderHeader = (ui: React.ReactElement, observation: Parameters<WindowObserverProps['onObserve']>[0]) =>
    render(<HeaderHeightContext.Provider value={80}>{ui}</HeaderHeightContext.Provider>, observation);
  const paneOf = (tree: Awaited<ReturnType<typeof render>>, testID: string) => getByHostType('SafeAreaView', tree.getByTestId(testID));
  const scrimsOf = (tree: Awaited<ReturnType<typeof render>>) =>
    queryAllByHostType('View', tree.container).filter((node: any) => node.props.pointerEvents === 'none' && StyleSheet.flatten(node.props.style)?.height === 80);
  const ANDROID_OPEN = { width: 750, height: 832, horizontalSizeClass: 'regular', verticalSizeClass: 'regular', readableWidth: 640 } as const;

  beforeEach(() => {
    platform.OS = 'android';
    mockInsetTop = 24;
  });
  afterEach(() => {
    platform.OS = 'ios';
    mockInsetTop = 0;
    mockFrameY = 0;
  });

  it('고정 pane 은 위 inset 대신 헤더 높이(상태바 포함)만큼 비킨다', async () => {
    const tree = await renderUnderHeader(<ZSPaneLayout {...PANES} />, ANDROID_OPEN);
    for (const testID of ['zs-pane-primary', 'zs-pane-secondary']) {
      expect(paneOf(tree, testID).props.edges).not.toContain('top');
      expect(StyleSheet.flatten(paneOf(tree, testID).props.style).paddingTop).toBe(80);
    }
    expect(scrimsOf(tree)).toHaveLength(0);
  });

  it('스크롤 pane 은 헤더 뒤까지 깔고 콘텐츠만 내린 뒤 pane 마다 헤더 바탕을 깐다', async () => {
    const tree = await renderUnderHeader(<ZSPaneLayout {...PANES} scroll />, ANDROID_OPEN);
    const scrollViews = queryAllByHostType('ScrollView', tree.container);
    expect(scrollViews).toHaveLength(2);
    for (const scrollView of scrollViews) {
      expect(StyleSheet.flatten(scrollView.props.contentContainerStyle).paddingTop).toBe(80);
    }
    expect(paneOf(tree, 'zs-pane-primary').props.edges).toEqual(['left', 'bottom']);
    expect(scrimsOf(tree)).toHaveLength(2);
  });

  it('스크롤 pane 을 BlurTargetView 로 감싸고, 스크롤되면 그 pane 헤더 뒤를 흐린다 — 색은 바꾸지 않는다(iOS 스크롤 가장자리)', async () => {
    const { colors } = getTestTheme();
    const report = jest.fn();
    const ui = () => (
      <HeaderHeightContext.Provider value={80}>
        <HeaderFillContext.Provider value={report}>
          <ZSPaneLayout {...PANES} scroll backgroundColor={colors.surface1} />
        </HeaderFillContext.Provider>
      </HeaderHeightContext.Provider>
    );
    const tree = await render(ui(), ANDROID_OPEN);
    const targets = queryAllByHostType('BlurTargetView', tree.container);
    const blurs = queryAllByHostType('BlurView', tree.container);
    expect(targets).toHaveLength(2);
    expect(blurs).toHaveLength(2);
    blurs.forEach((blur: any, index: number) => {
      expect(blur.props.blurMethod).toBe('dimezisBlurViewSdk31Plus');
      expect(blur.props.blurTarget === nth(targets, index).props.forwardedRef).toBe(true);
      expect(queryAllByHostType('ScrollView', nth(targets, index))).toHaveLength(1);
      expect(StyleSheet.flatten(getByHostType('ScrollView', nth(targets, index)).props.style).backgroundColor).toBe(colors.surface1);
    });

    const opacities = () => scrimsOf(tree).map((node: any) => StyleSheet.flatten(node.queryAll((n: any) => typeof StyleSheet.flatten(n.props?.style)?.opacity === 'number')[0]?.props.style)?.opacity);
    expect(opacities()).toEqual([0, 0]);
    await fireEvent.scroll(nth(queryAllByHostType('ScrollView', tree.container), 0), { nativeEvent: { contentOffset: { x: 0, y: 40 } } });
    await tree.rerender(ui());
    expect(opacities()).toEqual([1, 0]);
    expect(scrimsOf(tree).map((node: any) => StyleSheet.flatten(node.props.style).backgroundColor)).toEqual([undefined, undefined]);
    expect(report).toHaveBeenLastCalledWith(expect.objectContaining({ from: colors.surface1, to: colors.surface1 }));
  });

  it('iOS 는 BlurTargetView 로 감싸지 않는다 — 시스템 스크롤 가장자리가 맡는다', async () => {
    platform.OS = 'ios';
    const tree = await renderUnderHeader(<ZSPaneLayout {...PANES} scroll />, ANDROID_OPEN);
    expect(queryAllByHostType('BlurTargetView', tree.container)).toHaveLength(0);
    expect(queryAllByHostType('BlurView', tree.container)).toHaveLength(0);
  });

  it('탭 레일 위 칸은 시작 쪽 pane 의 헤더 바탕만 따른다 — 끝 쪽 pane 은 레일에 닿지 않는다', async () => {
    const { colors } = getTestTheme();
    const report = jest.fn();
    await render(
      <HeaderHeightContext.Provider value={80}>
        <HeaderFillContext.Provider value={report}>
          <ZSPaneLayout {...PANES} scroll backgroundColor={colors.surface1} />
        </HeaderFillContext.Provider>
      </HeaderHeightContext.Provider>,
      ANDROID_OPEN,
    );
    const live = report.mock.calls.reduce((count, [fill]) => count + (fill === null ? -1 : 1), 0);
    expect(live).toBe(1);
    expect(report).toHaveBeenLastCalledWith(expect.objectContaining({ from: colors.surface1 }));
  });

  it('backgroundColor 를 색 이름으로 주면 흐릴 스크롤 뷰 바탕과 헤더 막도 그 색이다 — 탭 레일 위 칸은 바뀌지 않는다', async () => {
    const { colors } = getTestTheme();
    const report = jest.fn();
    const tree = await render(
      <HeaderHeightContext.Provider value={80}>
        <HeaderFillContext.Provider value={report}>
          <ZSPaneLayout {...PANES} scroll backgroundColor="surface3" />
        </HeaderFillContext.Provider>
      </HeaderHeightContext.Provider>,
      ANDROID_OPEN,
    );
    const scrollView = nth(queryAllByHostType('ScrollView', tree.container), 0);
    expect(StyleSheet.flatten(scrollView.props.style).backgroundColor).toBe(colors.surface3);
    expect(report).toHaveBeenLastCalledWith(expect.objectContaining({ from: colors.surface3 }));
  });

  it('Android 기본은 구분선 대신 M3 spacer 24dp 간격이다', async () => {
    mockInsetTop = 0;
    const tree = await render(<ZSPaneLayout {...PANES} />, { ...IPAD_LANDSCAPE, horizontalSizeClass: 'regular' });
    expect(StyleSheet.flatten(tree.getByTestId('zs-pane-gap').props.style)).toEqual({ width: 24 });
    expect(StyleSheet.flatten(tree.getByTestId('zs-pane-primary').props.style).width).toBe(Math.round((1210 - 24) * 0.4));
  });

  it('테이블탑은 위 pane 만 비키고, 위 inset 을 받지 않는 아래 pane 은 그대로 둔다', async () => {
    const TABLETOP = {
      width: 832,
      height: 749.7,
      widthClass: 'medium',
      heightClass: 'medium',
      displayFeatures: [{ type: 'fold', x: 0, y: 374.9, width: 832, height: 0, orientation: 'horizontal', state: 'halfOpened', active: true }],
    } as const;
    mockWindowFrame = [0, 0, 832, 749.7];
    const tree = await renderUnderHeader(<ZSPaneLayout {...PANES} tabletop testID="pane" />, TABLETOP as any);
    await fireEvent(tree.getByTestId('pane'), 'layout', { nativeEvent: { layout: { width: 832, height: 749.7 } } });
    expect(tree.getByTestId('pane').props.style).toEqual({ flex: 1, flexDirection: 'column' });
    expect(StyleSheet.flatten(paneOf(tree, 'zs-pane-primary').props.style).paddingTop).toBe(80);
    expect(paneOf(tree, 'zs-pane-secondary').props.edges).toEqual(['left', 'right', 'bottom']);
    expect(StyleSheet.flatten(paneOf(tree, 'zs-pane-secondary').props.style).paddingTop).toBeUndefined();
  });

  it('불투명 헤더면(레이아웃이 헤더 아래에서 시작해 상단 inset 0) 그대로 위 inset 을 받는다', async () => {
    mockFrameY = 80;
    mockInsetTop = 0;
    const tree = await renderUnderHeader(<ZSPaneLayout {...PANES} />, ANDROID_OPEN);
    expect(paneOf(tree, 'zs-pane-primary').props.edges).toContain('top');
    expect(StyleSheet.flatten(paneOf(tree, 'zs-pane-primary').props.style).paddingTop).toBeUndefined();
  });
});

describe('떠 있는 탭 바 아래 (Android 탭 기본)', () => {
  const platform = Platform as { OS: string };
  const renderInTab = (ui: React.ReactElement, observation: Parameters<WindowObserverProps['onObserve']>[0]) =>
    render(<TabBarInsetContext.Provider value={84}>{ui}</TabBarInsetContext.Provider>, observation);
  const paneOf = (tree: Awaited<ReturnType<typeof render>>, testID: string) => getByHostType('SafeAreaView', tree.getByTestId(testID));
  const ANDROID_OPEN = { width: 750, height: 832, horizontalSizeClass: 'regular', verticalSizeClass: 'regular', readableWidth: 640 } as const;

  beforeEach(() => {
    platform.OS = 'android';
    mockInsetBottom = 32;
  });
  afterEach(() => {
    platform.OS = 'ios';
    mockInsetBottom = 0;
  });

  it('스크롤 pane 은 탭 바 뒤까지 깔고 콘텐츠를 아래 inset·탭 바 위에서 끝낸다', async () => {
    const tree = await renderInTab(<ZSPaneLayout {...PANES} scroll />, ANDROID_OPEN);
    for (const scrollView of queryAllByHostType('ScrollView', tree.container)) {
      expect(StyleSheet.flatten(scrollView.props.contentContainerStyle).paddingBottom).toBe(32 + 84);
    }
    expect(paneOf(tree, 'zs-pane-primary').props.edges).not.toContain('bottom');
  });

  it('고정 pane 은 아래 inset 을 받고 탭 바만큼 더 비킨다', async () => {
    const tree = await renderInTab(<ZSPaneLayout {...PANES} />, ANDROID_OPEN);
    expect(paneOf(tree, 'zs-pane-primary').props.edges).toContain('bottom');
    expect(StyleSheet.flatten(paneOf(tree, 'zs-pane-primary').props.style).paddingBottom).toBe(84);
  });

  it('extendUnderTabBar 고정 pane 은 탭 바 뒤(아래 끝)까지 깔린다 — 아래 inset·탭 바 여백을 콘텐츠에 맡긴다', async () => {
    const tree = await renderInTab(<ZSPaneLayout {...PANES} extendUnderTabBar />, ANDROID_OPEN);
    for (const testID of ['zs-pane-primary', 'zs-pane-secondary']) {
      expect(paneOf(tree, testID).props.edges).not.toContain('bottom');
      expect(StyleSheet.flatten(paneOf(tree, testID).props.style).paddingBottom).toBeUndefined();
    }
  });

  it('extendUnderTabBar 는 떠 있는 탭 바가 없으면 고정 pane 을 그대로 둔다', async () => {
    const tree = await render(<ZSPaneLayout {...PANES} extendUnderTabBar />, ANDROID_OPEN);
    expect(paneOf(tree, 'zs-pane-primary').props.edges).toContain('bottom');
  });
});
