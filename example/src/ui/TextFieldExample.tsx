import { useRef, useState } from "react";
import { View } from "react-native";
import { ZSText, ZSTextField } from "zs-ui";
import { ZSTextFieldRef } from "zs-ui";

/**
 * ZSContainer · FoldableExample 공용 입력 데모.
 * gap 기본값 200 은 ZSContainer 의 키보드 스크롤 데모용 — 필드가 멀리 떨어져 있어야
 * 포커스 필드로 스크롤되는 동작이 눈에 보인다. 패널 레이아웃 데모처럼 그 검증이
 * 필요 없는 화면은 더 좁은 값을 넘긴다.
 */
export function TextFieldExample({ title, gap = 200 }: { title: string; gap?: number }) {
  const [field1, setField1] = useState('');
  const [field2, setField2] = useState('');
  const [field3, setField3] = useState('');
  const field1Ref = useRef<ZSTextFieldRef>(null);

  // useEffect(() => {
  //   setTimeout(() => {
  //     if (field1Ref.current) field1Ref.current.focus();
  //   }, 300);
  // }, []);

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