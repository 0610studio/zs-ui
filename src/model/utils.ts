import { StyleProp, TextStyle } from "react-native";

export const extractStyle = (
    style: StyleProp<TextStyle>,
    attribute: keyof TextStyle
): TextStyle[keyof TextStyle] | undefined => {
    if (Array.isArray(style)) {
        const foundStyle = style.find(item => typeof item === 'object' && item !== null && attribute in item);
        return foundStyle?.[attribute as keyof typeof foundStyle];
    } else if (typeof style === 'object' && style !== null && attribute in style) {
        return style[attribute];
    }
    return undefined;
};

export const Z_INDEX_VALUE = {
    DEFAULT: 8000,
    MODAL1: 8001,
    MODAL2: 8002,
    MODAL3: 8003,
    MODAL4: 8004,
    BOTTOM_SHEET1: 8101,
    BOTTOM_SHEET2: 8102,
    POPOVER: 8200,
    ALERT: 8300,
    BOTTOM_CTA: 8400,
    ABOVE_KEYBOARD: 8500,
    SNACKBAR: 8600,
    LOADING: 8999,
};

export const MAX_OVERLAY_WIDTH = 500;