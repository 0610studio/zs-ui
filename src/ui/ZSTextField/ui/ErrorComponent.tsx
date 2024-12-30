import { Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

const ErrorComponent = ({
  errorMessage, errorColor, fontFamily
}: {
  errorMessage: string;
  errorColor: string;
  fontFamily: string;
}) => {
  return (
    <Animated.View entering={FadeInDown} style={{ width: '100%', flexDirection: 'row', alignItems: 'center', paddingLeft: 5, marginTop: 6 }}>
      <View style={{ width: 14, height: 14, justifyContent: 'center', alignItems: 'center', borderRadius: 30, backgroundColor: errorColor }}>
        <Text allowFontScaling={false} style={{ fontWeight: 'bold', color: 'white', textAlign: 'center', textAlignVertical: 'center', fontSize: 11, fontFamily: fontFamily }}>
          {`!`}
        </Text>
      </View>

      <Text allowFontScaling={false} style={{ marginLeft: 5, fontSize: 13, color: errorColor, fontFamily: fontFamily }}>
        {errorMessage}
      </Text>
    </Animated.View>
  )
}

export default ErrorComponent;