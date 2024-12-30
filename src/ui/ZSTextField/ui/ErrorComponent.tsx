import { View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import ZSText from "../../ZSText";

const ErrorComponent = ({
  errorMessage,
  errorColor,
}: {
  errorMessage: string;
  errorColor: string;
}) => {
  return (
    <Animated.View entering={FadeInDown} style={{ width: '100%', flexDirection: 'row', alignItems: 'center', paddingLeft: 5, marginTop: 6 }}>
      <View style={{ width: 14, height: 14, justifyContent: 'center', alignItems: 'center', borderRadius: 30, backgroundColor: errorColor }}>
        <ZSText allowFontScaling={false} typo='title.4' style={{ color: 'white', textAlign: 'center', textAlignVertical: 'center' }}>
          {`!`}
        </ZSText>
      </View>

      <ZSText typo='body.4' style={{ marginLeft: 5, color: errorColor }}>
        {errorMessage}
      </ZSText>
    </Animated.View>
  )
}

export default ErrorComponent;