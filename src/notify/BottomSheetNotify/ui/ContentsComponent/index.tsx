import React, { useCallback } from 'react';
import { Dimensions, LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, Text, View } from 'react-native';
import { GestureType, ScrollView } from 'react-native-gesture-handler';
import { SharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ZSView } from '../../../../ui';

// const ANDROID_STATUS_BAR_HEIGHT = Platform.OS === 'android' ? 25 : 0;
const ANDROID_STATUS_BAR_HEIGHT = 0;

interface Props {
    HANDLE_HEIGHT: number;
    panGestureRef: React.MutableRefObject<GestureType>;
    listScrollPosition: SharedValue<number>;
    openPosition: SharedValue<number>;
    marginBottomBS: number;
    screenHeight: SharedValue<number>;
    bottomSheetComponent: React.ReactNode;
    bottomSheetPadding: number;
    maxHeight: number;
    isScrollView: boolean;
    showsVerticalScrollIndicator: boolean;
    headerComponent?: React.ReactNode;
}

// 화살표 함수 대신 일반 함수 사용
function ContentsComponent({
    HANDLE_HEIGHT,
    panGestureRef,
    listScrollPosition,
    openPosition,
    marginBottomBS,
    screenHeight,
    bottomSheetComponent,
    bottomSheetPadding,
    maxHeight,
    isScrollView,
    showsVerticalScrollIndicator,
    headerComponent
}: Props) {
    const { bottom } = useSafeAreaInsets();

    // onLayout 함수를 useCallback으로 최적화
    const onLayout = useCallback((event: LayoutChangeEvent) => {
        const { height } = event.nativeEvent.layout;
        const contentMaxHeight = maxHeight + HANDLE_HEIGHT;
        const resultHeight = Math.min(height, contentMaxHeight); // 더 간결하게 변경
        // 성능 문제 방지를 위해 runOnUI 사용
        screenHeight.value = resultHeight + HANDLE_HEIGHT;
        openPosition.value = Dimensions.get('window').height - resultHeight - marginBottomBS - bottom - ANDROID_STATUS_BAR_HEIGHT - HANDLE_HEIGHT;
    }, [maxHeight, HANDLE_HEIGHT, screenHeight, openPosition, marginBottomBS, bottom]);

    // 현재 스크롤 위치를 관리하는 함수
    const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        listScrollPosition.value = event.nativeEvent.contentOffset.y;
    }, [listScrollPosition]);

    return isScrollView ? (
        <ScrollView
            simultaneousHandlers={[panGestureRef]}
            onScroll={handleScroll}
            style={{ maxHeight }}
            keyboardShouldPersistTaps="handled"
            bounces={false}
            bouncesZoom={false}
            overScrollMode="never" 
            showsVerticalScrollIndicator={showsVerticalScrollIndicator}
            scrollEventThrottle={16}
            stickyHeaderIndices={headerComponent ? [0] : undefined}
        >
            {headerComponent && headerComponent}

            <ZSView style={{ width: '100%', minHeight: 1, paddingBottom: bottomSheetPadding }} onLayout={onLayout}>
                {bottomSheetComponent}
            </ZSView>
        </ScrollView>
    ) : (
        <ZSView style={{ width: '100%', minHeight: 1, paddingBottom: bottomSheetPadding, maxHeight }} onLayout={onLayout}>
            {headerComponent && headerComponent}

            {bottomSheetComponent}
        </ZSView>
    );
}

export default React.memo(ContentsComponent); // React.memo로 성능 최적화
