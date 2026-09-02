import { useRef, useState } from "react";
import { View } from "react-native";
import { ZSText, ZSTextField } from "@0610studio/zs-ui";
import { ZSTextFieldRef } from "@0610studio/zs-ui";

/** gap 기본값 200 은 키보드 스크롤 데모용 — 필드가 멀어야 스크롤 동작이 보인다. */
export function TextFieldExample({ title, gap = 200 }: { title: string; gap?: number }) {
  const [field1, setField1] = useState('');
  const [field2, setField2] = useState('');
  const [field3, setField3] = useState('');
  const field1Ref = useRef<ZSTextFieldRef>(null);


  return (
    <View style={{ gap }}>

      <ZSText typo="heading.2">{title}</ZSText>

      <ZSTextField
        ref={field1Ref}
        boxStyle="outline"
        label="필드 1"
        value={field1}
        onChangeText={setField1}
        focusColor={'red'}
      />

      <ZSTextField
        boxStyle="underline"
        label="필드 2"
        value={field2}
        onChangeText={setField2}
        focusColor={'red'}
      />

      <ZSTextField
        boxStyle="inbox"
        label="필드 3"
        value={field3}
        onChangeText={setField3}
        focusColor={'red'}
      />
    </View>
  );
}