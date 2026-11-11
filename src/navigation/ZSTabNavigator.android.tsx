import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  PixelRatio,
  Platform,
  processColor,
  StyleSheet,
  View,
  type HostInstance,
  type ImageSourcePropType,
  type NativeSyntheticEvent,
  type ViewProps,
} from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle } from 'react-native-reanimated';
import { requireNativeView } from 'expo';
import { BlurTargetView, BlurView } from 'expo-blur';
import { createStandardRouterNavigator, TabRouter, unstable_useReconcileTabHistory, type NavigatorContentProps } from 'expo-router';
import { Screen, ScreenContainer } from 'react-native-screens';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { resolveColor, withOpacity } from '../theme/color';
import { useBarAxis, useDevicePosture, useWindowLayout } from '../layout/LayoutContext';
import type {
  ZSTabIcon,
  ZSTabNavigationMode,
  ZSTabNavigatorProps,
  ZSTabScreenOptions,
} from './ZSTabNavigator.types';
import { badgeText, collectScreens, resolveNavigationMode, ZSTabNavigatorScreen } from './ZSTabNavigatorScreen';
import { appendPlaceholderDescriptors, appendPlaceholderRoutes } from './tabPlaceholders';
import { resolveTabTheme } from './tabTheme';
import { useHeaderInset } from './useHeaderInset';
import { HeaderFillContext, type HeaderFill } from './headerFill';
import { TabBarInsetContext } from './useTabBarInset';

interface NativeTabBarItem {
  key: string;
  name: string;
  title: string;
  icon?: string;
  badge?: string;
  accessibilityLabel?: string;
}

interface NativeTabBarProps extends ViewProps {
  mode: ZSTabNavigationMode;
  items: NativeTabBarItem[];
  selectedKey?: string;
  colors: Record<string, number | undefined>;
  fontFamily?: string;
  hideOnKeyboard?: boolean;
  iconPosition?: 'top' | 'start';
  dark?: boolean;
  maxFontScale?: number;
  floating?: boolean;
  onTabPress: (event: NativeSyntheticEvent<{ key: string }>) => void;
}

const NativeTabBar = requireNativeView<NativeTabBarProps>('ZsUi', 'ZSTabBarView');
const NativeTabsContent = requireNativeView<ViewProps>('ZsUi', 'ZSTabsContentView');

type TabsEventMap = { tabPress: { data: undefined; canPreventDefault: true } };
type TabsContentProps = NavigatorContentProps<
  ZSTabScreenOptions,
  TabsEventMap,
  Pick<ZSTabNavigatorProps, 'android' | 'unselectedIconColor' | 'unselectedLabelColor'>
>;

const SCREEN_INACTIVE = 0;
const SCREEN_ON_TOP = 2;

const FLOATING_OFFSET = 12;
const FLOATING_CONTENT_GAP = 10;
// Android ZSTabBarView의 FLOATING_SHADOW_SPACE와 맞춥니다.
const FLOATING_SHADOW_SPACE = 4;

const VEIL_OPACITY = 0.8;
const VEIL_DARK = '#2A2A2A';
const VEIL_FALLBACK_OPACITY = 0.96;
const VEIL_MIN_BLUR_SDK = 31;
const VEIL_OUTLINE_OPACITY = { light: 0.08, dark: 0.1 } as const;
const VEIL_BLUR_SIGMA = 22;
const VEIL_BLUR_INTENSITY = 12;
const DIMEZIS_RADIUS_SCALE = 4;
const SKIA_SIGMA_PER_RADIUS = 0.57735;
const SKIA_SIGMA_BIAS = 0.5;

type MaterialSymbolRenderer = {
  unstable_getMaterialSymbolSourceAsync(name: string, size: number, color: string): Promise<ImageSourcePropType | null>;
};
let expoSymbols: MaterialSymbolRenderer | undefined;
try {
  expoSymbols = require('expo-symbols');
} catch {}

const symbolCache = new Map<string, Promise<string | undefined>>();

function sourceUri(source: ImageSourcePropType | null | undefined): string | undefined {
  if (source == null) return undefined;
  const first = Array.isArray(source) ? source[0] : source;
  if (first == null) return undefined;
  return typeof first === 'number' ? Image.resolveAssetSource(first)?.uri : first.uri;
}

