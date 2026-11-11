import { useRef, useState } from 'react';
import { View } from 'react-native';
import { ZSText, ZSTextField, type ZSTextFieldRef } from '@0610studio/zs-ui';

export function TextFieldExample({ title, gap = 200 }: { title: string; gap?: number }) {
  const [field1, setField1] = useState('');
  const [field2, setField2] = useState('');
  const [field3, setField3] = useState('');
  const field1Ref = useRef<ZSTextFieldRef>(null);

  return (
    <View style={{ gap }}>
      <ZSText variant="h1" emphasized>{title}</ZSText>
      <ZSTextField ref={field1Ref} label="필드 1" value={field1} onChangeText={setField1} />
      <ZSTextField variant="inbox" label="필드 2" value={field2} onChangeText={setField2} />
      <ZSTextField label="필드 3" value={field3} onChangeText={setField3} />
    </View>
  );
}
