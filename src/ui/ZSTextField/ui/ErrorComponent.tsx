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

      {/* 가로 줄이라 글자가 줄지 않으면 큰 글자에서 두 줄 문구가 화면 밖으로 밀린다.
          두 줄이 될 때 '이하여 / 야'처럼 낱말 중간이 아니라 띄어쓰기에서 바꾼다(Android 는 무시) */}
      <ZSText typo='body.4' style={{ flexShrink: 1, marginLeft: 5, color: errorColor }} lineBreakStrategyIOS='hangul-word'>
        {errorMessage}
      </ZSText>
    </Animated.View>
  )
}

export default ErrorComponent;
