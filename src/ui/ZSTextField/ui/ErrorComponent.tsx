import Animated, { FadeInDown } from "react-native-reanimated";
import ZSText from "../../ZSText";
import SvgExclamation from "../../../assets/SvgExclamation";
import { type ViewProps } from "react-native";

const ErrorComponent = ({
  errorMessage,
  errorColor,
  ...accessibilityProps
}: {
  errorMessage: string;
  errorColor: string;
} & ViewProps) => {
  return (
    <Animated.View entering={FadeInDown} style={{ width: '100%', flexDirection: 'row', alignItems: 'center', paddingLeft: 5, paddingTop: 9 }} {...accessibilityProps}>
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