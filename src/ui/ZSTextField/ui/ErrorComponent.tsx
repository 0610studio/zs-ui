import { Text, View } from "react-native";

const ErrorComponent = ({
    errorMessage, errorColor, fontFamily
}:{
    errorMessage: string;
    errorColor: string;
    fontFamily: string;
}) => {
    return (
        <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', paddingLeft: 3, marginTop: 5 }}>
            <View style={{ width: 18, height: 18, justifyContent: 'center', alignItems: 'center', borderRadius: 30, backgroundColor: errorColor }}>
                <Text allowFontScaling={false} style={{ fontWeight: 'bold', color: 'white', textAlign: 'center', textAlignVertical: 'center', fontSize: 11, fontFamily: fontFamily }}>
                    {`!`}
                </Text>
            </View>

            <Text allowFontScaling={false} style={{ marginLeft: 5, fontSize: 14, color: errorColor, fontFamily: fontFamily }}>
                {errorMessage}
            </Text>
        </View>
    )
}

export default ErrorComponent;