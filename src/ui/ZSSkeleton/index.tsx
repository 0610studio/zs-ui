import React, { useEffect } from "react";
import { Dimensions, type StyleProp, StyleSheet, View, type ViewStyle } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, cancelAnimation } from "react-native-reanimated";
import { useTheme } from "../../context/ThemeContext";

const DEVICE_WIDTH = Dimensions.get("window").width;

interface ZSSkeletonProps {
    isFetching?: boolean;
    style?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
    overlayColor?: string;
}

function ZSSkeleton({ isFetching, style, children, overlayColor }: ZSSkeletonProps) {
    const translateX = useSharedValue(-DEVICE_WIDTH * 1.2);
    const { palette } = useTheme();
    const effectColor = overlayColor || palette.background.base;

    useEffect(() => {
        if (isFetching) {
            translateX.value = withRepeat(withTiming(DEVICE_WIDTH * 1.2, { duration: 800 }), -1, false);
        } else {
            cancelAnimation(translateX);
            translateX.value = -DEVICE_WIDTH * 1.2;
        }

        return () => {
            cancelAnimation(translateX);
        };
    }, [isFetching]);

    const animatedStyle = useAnimatedStyle(() => {
        "worklet";
        return {
            transform: [{ translateX: translateX.value }],
        };
    });

    return isFetching ? (
        <View style={[style, { overflow: "hidden" }]}>
            <View style={styles.container}>
                {children}

                <Animated.View style={[styles.shimmer, animatedStyle]}>
                    <View style={[styles.shimmerSub, { backgroundColor: effectColor }]} />
                    <View style={[styles.shimmerCenter, { backgroundColor: effectColor }]} />
                    <View style={[styles.shimmerSub, { backgroundColor: effectColor }]} />
                </Animated.View>
            </View>
        </View>
    ) : (
        children
    );
}

export default ZSSkeleton;

const styles = StyleSheet.create({
    container: {
        overflow: "hidden",
        opacity: 0.6,
        width: "100%",
    },
    shimmer: {
        width: "100%",
        height: "100%",
        position: "absolute",
        flexDirection: "row",
    },
    shimmerSub: {
        height: "100%",
        opacity: 0.3,
        width: DEVICE_WIDTH * 0.3,
    },
    shimmerCenter: {
        height: "100%",
        opacity: 0.6,
        width: DEVICE_WIDTH * 0.4,
    },
});
