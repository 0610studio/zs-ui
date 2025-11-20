import { ZSAboveKeyboard, ZSContainer } from "zs-ui";
import CtaButton from "../src/ui/CtaButton";
import { useState } from "react";
import { router } from "expo-router";
import { TextFieldExample } from "../src/ui/TextFieldExample";

function FoldableExample() {
  const [ctaLayoutHeight, setCtaLayoutHeight] = useState(0);

  return (
    <ZSContainer
      keyboardScrollExtraOffset={190}
      style={{ paddingHorizontal: 30, paddingTop: 30, paddingBottom: 30 + ctaLayoutHeight }}
      rightComponent={<TextFieldExample title="right" />}
      bottomComponent={
        <ZSAboveKeyboard
          handleLayoutHeight={setCtaLayoutHeight}>
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
        </ZSAboveKeyboard>}
    >
      <TextFieldExample title="left" />
    </ZSContainer>
  );
}

export default FoldableExample;