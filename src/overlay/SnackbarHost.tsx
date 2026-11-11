import { memo, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { AccessibilityInfo, Platform, StyleSheet, View, type HostInstance, type KeyboardEvent, type LayoutChangeEvent, type LayoutRectangle, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { FullWindowOverlay } from 'react-native-screens';
import { GestureDetector, GestureHandlerRootView, usePanGesture } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import type { BottomBarEdge, BottomBarStore } from '../context/BottomBarContext';
import { MATERIAL_READABLE_MAX_WIDTH } from '../layout/windowClass';
import type { ShowSnackbarProps } from '../model/types';
import useKeyboard from '../model/useKeyboard';
import { Z_INDEX_VALUE } from '../model/utils';
import { getStatusBarFrameIOS, type StatusBarFrame } from '../native/statusBarAppearance';
import { springConfig } from '../theme/motion';
import { radiusStyle } from '../theme/radius';
import { SPACE } from '../theme/spacing';
import { ICON_VIEW_BOX, iconStrokeWidth } from '../assets/iconStroke';
import ZSPressable from '../ui/ZSPressable';
import ZSText from '../ui/ZSText';
import { layoutTransition } from './transitions';
import { Veil } from './veil';

export interface SnackbarEntry extends ShowSnackbarProps {
  id: number;
}

export const SNACKBAR_DURATION = { short: 4000, long: 10000 } as const;

const EDGE = SPACE.md;
const GAP = SPACE.sm;
export type SnackbarPosition = 'top' | 'bottom';
export const SNACKBAR_ENTER_OFFSET = SPACE.lg;
export const SNACKBAR_TOP_OFFSET = SPACE.sm;
export const SNACKBAR_BOTTOM_GAP = SPACE.sm;
export const SNACKBAR_MIN_HEIGHT = 60;
export const SNACKBAR_ACTION_HEIGHT = 44;
export const SNACKBAR_SWIPE_DISTANCE = 64;
export const SNACKBAR_SWIPE_VELOCITY = 500;
const SWIPE_ACTIVATION = SPACE.sm;
const SWIPE_FAIL_Y = SPACE.lg;
const SWIPE_EXIT = 480;
const STATUS_ICON = 22;

/**
 * 위 자리 — 기기 상태바 바로 아래. Android 는 위 safe area 가 곧 상태바다.
 * iOS 는 Dynamic Island 기기에서 위 safe area(62)가 상태바(54)보다 커서, 상태바가 화면 위를 가로지르는 띠일 때 그 높이를 쓴다.
 * 상태바가 숨었거나(0) iPhone Duo 처럼 옆 레일·헤더 줄에 있으면 safe area 를 쓴다.
 */
export function snackbarTop({ safeTop, statusBar }: { safeTop: number; statusBar: StatusBarFrame | null }): number {
  const strip = statusBar !== null && statusBar.y === 0 && statusBar.height > 0 && statusBar.width > statusBar.height && statusBar.height <= safeTop;
  return (strip ? statusBar.height : safeTop) + SNACKBAR_TOP_OFFSET;
}

export function snackbarBottom({ safeBottom, windowBottom, barTop, keyboardTop }: { safeBottom: number; windowBottom: number | null; barTop: number | null; keyboardTop: number | null }): number {
  const lifted = windowBottom === null ? 0 : Math.max(barTop !== null ? windowBottom - barTop : 0, keyboardTop !== null ? windowBottom - keyboardTop : 0);
  return Math.max(safeBottom, lifted) + SNACKBAR_BOTTOM_GAP;
}

interface SnackbarHostProps {
  items: SnackbarEntry[];
  onHide: (id: number) => void;
  position?: SnackbarPosition;
  bottomBar?: BottomBarStore;
}

const noSubscribe = () => () => undefined;
const noBar = (): BottomBarEdge | null => null;

export default function SnackbarHost({ items, onHide, position = 'top', bottomBar }: SnackbarHostProps) {
  const insets = useSafeAreaInsets();
  const reportedBar = useSyncExternalStore(bottomBar?.subscribe ?? noSubscribe, bottomBar?.get ?? noBar, bottomBar?.get ?? noBar);
  const [statusBar, setStatusBar] = useState<StatusBarFrame | null>(null);
  const showing = items.length > 0;
  useEffect(() => {
    if (Platform.OS !== 'ios' || position !== 'top') return;
    let live = true;
    // 회전·상태바 숨김 뒤에도 맞게 — 창 inset 이 바뀌거나 스낵바가 처음 뜰 때 다시 읽는다
    getStatusBarFrameIOS().then((frame) => {
      if (live) setStatusBar(frame);
    });
    return () => {
      live = false;
    };
  }, [position, insets.top, insets.left, insets.right, showing]);
  const top = snackbarTop({ safeTop: insets.top, statusBar });
  const [windowBottom, setWindowBottom] = useState<number | null>(null);
  const [keyboardTop, setKeyboardTop] = useState<number | null>(null);
  const probeRef = useRef<HostInstance>(null);
  useKeyboard({
    handleKeyboardShow: (event: KeyboardEvent) => setKeyboardTop(event.endCoordinates.screenY),
    handleKeyboardHide: () => setKeyboardTop(null),
  });
  const measureWindow = useCallback(() => probeRef.current?.measureInWindow((_x, y) => setWindowBottom(y)), []);

  const bottom = snackbarBottom({ safeBottom: insets.bottom, windowBottom, barTop: reportedBar?.top ?? null, keyboardTop });
  const [shown, setShown] = useState(items);
  const [leaving, setLeaving] = useState<SnackbarEntry[]>([]);

  if (items !== shown) {
    const ids = new Set(items.map((item) => item.id));
    setLeaving([...leaving, ...shown.filter((item) => !ids.has(item.id))]);
    setShown(items);
  }

  const onExited = useCallback((id: number) => setLeaving((rows) => rows.filter((row) => row.id !== id)), []);

  if (items.length === 0 && leaving.length === 0) return null;

  const leavingIds = new Set(leaving.map((item) => item.id));
  const rows = [...items, ...leaving].sort((a, b) => a.id - b.id);

  const host = (
    <>
      {position === 'bottom' ? (
        <View ref={probeRef} collapsable={false} pointerEvents="none" accessible={false} onLayout={measureWindow} style={styles.probe} testID="zs-snackbar-window-probe" />
      ) : null}
      <GestureHandlerRootView
        pointerEvents="box-none"
        testID="zs-snackbar-host"
        style={[styles.host, position === 'top' ? { top } : { bottom }, { paddingLeft: insets.left + EDGE, paddingRight: insets.right + EDGE }]}
      >
        {rows.map((item) => (
          <SnackbarItem key={item.id} item={item} from={position} leaving={leavingIds.has(item.id)} onHide={onHide} onExited={onExited} />
        ))}
      </GestureHandlerRootView>
    </>
  );

  if (Platform.OS === 'ios') return <FullWindowOverlay unstable_accessibilityContainerViewIsModal={false}>{host}</FullWindowOverlay>;
  return host;
}

function StatusIcon({ type }: { type: NonNullable<ShowSnackbarProps['type']> }) {
  const { colors } = useTheme();
  const fill = type === 'success' ? colors.success : colors.error;
  const ink = type === 'success' ? colors.onSuccess : colors.onError;
  const stroke = iconStrokeWidth(STATUS_ICON);
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" testID={`zs-snackbar-icon-${type}`}>
      <Svg width={STATUS_ICON} height={STATUS_ICON} viewBox={ICON_VIEW_BOX} fill="none">
        <Circle cx="12" cy="12" r="9" fill={fill} />
        {type === 'success' ? (
          <Path d="M8 12.2L10.8 15L16 9.6" stroke={ink} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <>
            <Path d="M12 7.4V13" stroke={ink} strokeWidth={stroke} strokeLinecap="round" />
            <Circle cx="12" cy="16.4" r="1.2" fill={ink} />
          </>
        )}
      </Svg>
    </View>
  );
}

interface SnackbarItemProps {
  item: SnackbarEntry;
  from: SnackbarPosition;
  leaving: boolean;
  onHide: (id: number) => void;
  onExited: (id: number) => void;
}

const SnackbarItem = memo(function SnackbarItem({ item, from, leaving, onHide, onExited }: SnackbarItemProps) {
  const { colors, accessibilityLabels } = useTheme();
  const { id, message, type, action, duration = 'short' } = item;

  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(message);
  }, [message]);

  useEffect(() => {
    if (action || leaving) return;
    const timer = setTimeout(() => onHide(id), SNACKBAR_DURATION[duration]);
    return () => clearTimeout(timer);
  }, [action, duration, id, leaving, onHide]);

  const opacity = useSharedValue(0);
  const offsetY = useSharedValue<number>(from === 'top' ? -SNACKBAR_ENTER_OFFSET : SNACKBAR_ENTER_OFFSET);
  const offsetX = useSharedValue(0);
  const frame = useRef<LayoutRectangle | null>(null);
  const stackLayout = useMemo(() => layoutTransition({ ...springConfig('move'), overshootClamping: true }), []);
  const settle = useMemo(() => springConfig('move'), []);
  const fling = useMemo(() => springConfig('move', 'fast'), []);

  useEffect(() => {
    offsetY.value = withSpring(0, springConfig('move'));
    opacity.value = withSpring(1, springConfig('fade'));
  }, [offsetY, opacity]);

  useEffect(() => {
    if (!leaving) return;
    opacity.value = withSpring(0, springConfig('fade', 'fast'), (finished) => {
      if (finished) scheduleOnRN(onExited, id);
    });
  }, [id, leaving, onExited, opacity]);

  const swipe = usePanGesture({
    enabled: !leaving,
    activeOffsetX: [-SWIPE_ACTIVATION, SWIPE_ACTIVATION],
    failOffsetY: [-SWIPE_FAIL_Y, SWIPE_FAIL_Y],
    onUpdate: (event) => {
      'worklet';
      offsetX.value = event.translationX;
    },
    onDeactivate: (event) => {
      'worklet';
      const direction = Math.sign(event.translationX || event.velocityX) || 1;
      const far = Math.abs(event.translationX) >= SNACKBAR_SWIPE_DISTANCE;
      const fast = Math.abs(event.velocityX) >= SNACKBAR_SWIPE_VELOCITY && Math.sign(event.velocityX) === direction;
      if (far || fast) {
        offsetX.value = withSpring(direction * SWIPE_EXIT, fling);
        scheduleOnRN(onHide, id);
      } else {
        offsetX.value = withSpring(0, settle);
      }
    },
  });

  const handleLayout = (event: LayoutChangeEvent) => {
    frame.current = event.nativeEvent.layout;
  };

  const motionStyle = useAnimatedStyle(() => ({ transform: [{ translateX: offsetX.value }, { translateY: offsetY.value }] }));
  const contentFade = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const last = leaving ? frame.current : null;
  const detached: ViewStyle | null = last ? { position: 'absolute', top: last.y, left: last.x, width: last.width } : null;

  return (
    <Animated.View
      layout={stackLayout}
      onLayout={handleLayout}
      pointerEvents={leaving ? 'none' : 'box-none'}
      accessibilityElementsHidden={leaving}
      importantForAccessibility={leaving ? 'no-hide-descendants' : 'auto'}
      style={[styles.item, detached, motionStyle]}
    >
      <GestureDetector gesture={swipe}>
        <Veil testID={`zs-snackbar-${id}`} kind="veil" radius="full" progress={opacity} style={styles.surface}>
          <Animated.View style={[styles.content, radiusStyle('full'), contentFade]}>
            <ZSPressable
              onPress={() => onHide(id)}
              accessibilityLabel={message}
              accessibilityHint={accessibilityLabels.closeMessage}
              testID={`zs-snackbar-${id}-message`}
              style={[styles.message, action ? null : styles.messageAlone]}
            >
              {type ? <StatusIcon type={type} /> : null}
              <ZSText variant="subtitle2" color={colors.text} style={styles.messageText}>
                {message}
              </ZSText>
            </ZSPressable>
            {action ? (
              <ZSPressable
                onPress={() => {
                  onHide(id);
                  action.onPress();
                }}
                radius="full"
                backgroundColor={colors.primary}
                pressedColor={colors.onPrimary}
                testID={`zs-snackbar-${id}-action`}
                style={styles.action}
              >
                <ZSText variant="subtitle2" emphasized color={colors.onPrimary}>
                  {action.label}
                </ZSText>
              </ZSPressable>
            ) : null}
          </Animated.View>
        </Veil>
      </GestureDetector>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: GAP,
    zIndex: Z_INDEX_VALUE.SNACKBAR,
  },
  probe: { position: 'absolute', bottom: 0, left: 0, width: 0, height: 0 },
  item: { width: '100%', maxWidth: MATERIAL_READABLE_MAX_WIDTH },
  surface: { minHeight: SNACKBAR_MIN_HEIGHT },
  content: { flexGrow: 1, minHeight: SNACKBAR_MIN_HEIGHT, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  message: {
    flex: 1,
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE.sm,
    paddingVertical: SPACE.md,
    paddingStart: SPACE.lg,
    paddingEnd: SPACE.sm,
  },
  messageAlone: { paddingEnd: SPACE.lg },
  messageText: { flexShrink: 1 },
  action: {
    height: SNACKBAR_ACTION_HEIGHT,
    marginEnd: SPACE.sm,
    paddingHorizontal: SPACE.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
