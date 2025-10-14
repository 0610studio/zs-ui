import { useEffect, useRef, useState } from "react";
import { Button, View } from "react-native";
import { useOverlay, ZSText, ZSTextField } from "zs-ui";
import { ZSTextFieldRef } from "zs-ui";

export function TextFieldExample({ title }: { title: string }) {
  const { showAlert } = useOverlay();
  const [field1, setField1] = useState('');
  const [field2, setField2] = useState('');
  const [field3, setField3] = useState('');
  const field1Ref = useRef<ZSTextFieldRef>(null);

  useEffect(() => {
    setTimeout(() => {
      if (field1Ref.current) field1Ref.current.focus();
    }, 100);
  }, []);

  return (
    <View style={{ gap: 200 }}>

      <ZSText typo="heading.2">{title}</ZSText>

      <ZSTextField
        ref={field1Ref}
        boxStyle="outline"
        label="필드 1"
        value={field1}
        onChangeText={setField1}
        focusColor={'red'}
      />

      <Button
        onPress={() =>
          showAlert({
            title: "타이틀 테스트 길어지면 줄바꿈이 될 수 있습니다.",
            informative: "테스트 informative 길~~~~~~~~어지면 줄바꿈이 될 수 있습니다.",
            actions: {
              primary: {
                label: "확인",
                onPress: () => console.log("확인"),
              },
              secondary: {
                label: "취소",
                onPress: () => console.log("취소"),
              },
            },
          })
        }
        title="show_Alert"
        color="#841584"
      />

      <ZSTextField
        boxStyle="underline"
        label="필드 2"
        value={field2}
        onChangeText={setField2}
        focusColor={'red'}
      />

      <ZSTextField
        boxStyle="outline"
        label="필드 3"
        value={field3}
        onChangeText={setField3}
        focusColor={'red'}
      />
    </View>
  );
}