function loadMaterialSymbol(name: string): Promise<string | undefined> {
  let pending = symbolCache.get(name);
  if (!pending) {
    pending = Promise.resolve()
      .then(() => expoSymbols?.unstable_getMaterialSymbolSourceAsync(name, 24, 'white'))
      .then(sourceUri)
      .catch(() => undefined)
      .then((uri) => {
        if (!uri) {
          symbolCache.delete(name);
          if (expoSymbols && __DEV__) {
            console.warn(`ZSTabNavigator: Could not render Material Symbol '${name}'. Check the name or provide a 'src' fallback.`);
          }
        }
        return uri;
      });
    symbolCache.set(name, pending);
  }
  return pending;
}

function useIconSources(icons: (ZSTabIcon | undefined)[]) {
  const [symbols, setSymbols] = useState<Record<string, string>>({});
  const names = icons.flatMap((icon) => (icon && !icon.drawable && icon.md ? [icon.md] : []));
  const namesKey = names.join('\n');

  useEffect(() => {
    if (!names.length) return;
    if (!expoSymbols && __DEV__) {
      console.warn("ZSTabNavigator: `md` icons on Android require 'expo-symbols'. Install it or use `drawable` / `src`.");
    }
    let active = true;
    names.forEach((name) => {
      loadMaterialSymbol(name).then((uri) => {
        if (active && uri) setSymbols((prev) => (prev[name] === uri ? prev : { ...prev, [name]: uri }));
      });
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [namesKey]);

  return useCallback(
    (icon: ZSTabIcon | undefined): string | undefined => {
      if (!icon) return undefined;
      if (icon.drawable) return icon.drawable;
      if (icon.md) return symbols[icon.md] ?? (icon.src ? sourceUri(icon.src) : undefined);
      return sourceUri(icon.src);
    },
    [symbols],
  );
}

function ZSTabsContent({ state, descriptors, actions, emitter, android, unselectedIconColor, unselectedLabelColor }: TabsContentProps) {
  unstable_useReconcileTabHistory();
  const { colors: roles, fonts, mode: colorMode, maxFontSizeMultiplier } = useTheme();
  const { widthClass, heightClass } = useWindowLayout();
  const { posture } = useDevicePosture();
  const [barAxis] = useBarAxis();
  const mode = resolveNavigationMode(android?.navigationMode, widthClass, heightClass, posture, barAxis);
  const floating = mode === 'bar' && (android?.barStyle ?? 'floating') === 'floating';
  const { bottom: windowBottom } = useSafeAreaInsets();
  const [floatingHeight, setFloatingHeight] = useState(0);
  const tabBarInset = floating && floatingHeight > 0 ? floatingHeight + FLOATING_OFFSET + FLOATING_CONTENT_GAP : 0;
  const blurTarget = useRef<HostInstance>(null);
  const focusedKey = state.routes[state.index]?.key;

  const headerHeight = useHeaderInset();
  const rootRef = useRef<HostInstance>(null);
  const [rootTop, setRootTop] = useState<number | null>(null);
  const handleRootLayout = useCallback(() => {
    rootRef.current?.measureInWindow?.((_x: number, y: number) => setRootTop((prev) => (prev === y ? prev : y)));
  }, []);
  const railOffset = mode === 'rail' && headerHeight > 0 && (rootTop === null || rootTop < 1) ? headerHeight : 0;

  const [railWidth, setRailWidth] = useState(0);
  const [headerFills, setHeaderFills] = useState<Record<string, HeaderFill>>({});
  const fillReporters = useRef(new Map<string, (fill: HeaderFill | null) => void>()).current;
  const reporterFor = (key: string) => {
    let reporter = fillReporters.get(key);
    if (!reporter) {
      reporter = (fill) =>
        setHeaderFills((prev) => {
          if (fill === null) {
            if (!(key in prev)) return prev;
            const { [key]: _removed, ...rest } = prev;
            return rest;
          }
          const current = prev[key];
          return current && current.progress === fill.progress && current.from === fill.from && current.to === fill.to ? prev : { ...prev, [key]: fill };
        });
      fillReporters.set(key, reporter);
    }
    return reporter;
  };
  const railFill = railOffset > 0 && railWidth > 0 && focusedKey ? headerFills[focusedKey] : undefined;

  const [mountedKeys, setMountedKeys] = useState<string[]>(() => (focusedKey ? [focusedKey] : []));
  if (focusedKey && !mountedKeys.includes(focusedKey)) {
    setMountedKeys([...mountedKeys, focusedKey]);
  }

  const visibleRoutes = state.routes.filter((route) => !descriptors[route.key]?.options.hidden);
  const iconSource = useIconSources(visibleRoutes.map((route) => descriptors[route.key]?.options.icon));
  const items = visibleRoutes.map((route): NativeTabBarItem => {
    const options = descriptors[route.key]?.options;
    return {
      key: route.key,
      name: route.name,
      title: options?.title ?? route.name,
      icon: iconSource(options?.icon),
      badge: badgeText(options?.badge),
      accessibilityLabel: options?.accessibilityLabel,
    };
  });

  const { colors, fontFamily } = useMemo(() => {
    const tab = resolveTabTheme(roles, fonts, {
      icon: resolveColor(roles, unselectedIconColor),
      label: resolveColor(roles, unselectedLabelColor),
    });
    const native: Record<string, number | undefined> = {};
    (Object.keys(tab.colors) as (keyof typeof tab.colors)[]).forEach((key) => {
      native[key] = processColor(tab.colors[key]) as number | undefined;
    });
    if (mode === 'rail' || floating) native.background = processColor('transparent') as number;
    return { colors: native, fontFamily: tab.fontFamily };
  }, [roles, fonts, mode, floating, unselectedIconColor, unselectedLabelColor]);

  const handleTabPress = useCallback(
    (event: NativeSyntheticEvent<{ key: string }>) => {
      const route = state.routes.find((item) => item.key === event.nativeEvent.key);
      if (!route) return;
      const tabPress = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
      if (tabPress.defaultPrevented || route.key === focusedKey || descriptors[route.key]?.options.disabled) return;
      actions.navigate(route.name, route.params);
    },
    [state.routes, descriptors, emitter, actions, focusedKey],
  );

  const tabBar = (
    <NativeTabBar
      key={floating ? 'floating' : mode}
      mode={mode}
      style={railOffset > 0 ? { marginTop: railOffset } : undefined}
      items={items}
      selectedKey={focusedKey}
      colors={colors}
      fontFamily={fontFamily}
      hideOnKeyboard={android?.hideOnKeyboard ?? false}
      iconPosition={widthClass === 'compact' ? 'top' : 'start'}
      dark={colorMode === 'dark'}
      maxFontScale={maxFontSizeMultiplier}
      floating={floating}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setRailWidth(mode === 'rail' ? width : 0);
        setFloatingHeight(floating ? height : 0);
      }}
      onTabPress={handleTabPress}
      testID={`zs-tab-navigator-${mode}`}
    />
  );

  return (
    <View ref={rootRef} onLayout={handleRootLayout} style={[styles.root, mode === 'rail' ? styles.rail : styles.bar]}>
      <NativeTabsContent style={styles.scenes}>
        <BlurTargetView ref={blurTarget} style={StyleSheet.absoluteFill}>
          <ScreenContainer style={StyleSheet.absoluteFill} hasTwoStates>
            {state.routes.map((route, index) =>
              mountedKeys.includes(route.key) ? (
                <Screen
                  key={route.key}
                  style={[StyleSheet.absoluteFill, { zIndex: index === state.index ? 0 : -1 }]}
                  activityState={index === state.index ? SCREEN_ON_TOP : SCREEN_INACTIVE}
                  enabled
                  freezeOnBlur={false}
                >
                  <SafeAreaProvider>
                    <HeaderFillContext.Provider value={reporterFor(route.key)}>
                      <TabBarInsetContext.Provider value={tabBarInset}>{descriptors[route.key]?.render()}</TabBarInsetContext.Provider>
                    </HeaderFillContext.Provider>
                  </SafeAreaProvider>
                </Screen>
              ) : null,
            )}
          </ScreenContainer>
        </BlurTargetView>
      </NativeTabsContent>
      {floating ? (
        <View pointerEvents="box-none" style={[styles.floatingHost, { bottom: windowBottom + FLOATING_OFFSET }]}>
          <View pointerEvents="box-none">
            {floatingHeight > 0 ? <FloatingBackdrop blurTarget={blurTarget} /> : null}
            {tabBar}
          </View>
        </View>
      ) : (
        tabBar
      )}
      {railFill ? <RailHeaderFill fill={railFill} width={railWidth} height={railOffset} /> : null}
    </View>
  );
}

function veilBlurReductionFactor(pixelRatio: number): number {
  const radiusPx = (VEIL_BLUR_SIGMA * pixelRatio - SKIA_SIGMA_BIAS) / SKIA_SIGMA_PER_RADIUS;
  return (VEIL_BLUR_INTENSITY * DIMEZIS_RADIUS_SCALE) / radiusPx;
}

function FloatingBackdrop({ blurTarget }: { blurTarget: React.RefObject<HostInstance | null> }) {
  const { colors, mode, shadows } = useTheme();
  const dark = mode === 'dark';
  const blurs = typeof Platform.Version !== 'number' || Platform.Version >= VEIL_MIN_BLUR_SDK;
  return (
    <>
      <View pointerEvents="none" style={[styles.floatingSurface, shadows.md]} />
      <View pointerEvents="none" style={[styles.floatingSurface, styles.floatingClip]}>
        <BlurView
          blurTarget={blurTarget}
          blurMethod="dimezisBlurViewSdk31Plus"
          intensity={VEIL_BLUR_INTENSITY}
          blurReductionFactor={veilBlurReductionFactor(PixelRatio.get())}
          tint={dark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: dark ? VEIL_DARK : colors.surface1, opacity: blurs ? VEIL_OPACITY : VEIL_FALLBACK_OPACITY },
          ]}
        />
      </View>
      <View
        pointerEvents="none"
        style={[styles.floatingSurface, styles.floatingOutline, { borderColor: withOpacity(colors.text, VEIL_OUTLINE_OPACITY[dark ? 'dark' : 'light']) }]}
      />
    </>
  );
}

