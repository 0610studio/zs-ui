import { TouchableOpacity, type TouchableOpacityProps } from "react-native";
import { SvgX } from "../../../assets/SvgX";
import { useTheme } from "../../../context/ThemeContext";
import { RADIUS } from "../../../theme/tokens";

const ButtonClose = ({
    onChangeText,
    marginTop,
    ...props
}: {
    onChangeText?: (text: string) => void;
    marginTop?: number;
} & TouchableOpacityProps) => {
    const { palette } = useTheme();

    return (
        <TouchableOpacity
            style={{ position: 'absolute', padding: 3, right: 15, borderRadius: RADIUS.pill, backgroundColor: palette.grey[30], justifyContent: 'center', alignItems: 'center', ...marginTop && { top: marginTop } }}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            onPress={() => { onChangeText?.(''); }}
            {...props}>
            <SvgX color={palette.grey[60]} />
        </TouchableOpacity>
    )
}

export default ButtonClose;
