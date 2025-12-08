import React, { useEffect } from "react";
import { Dimensions, type StyleProp, StyleSheet, View, type ViewStyle } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, cancelAnimation } from "react-native-reanimated";
import { useTheme } from "../../context/ThemeContext";
import ZSView from "../ZSView";
import { ViewColorOptions } from "../../theme/types";

const DEVICE_WIDTH = Dimensions.get("window").width;

interface ZSSkeletonBoxProps {
    height: number;
    style?: StyleProp<ViewStyle>;
    overlayColor?: string;
    color?: ViewColorOptions;
}

function ZSSkeletonBox({ height, style, overlayColor, color = 'neutral' }: ZSSkeletonBoxProps) {
    const translateX = useSharedValue(-DEVICE_WIDTH * 1.2);
    const { palette } = useTheme();
    const effectColor = overlayColor || palette.background.layer1;

    useEffect(() => {
        translateX.value = withRepeat(withTiming(DEVICE_WIDTH * 1.2, { duration: 800 }), -1, false);

        return () => {
            cancelAnimation(translateX);
        };
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        "worklet";
        return {
            transform: [{ translateX: translateX.value }],
        };
    });

    return (
        <View style={[{ width: '100%' }, style, { height, overflow: "hidden" }]}>
            <ZSView
                style={[
                    styles.container,
                    {
                        width: DEVICE_WIDTH,
                        height,
                    },
                ]}
                color={color}
            >
                <Animated.View style={[styles.shimmer, animatedStyle]}>
                    <View style={[styles.shimmerSub, { backgroundColor: effectColor }]} />
                    <View style={[styles.shimmerCenter, { backgroundColor: effectColor }]} />
                    <View style={[styles.shimmerSub, { backgroundColor: effectColor }]} />
                </Animated.View>
            </ZSView>
        </View>
    );
}

export default ZSSkeletonBox;

const styles = StyleSheet.create({
    container: {
        overflow: "hidden",
        opacity: 0.4,
    },
    shimmer: {
        width: "100%",
        height: "100%",
        position: "absolute",
        flexDirection: "row",
    },
    shimmerSub: {
        height: "100%",
        backgroundColor: "#ebebeb",
        opacity: 0.3,
        width: DEVICE_WIDTH * 0.3,
    },
    shimmerCenter: {
        height: "100%",
        backgroundColor: "#f5f5f5",
        opacity: 0.7,
        width: DEVICE_WIDTH * 0.4,
    },
});
