import { View } from "react-native";
import { ZSContainer, ZSTextField } from "zs-ui";
import AboveKeyboard from "../src/ui/AboveKeyboard";
import CtaButton from "../src/ui/CtaButton";

function ZSContainerExample() {
  return (
    <ZSContainer
      edges={['bottom']}
      keyboardScrollExtraOffset={130}
      style={{ padding: 30 }}
      bottomComponent={
        <AboveKeyboard
          render={() => (
            <CtaButton
              primaryButtonText='수정하기'
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