import { useRef } from "react";
import { Platform, Pressable } from "react-native";
import { TextInput } from "react-native-gesture-handler";

type Props = {
};

const BSTextInput = ({ ...props }: Props) => {
    const textInputRef = useRef<TextInput>(null);

    return (
        Platform.OS === 'ios' ?
            <Pressable onPress={() => { textInputRef?.current?.focus(); }}>
                <TextInput
                    ref={textInputRef}
                    pointerEvents='none'
                    {...props}
                />
            </Pressable>
            :
            <TextInput
                ref={textInputRef}
                {...props}
            />
    );
};

export default BSTextInput;
