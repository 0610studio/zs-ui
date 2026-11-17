import { useEffect, useRef, useState, type ReactNode } from 'react';
import { I18nManager, StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { GestureDetector, GestureHandlerRootView, usePanGesture } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';
import { springConfig } from '../../theme/motion';

const SWIPE_THRESHOLD = 0.28;
const FLING_VELOCITY = 500;
const EDGE_RESISTANCE = 0.35;
// 워클릿(UI 스레드)에서 쓰므로 JS 에서 미리 만들어 둔다
const PAGE_SPRING = springConfig('move');

export interface ZSSegmentedPagesProps<T extends string | number = string> {
  options: { value: T }[];
  value: T;
  renderPage: (value: T, index: number) => ReactNode;
  onValueChange?: (value: T, index: number) => void;
  swipeEnabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

function ZSSegmentedPages<T extends string | number = string>({
  options,
  value,
  renderPage,
  onValueChange,
  swipeEnabled = false,
  style,
  testID,
}: ZSSegmentedPagesProps<T>) {
  const found = options.findIndex((option) => option.value === value);
  const index = found >= 0 ? found : 0;
  const count = options.length;
  // 오른쪽에서 왼쪽으로 읽는 언어는 행이 뒤집히므로 이동 방향도 반대
  const sign = I18nManager.isRTL ? 1 : -1;

  const [width, setWidth] = useState(0);
  const [visited, setVisited] = useState<ReadonlySet<T>>(() => new Set([value]));
  const offset = useSharedValue(0);
  const start = useSharedValue(0);
  const layoutGeneration = useSharedValue(0);
  const gestureGeneration = useSharedValue(0);
  const placed = useRef(false);
  // 스와이프가 끝날 때마다 올린다 — 부모가 값을 바꾸지 않으면 지금 페이지 자리로 되돌아간다
  const [settled, setSettled] = useState(0);

  // 한 번 연 페이지는 붙여 둔다(스크롤 위치·상태 유지). 지금 페이지는 같은 렌더에서 바로 그린다
  if (!visited.has(value)) setVisited(new Set(visited).add(value));

  useEffect(() => {
    if (width <= 0) return;
    const target = sign * index * width;
    // 처음 자리 잡을 때와 폭이 바뀔 때(회전·접기)는 움직이지 않고 바로 옮긴다
    if (!placed.current) {
      placed.current = true;
      offset.value = target;
      return;
    }
    offset.value = withSpring(target, PAGE_SPRING);
  }, [index, width, sign, offset, settled]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const next = Math.round(event.nativeEvent.layout.width);
    if (next === width) return;
    layoutGeneration.value += 1;
    placed.current = false;
    setWidth(next);
  };

  const finishSwipe = (next: number) => {
    const option = options[next];
    if (next !== index && option) onValueChange?.(option.value, next);
    setSettled((tick) => tick + 1);
  };

  const gesture = usePanGesture({
    enabled: swipeEnabled && width > 0 && count > 1,
    activeOffsetX: [-12, 12],
    failOffsetY: [-16, 16],
    onActivate: () => {
      'worklet';
      start.value = offset.value;
      gestureGeneration.value = layoutGeneration.value;
    },
    onUpdate: (event) => {
      'worklet';
      if (gestureGeneration.value !== layoutGeneration.value) return;
      const raw = start.value + event.translationX;
      const min = sign < 0 ? -(count - 1) * width : 0;
      const max = sign < 0 ? 0 : (count - 1) * width;
      // 첫·끝 페이지 밖으로는 저항을 줘서 조금만 끌린다
      offset.value = raw > max ? max + (raw - max) * EDGE_RESISTANCE : raw < min ? min + (raw - min) * EDGE_RESISTANCE : raw;
    },
    onDeactivate: (event) => {
      'worklet';
      if (gestureGeneration.value !== layoutGeneration.value) return;
      // 마지막 onUpdate 가 손 뗀 위치까지 못 따라온 경우가 있어 끝 이벤트의 이동량으로 판정한다
      const dragged = (start.value + event.translationX - sign * index * width) * sign;
      const flung = Math.abs(event.velocityX) > FLING_VELOCITY;
      const passed = Math.abs(dragged) > width * SWIPE_THRESHOLD;
      const step = flung ? (event.velocityX * sign > 0 ? 1 : -1) : passed ? (dragged > 0 ? 1 : -1) : 0;
      const next = Math.min(count - 1, Math.max(0, index + step));
      offset.value = withSpring(sign * next * width, { ...PAGE_SPRING, velocity: event.velocityX });
      scheduleOnRN(finishSwipe, next);
    },
  });

  const trackStyle = useAnimatedStyle(() => ({ transform: [{ translateX: offset.value }] }));

  const track = (
    <Animated.View style={[styles.track, { width: width * count }, trackStyle]}>
      {options.map((option, pageIndex) => {
        const current = pageIndex === index;
        return (
          <View
            key={String(option.value)}
            style={[styles.page, { width }]}
            pointerEvents={current ? 'auto' : 'none'}
            accessibilityElementsHidden={!current}
            importantForAccessibility={current ? 'auto' : 'no-hide-descendants'}
            testID={testID ? `${testID}-page-${option.value}` : undefined}
          >
            {width > 0 && visited.has(option.value) ? renderPage(option.value, pageIndex) : null}
          </View>
        );
      })}
    </Animated.View>
  );

  return (
    <View style={[styles.root, style]} onLayout={handleLayout} testID={testID}>
      {swipeEnabled ? (
        // 앱 루트에 GestureHandlerRootView 가 없어도 되게 스와이프 영역을 직접 감싼다
        <GestureHandlerRootView style={styles.fill}>
          <GestureDetector gesture={gesture}>{track}</GestureDetector>
        </GestureHandlerRootView>
      ) : (
        track
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },
  track: { flex: 1, flexDirection: 'row' },
  page: { height: '100%' },
  fill: { flex: 1 },
});

export default ZSSegmentedPages;
