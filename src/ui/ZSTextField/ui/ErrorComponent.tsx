import Animated, { FadeInDown } from "react-native-reanimated";
import ZSText from "../../ZSText";
import SvgExclamation from "../../../assets/SvgExclamation";

const ErrorComponent = ({
  errorMessage,
  errorColor,
}: {
  errorMessage: string;
  errorColor: string;
}) => {
  return (
    <Animated.View entering={FadeInDown} style={{ width: '100%', flexDirection: 'row', alignItems: 'center', paddingLeft: 5, paddingTop: 9 }}>
      <SvgExclamation
        size={16}
        backgroundColor={errorColor}
      />

      <ZSText typo='body.4' style={{ marginLeft: 5, color: errorColor }}>
        {errorMessage}
      </ZSText>
    </Animated.View>
  )
}

export default ErrorComponent;