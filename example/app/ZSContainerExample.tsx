import { View } from "react-native";
import { ZSAboveKeyboard, ZSContainer, ZSTextField } from "zs-ui";
import CtaButton from "../src/ui/CtaButton";

function ZSContainerExample() {
  return (
    <ZSContainer
      edges={['bottom']}
      keyboardScrollExtraOffset={130}
      style={{ padding: 30 }}
      bottomComponent={
        <ZSAboveKeyboard
          render={() => (
            <CtaButton
              primaryButtonText='CTA 버튼'
              onPrimaryButtonPress={() => { }}
            />
          )}
        />
      }
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

      <View style={{ height: 100 }} />
    </ZSContainer>
  );
}

export default ZSContainerExample;