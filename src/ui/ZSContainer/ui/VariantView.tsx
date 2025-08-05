import { styles } from '..';
import { ScrollView, NativeSyntheticEvent, NativeScrollEvent, View, DimensionValue, StyleProp, ViewStyle } from 'react-native';

interface VariantViewProps {
  children: React.ReactNode;
  scrollViewDisabled?: boolean;
  style: StyleProp<ViewStyle>;
  scrollViewRef?: React.RefObject<ScrollView>;
  variantWidth?: DimensionValue;
  showsVerticalScrollIndicator?: boolean;
  automaticallyAdjustKeyboardInsets?: boolean;
  handleScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  handleTouch?: (event: any) => void;
  scrollEventThrottle?: number;
  keyboardHeight?: number;
}

export default function VariantView({ children, scrollViewDisabled, style, scrollViewRef, variantWidth, showsVerticalScrollIndicator, automaticallyAdjustKeyboardInsets, handleScroll, handleTouch, scrollEventThrottle, keyboardHeight }: VariantViewProps) {
  return (
    scrollViewDisabled ? (
      <View style={[style, { width: variantWidth }]}>
        {children}
      </View>
    ) : (
      <ScrollView
        ref={scrollViewRef}
        style={{ width: variantWidth }}
        contentContainerStyle={[styles.scrollContainerStyle, { paddingBottom: keyboardHeight || 0 }]}
        bounces={false}
        overScrollMode="never"
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets={automaticallyAdjustKeyboardInsets}
        onScroll={handleScroll}
        onTouchStart={handleTouch}
        scrollEventThrottle={scrollEventThrottle}
      >
        <View style={[styles.splitView, style, { width: '100%' }]}>
          {children}
        </View>
      </ScrollView>
    )
  )
}