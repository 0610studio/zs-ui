import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { ZSTextField, ZSContainer, useTheme, ErrorComponent } from 'zs-ui';
import TitleCard from '../src/ui/TitleCard';
import type { Theme } from 'zs-ui';
import { useStyleSheetCreate } from 'zs-ui';

function ZSTextFieldExample(): React.JSX.Element {
  const [nick, setNick] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [userId, serUserId] = useState<string>('');
  const [memo, setMemo] = useState<string>('');
  const { palette } = useTheme();
  const styles = useStyleSheetCreate(createStyles);

  return (
    <ZSContainer
      keyboardScrollExtraOffset={130}
      style={styles.container}
    >
      <TitleCard title='ZSTextField' gap={20} flexDirection='column'>
        <ZSTextField
          boxStyle="underline"
          label="닉네임"
          value={nick}
          inputBgColor={palette.background.base}
          labelBgColor={palette.background.base}
          focusColor={palette.primary.darker}
          onChangeText={setNick}
          textInputProps={{
            multiline: false,
            style: { color: palette.text.primary },
          }}
          status={nick ? 'default' : 'error'}
          errorMessage='닉네임을 입력해주세요'
        />

        <ZSTextField
          boxStyle="outline"
          label="아이디"
          value={userId}
          onChangeText={serUserId}
          focusColor={'red'}
        />

        <ZSTextField
          boxStyle="inbox"
          label="이메일"
          value={email}
          onChangeText={setEmail}
          textInputProps={{ maxLength: 5 }}
        />

        <ZSTextField
          label="메모"
          value={memo}
          onChangeText={setMemo}
          textInputProps={{
            multiline: true,
            style: { minHeight: 150, textAlignVertical: 'top' },
          }}
          isTextArea
        />
      </TitleCard>
      <TitleCard title='에러' flexDirection='column'>
        <ErrorComponent
          errorMessage='에러메시지'
          errorColor={palette.danger.main}
        />
      </TitleCard>
    </ZSContainer>
  );
}

const createStyles = (palette: Theme) => StyleSheet.create({
  container: {
    gap: 30,
    paddingTop: 40,
    backgroundColor: palette.background.layer2,
    paddingHorizontal: 15,
    paddingBottom: 90,
  },
});

export default ZSTextFieldExample;