function RailHeaderFill({ fill, width, height }: { fill: HeaderFill; width: number; height: number }) {
  const { progress, from, to } = fill;
  const animatedStyle = useAnimatedStyle(() => ({ backgroundColor: interpolateColor(progress.value, [0, 1], [from, to]) }));
  return <Animated.View pointerEvents="none" style={[styles.railFill, { width, height }, animatedStyle]} testID="zs-tab-navigator-rail-header-fill" />;
}

const ZSTabsNavigator = createStandardRouterNavigator(ZSTabsContent, TabRouter, {
  processDescriptors: appendPlaceholderDescriptors as never,
  processState: appendPlaceholderRoutes as never,
});

function ZSTabNavigator({ children, android, unselectedIconColor, unselectedLabelColor }: ZSTabNavigatorProps) {
  const screens = collectScreens(children);
  return (
    <ZSTabsNavigator android={android} unselectedIconColor={unselectedIconColor} unselectedLabelColor={unselectedLabelColor}>
      {screens.map(({ name, options, listeners }) => (
        <ZSTabsNavigator.Screen key={name} name={name} options={options} listeners={listeners} />
      ))}
    </ZSTabsNavigator>
  );
}

ZSTabNavigator.Screen = ZSTabNavigatorScreen;

export default ZSTabNavigator;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  bar: {
    flexDirection: 'column',
  },
  rail: {
    flexDirection: 'row-reverse',
  },
  scenes: {
    flex: 1,
    overflow: 'hidden',
  },
  floatingHost: {
    position: 'absolute',
    start: 0,
    end: 0,
    alignItems: 'center',
  },
  floatingSurface: {
    position: 'absolute',
    top: FLOATING_SHADOW_SPACE,
    bottom: FLOATING_SHADOW_SPACE,
    start: FLOATING_SHADOW_SPACE,
    end: FLOATING_SHADOW_SPACE,
    borderRadius: 999,
  },
  floatingClip: {
    overflow: 'hidden',
  },
  floatingOutline: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  railFill: {
    position: 'absolute',
    top: 0,
    start: 0,
  },
});
