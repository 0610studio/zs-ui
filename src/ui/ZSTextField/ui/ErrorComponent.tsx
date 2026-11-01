import Animated, { FadeInDown } from "react-native-reanimated";
import ZSText from "../../ZSText";
import SvgExclamation from "../../../assets/SvgExclamation";
import { type ViewProps } from "react-native";

const ErrorComponent = ({
  errorMessage,
  errorColor,
  ...props
}: {
  errorMessage: string;
  errorColor: string;
} & ViewProps) => {
  return (
    <Animated.View entering={FadeInDown} style={{ width: '100%', flexDirection: 'row', alignItems: 'center', paddingLeft: 5, paddingTop: 9 }} {...props}>
      <SvgExclamation
        size={16}
        backgroundColor={errorColor}
      />

      {/* 가로 줄이라 글자가 줄지 않으면 큰 글자에서 두 줄 문구가 화면 밖으로 밀린다 */}
      <ZSText typo='body.4' style={{ flexShrink: 1, marginLeft: 5, color: errorColor }}>
        {errorMessage}
      </ZSText>
    </Animated.View>
  )
}

export default ErrorComponent;
