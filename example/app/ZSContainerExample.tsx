import { View } from "react-native";
import { ZSContainer, ZSTextField, ZSAboveKeyboard, useOverlay } from "zs-ui";
import CtaButton from "../src/ui/CtaButton";
import { useState } from "react";
import { router } from "expo-router";
import useIsFocused from "../src/hooks/useIsFocused";

function ZSContainerExample() {
  const [ctaLayoutHeight, setCtaLayoutHeight] = useState(0);
  const isFocused = useIsFocused();

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

      <ZSAboveKeyboard
        handleLayoutHeight={setCtaLayoutHeight}
        isFocused={isFocused}
      >
        <CtaButton
          disabled={false}
          // ---
          primaryButtonText='CTA 버튼'
          onPrimaryButtonPress={() => {
            router.push('/404')
          }}
          // ---
          secondaryButtonText='취소'
          onSecondaryButtonPress={() => { }}
        />
      </ZSAboveKeyboard>
    </ZSContainer>
  );
}

export default ZSContainerExample;