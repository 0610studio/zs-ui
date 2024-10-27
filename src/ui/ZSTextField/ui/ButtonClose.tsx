import { TouchableOpacity } from "react-native";
import { SvgX } from "../../../assets/SvgX";

const ButtonClose = ({
    onChangeText,
    marginTop
}: {
    onChangeText?: (text: string) => void;
    marginTop?: number
}) => {
    return (
        <TouchableOpacity style={{ position: 'absolute', padding: 3, right: 15, borderRadius: 30, backgroundColor: '#e6e6e6', justifyContent: 'center', alignItems: 'center', ...marginTop && { top: marginTop } }}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            onPress={() => { onChangeText?.(''); }}>
            <SvgX color="#5E696E" />
        </TouchableOpacity>
    )
}

export default ButtonClose;