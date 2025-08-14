import { View } from "react-native";
import { ZSContainer, ZSTextField, ZSAboveKeyboard } from "zs-ui";
import CtaButton from "../src/ui/CtaButton";
import { useState } from "react";

function ZSContainerExample() {
  const [ctaLayoutHeight, setCtaLayoutHeight] = useState(0);
  return (
    <ZSContainer
      edges={['bottom']}
      keyboardScrollExtraOffset={130}
      style={{ paddingHorizontal: 30, paddingTop: 30, paddingBottom: 30 + ctaLayoutHeight }}
    >
      <ZSTextField
        boxStyle="outline"
        label="필드 1"
        value={''}
        onChangeText={() => { }}
        focusColor={'red'}
      />

      <View style={{ height: 500 }} />

      <ZSTextField
        boxStyle="underline"
        label="필드 2"
        value={''}
        onChangeText={() => { }}
        focusColor={'red'}
      />

      <View style={{ height: 500 }} />

      <ZSTextField
        boxStyle="outline"
        label="필드 3"
        value={''}
        onChangeText={() => { }}
        focusColor={'red'}
      />

      <ZSAboveKeyboard handleLayoutHeight={setCtaLayoutHeight}>
        <CtaButton
          disabled={false}
          // ---
          primaryButtonText='CTA 버튼'
          onPrimaryButtonPress={() => { }}
          // ---
          secondaryButtonText='취소'
          onSecondaryButtonPress={() => { }}
        />
      </ZSAboveKeyboard>
    </ZSContainer>
  );
}

export default ZSContainerExample;