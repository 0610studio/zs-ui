import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import ZSTabNavigator from '../../navigation/ZSTabNavigator';
import { getByHostType, queryAllByHostType } from '../utils/hostQueries';
import { setTestTheme } from '../utils/theme';
import { contrastRatio } from '../utils/contrast';

jest.mock('../../context/ThemeContext', () => require('../utils/theme').mockThemeModule());

const FONTS = { 400: 'Pretendard-Regular', 600: 'Pretendard-SemiBold', 700: 'Pretendard-Bold' };
const { colors } = setTestTheme({ fonts: FONTS });

const renderTabs = async (ui: React.ReactElement) => (await render(ui)).container;

describe('ZSTabNavigator', () => {
  it('ZSTabNavigator.Screen 을 NativeTabs.Trigger(아이콘·라벨)로 바꾼다', async () => {
    const root = await renderTabs(
      <ZSTabNavigator>
        <ZSTabNavigator.Screen name="index" options={{ title: '기록', icon: { sf: 'square.and.pencil', md: 'edit' } }} />
        <ZSTabNavigator.Screen name="settings" options={{ title: '설정', hidden: true }} />
      </ZSTabNavigator>,
    );
    const triggers = queryAllByHostType('NativeTabs.Trigger', root);
    expect(triggers.map((node) => [node.props.name, node.props.hidden])).toEqual([['index', undefined], ['settings', true]]);
    const icon = getByHostType('NativeTabs.Trigger.Icon', root);
    expect(icon.props).toEqual({ sf: 'square.and.pencil', md: 'edit' });
    const labels = queryAllByHostType('NativeTabs.Trigger.Label', root);
    expect(labels.map((node) => node.props.text)).toEqual(['기록', '설정']);
  });

  it('accessibilityLabel·disabled·listeners 를 Trigger 로 넘긴다 — disabled 는 네이티브가 선택을 막고 tabPress 는 보낸다', async () => {
    const tabPress = jest.fn();
    const root = await renderTabs(
      <ZSTabNavigator>
        <ZSTabNavigator.Screen name="index" options={{ title: '홈' }} />
        <ZSTabNavigator.Screen name="friends" options={{ title: '친구', accessibilityLabel: '친구 탭', disabled: true }} listeners={{ tabPress }} />
      </ZSTabNavigator>,
    );
    const [home, friends] = queryAllByHostType('NativeTabs.Trigger', root);
    expect(friends?.props).toMatchObject({ name: 'friends', accessibilityLabel: '친구 탭', disabled: true, listeners: { tabPress } });
    expect(home?.props.accessibilityLabel).toBeUndefined();
    expect(home?.props.disabled).toBeUndefined();
    expect(home?.props.listeners).toBeUndefined();
  });

  it('이미지(src) 아이콘은 template 으로 넘긴다 — 선택 색이 칠해지게', async () => {
    const src = { uri: 'file:///tab.png' };
    const root = await renderTabs(
      <ZSTabNavigator>
        <ZSTabNavigator.Screen name="index" options={{ title: '기록', icon: { src } }} />
      </ZSTabNavigator>,
    );
    expect(getByHostType('NativeTabs.Trigger.Icon', root).props).toEqual({ src, renderingMode: 'template' });
  });

  it('badge: true 는 점(빈 문자열), 숫자·문자는 그 값, false 는 뱃지 없음', async () => {
    const root = await renderTabs(
      <ZSTabNavigator>
        <ZSTabNavigator.Screen name="a" options={{ title: 'A', badge: true }} />
        <ZSTabNavigator.Screen name="b" options={{ title: 'B', badge: 3 }} />
        <ZSTabNavigator.Screen name="c" options={{ title: 'C', badge: false }} />
      </ZSTabNavigator>,
    );
    const badges = queryAllByHostType('NativeTabs.Trigger.Badge', root);
    expect(badges.map((node) => node.props.text)).toEqual(['', '3']);
  });

  it('선택 색만 주색 표시색(primaryMark)으로 넘기고 바 재질·비선택 색·서체는 시스템에 맡긴다(Liquid Glass)', async () => {
    const root = await renderTabs(<ZSTabNavigator><ZSTabNavigator.Screen name="a" options={{ title: 'A' }} /></ZSTabNavigator>);
    const tabs = getByHostType('NativeTabs', root);
    expect(tabs.props).toMatchObject({
      tintColor: colors.primaryMark,
      iconColor: { default: undefined, selected: colors.primaryMark },
      labelStyle: {
        default: { fontFamily: undefined, color: undefined },
        selected: { fontFamily: undefined, color: colors.primaryMark },
      },
      badgeBackgroundColor: colors.error,
      badgeTextColor: '#ffffff',
      backgroundColor: undefined,
      indicatorColor: colors.surface4,
    });
  });

  it('unselectedIconColor·unselectedLabelColor 는 비선택 아이콘·라벨 색으로 — 색 역할 이름은 테마 색으로 바꾼다', async () => {
    const root = await renderTabs(
      <ZSTabNavigator unselectedIconColor="textSecondary" unselectedLabelColor="#888888">
        <ZSTabNavigator.Screen name="a" options={{ title: 'A' }} />
      </ZSTabNavigator>,
    );
    expect(getByHostType('NativeTabs', root).props).toMatchObject({
      iconColor: { default: colors.textSecondary, selected: colors.primaryMark },
      labelStyle: { default: { color: '#888888' }, selected: { color: colors.primaryMark } },
    });
  });

  it('다크 뱃지 바탕은 흰 숫자가 읽히는 진한 빨강이다 — iOS 는 숫자 색을 받지 않는다', async () => {
    const dark = setTestTheme({ mode: 'dark', fonts: FONTS }).colors;
    try {
      const root = await renderTabs(<ZSTabNavigator><ZSTabNavigator.Screen name="a" options={{ title: 'A', badge: 3 }} /></ZSTabNavigator>);
      const { badgeBackgroundColor, badgeTextColor } = getByHostType('NativeTabs', root).props;
      expect(badgeBackgroundColor).not.toBe(dark.error);
      expect(contrastRatio('#ffffff', badgeBackgroundColor)).toBeGreaterThanOrEqual(4.5);
      expect(badgeTextColor).toBe('#ffffff');
    } finally {
      setTestTheme({ fonts: FONTS });
    }
  });

  it("role='search' 는 시스템 검색 탭으로 넘긴다", async () => {
    const root = await renderTabs(
      <ZSTabNavigator>
        <ZSTabNavigator.Screen name="index" options={{ title: '홈' }} />
        <ZSTabNavigator.Screen name="search" options={{ title: '검색', role: 'search' }} />
      </ZSTabNavigator>,
    );
    expect(queryAllByHostType('NativeTabs.Trigger', root).map((node) => node.props.role)).toEqual([undefined, 'search']);
  });

  it('ios.bottomAccessory 를 탭 바 위 액세서리(BottomAccessory)로 그린다', async () => {
    const root = await renderTabs(
      <ZSTabNavigator ios={{ bottomAccessory: <Text>재생 중</Text> }}>
        <ZSTabNavigator.Screen name="a" options={{ title: 'A' }} />
      </ZSTabNavigator>,
    );
    const accessory = getByHostType('NativeTabs.BottomAccessory', root);
    expect(accessory.queryAll((node) => node.props.children === '재생 중')).toHaveLength(1);
  });

  it('bottomAccessory 가 없으면 액세서리를 두지 않는다', async () => {
    const root = await renderTabs(<ZSTabNavigator><ZSTabNavigator.Screen name="a" options={{ title: 'A' }} /></ZSTabNavigator>);
    expect(queryAllByHostType('NativeTabs.BottomAccessory', root)).toHaveLength(0);
  });

  it('ios 옵션을 넘기고, ZSTabNavigator.Screen 이 아닌 자식은 무시한다', async () => {
    const root = await renderTabs(
      <ZSTabNavigator ios={{ minimizeBehavior: 'onScrollDown', disableTransparentOnScrollEdge: true }}>
        <Text>무시</Text>
        <ZSTabNavigator.Screen name="a" options={{ title: 'A' }} />
      </ZSTabNavigator>,
    );
    const tabs = getByHostType('NativeTabs', root);
    expect(tabs.props.minimizeBehavior).toBe('onScrollDown');
    expect(tabs.props.disableTransparentOnScrollEdge).toBe(true);
    expect(queryAllByHostType('NativeTabs.Trigger', root)).toHaveLength(1);
    expect(root.queryAll((node) => node.props.children === '무시')).toHaveLength(0);
  });

  describe('ios.sidebar', () => {
    it('지정하면 NativeTabs preferredPlacement 로 넘긴다', async () => {
      const root = await renderTabs(<ZSTabNavigator ios={{ sidebar: 'sidebar' }}><ZSTabNavigator.Screen name="a" options={{ title: 'A' }} /></ZSTabNavigator>);
      const tabs = getByHostType('NativeTabs', root);
      expect(tabs.props.preferredPlacement).toBe('sidebar');
      expect(tabs.props).not.toHaveProperty('sidebarAdaptable');
      expect(tabs.props).not.toHaveProperty('unstable_nativeProps');
    });

    it('미지정이면 플랫폼 기본(탭바) — 배치를 넘기지 않는다', async () => {
      const root = await renderTabs(<ZSTabNavigator><ZSTabNavigator.Screen name="a" options={{ title: 'A' }} /></ZSTabNavigator>);
      const tabs = getByHostType('NativeTabs', root);
      expect(tabs.props.preferredPlacement).toBeUndefined();
      expect(tabs.props).not.toHaveProperty('sidebarAdaptable');
    });

    it('지정하면 사이드바가 숨을 때 헤더 제목을 다시 넣는 네이티브 보조 뷰(크기 0, 터치 없음)를 탭 옆에 그린다', async () => {
      const root = await renderTabs(<ZSTabNavigator ios={{ sidebar: 'sidebar' }}><ZSTabNavigator.Screen name="a" options={{ title: 'A' }} /></ZSTabNavigator>);
      const observer = getByHostType('ZSTabSidebarObserverView', root);
      expect(observer.props.pointerEvents).toBe('none');
      expect(observer.props.style).toMatchObject({ position: 'absolute', width: 0, height: 0 });
    });

    it('미지정이면 보조 뷰를 그리지 않는다', async () => {
      const root = await renderTabs(<ZSTabNavigator><ZSTabNavigator.Screen name="a" options={{ title: 'A' }} /></ZSTabNavigator>);
      expect(queryAllByHostType('ZSTabSidebarObserverView', root)).toHaveLength(0);
    });
  });

  describe('ios.prominent (iOS 27 강조 탭)', () => {
    it('이름이 같은 Trigger 하나만 prominent 로 넘기고, 사이드바 배치는 건드리지 않는다', async () => {
      const root = await renderTabs(
        <ZSTabNavigator ios={{ prominent: 'b' }}>
          <ZSTabNavigator.Screen name="a" options={{ title: 'A' }} />
          <ZSTabNavigator.Screen name="b" options={{ title: 'B' }} />
        </ZSTabNavigator>,
      );
      const triggers = queryAllByHostType('NativeTabs.Trigger', root);
      expect(triggers.map((node) => [node.props.name, node.props.prominent])).toEqual([['a', false], ['b', true]]);
      expect(getByHostType('NativeTabs', root).props.preferredPlacement).toBeUndefined();
    });

    it('미지정이면 강조 탭이 없다(시스템 기본)', async () => {
      const root = await renderTabs(<ZSTabNavigator><ZSTabNavigator.Screen name="a" options={{ title: 'A' }} /></ZSTabNavigator>);
      expect(getByHostType('NativeTabs.Trigger', root).props.prominent).toBe(false);
    });
  });
});
