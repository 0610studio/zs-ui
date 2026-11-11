import { useCallback, useEffect, useMemo, useRef, useState, type ComponentType, type ReactNode } from 'react';
import { Platform, StyleSheet, View, type NativeSyntheticEvent, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { requireNativeView } from 'expo';
import { isSameTopBarRegion, resolveTopBarRegion, type TopBarMeasurement, type ZSTopBarRegion } from './topBarRegion';

export type { ZSTopBarInsets, ZSTopBarPlacement, ZSTopBarRect, ZSTopBarRegion } from './topBarRegion';

export interface ZSTopBarProps {
  children?: ReactNode;
  safeArea?: boolean;
  height?: number;
  onRegionChange?: (region: ZSTopBarRegion) => void;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

type NativeProps = {
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  testID?: string;
  extent: number;
  onBarLayoutChange: (event: NativeSyntheticEvent<TopBarMeasurement>) => void;
};

let NativeTopBar: ComponentType<NativeProps> | undefined;

function ZSTopBar({ children, safeArea = true, height = 48, onRegionChange, style, contentStyle, testID }: ZSTopBarProps) {
  const isIOS = Platform.OS === 'ios';
  const { top, left, right } = useSafeAreaInsets();
  const [measurement, setMeasurement] = useState<TopBarMeasurement | null>(null);

  const region = useMemo(
    () =>
      resolveTopBarRegion(measurement, {
        safeArea,
        height,
        insets: { top, left, right },
        measured: !isIOS || measurement != null,
      }),
    [measurement, safeArea, height, top, left, right, isIOS],
  );

  const reportedRef = useRef<ZSTopBarRegion | null>(null);
  useEffect(() => {
    if (reportedRef.current && isSameTopBarRegion(reportedRef.current, region)) return;
    reportedRef.current = region;
    onRegionChange?.(region);
  });

  const handleLayout = useCallback((event: NativeSyntheticEvent<TopBarMeasurement>) => {
    const { width, height: measuredHeight, safeAreaTop, bar, margins } = event.nativeEvent;
    setMeasurement({ width, height: measuredHeight, safeAreaTop, bar, margins });
  }, []);

  const frameStyle = [style, { height: region.height }];
  const content = (
    <View style={[styles.content, region.contentInsets, contentStyle]} testID={testID ? `${testID}-content` : undefined}>
      {children}
    </View>
  );

  if (isIOS) {
    NativeTopBar ??= requireNativeView<NativeProps>('ZsUi', 'ZSTopBarView');
    return (
      <NativeTopBar style={frameStyle} extent={height} onBarLayoutChange={handleLayout} testID={testID}>
        {content}
      </NativeTopBar>
    );
  }
  return (
    <View style={frameStyle} testID={testID}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default ZSTopBar;
