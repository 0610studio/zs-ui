import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';

const DEFAULT_MARGIN_X = 20;
const DEFAULT_MARGIN_TOP = 0;
const DEFAULT_MARGIN_BOTTOM = 20;
const DEFAULT_BORDER_RADIUS = 8;

const TIME_CONSTANTS = {
    debounce: 300,
    throttle: 2000,
} as const;

interface ThrottleButtonProps extends TouchableOpacityProps {
    loadingComponent?: React.ReactNode;
    disabled?: boolean;
    primaryOnPress: () => Promise<void>;
    primaryLabelComponent: React.ReactNode;
    primaryButtonStyle?: TouchableOpacityProps['style'];
    marginHorizontal?: number;
    marginBottom?: number;
    onError?: (error: Error) => void;
}

const useAsyncButton = (
    onPress: () => Promise<void>,
    onError?: (error: Error) => void
) => {
    const [isLoading, setIsLoading] = useState(false);
    const lastClickTime = useRef<number>(0);
    const isMounted = useRef<boolean>(true);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    const handlePress = useCallback(async () => {
        const now = Date.now();

        if (now - lastClickTime.current < TIME_CONSTANTS.debounce) {
            return;
        }

        if (isLoading) {
            return;
        }

        lastClickTime.current = now;

        try {
            setIsLoading(true);
            await onPress();
            await new Promise(resolve =>
                setTimeout(resolve, TIME_CONSTANTS.throttle)
            );
        } catch (error: unknown) {
            if (error instanceof Error && onError) {
                onError(error);
            }
            console.error('ThrottleButton error:', error);
        } finally {
            if (isMounted.current) {
                setIsLoading(false);
            }
        }
    }, [onPress, onError, isLoading]);

    return { isLoading, handlePress };
};

function ThrottleButton({
    loadingComponent = <ActivityIndicator />,
    disabled = false,
    primaryOnPress,
    primaryLabelComponent,
    primaryButtonStyle = {},
    marginHorizontal,
    marginBottom = DEFAULT_MARGIN_BOTTOM,
    onError,
    ...touchableProps
}: ThrottleButtonProps) {
    const { isLoading, handlePress } = useAsyncButton(primaryOnPress, onError);

    return (
        <View style={[styles.container, { marginHorizontal: marginHorizontal ?? DEFAULT_MARGIN_X, marginBottom }]}>
            <TouchableOpacity
                activeOpacity={0.7}
                style={[primaryButtonStyle, styles.touchContainer, { opacity: isLoading ? 0.4 : 1 }]}
                onPress={handlePress}
                disabled={disabled || isLoading}
                {...touchableProps}
            >
                {isLoading ? loadingComponent : primaryLabelComponent}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    touchContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1
    },
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: DEFAULT_BORDER_RADIUS,
        marginTop: DEFAULT_MARGIN_TOP,
        marginBottom: DEFAULT_MARGIN_BOTTOM,
        overflow: 'hidden',
        flexDirection: 'row',
        flex: 1
    },
});

export default ThrottleButton;
