import React, { useMemo, useState, useCallback } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { ZSRadioGroup, ZSTextField, ThrottleButton, ZSText, ZSContainer, ZSPressable, ZSBottomButton, useTheme, ErrorComponent } from 'zs-ui';
import TitleCard from '../src/ui/TitleCard';
import type { RadioOption } from 'zs-ui';

function LayoutExample(): React.JSX.Element {
  const [nick, setNick] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [userId, serUserId] = useState<string>('');
  const [memo, setMemo] = useState<string>('');
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);
  const [responseType, setResponseType] = useState<RadioOption>();
  const { palette: { background, primary, text, danger } } = useTheme();
  const styles = useMemo(() => createStyles({ background }), [background]);

  const handleSubmit = useCallback(
    async () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve('완료');
        }, 5000);
      });
    },
    []
  );

  return (
    <ZSContainer
      edges={['bottom']}
      keyboardScrollExtraOffset={130}
      style={styles.container}
      bottomComponent={
        <ZSBottomButton
          disabled={buttonDisabled}
          loadingComponent={<ActivityIndicator color="white" />}
          primaryButtonStyle={{ backgroundColor: buttonDisabled ? '#ff5555' : '#5555ff' }}
          primaryLabelComponent={
            <ZSText typo='subTitle.1' color='white'>
              키보드가 올라오면 늘어나요
            </ZSText>
          }
          primaryOnPress={useCallback(async () => {
            console.log('ZSBottomButton primaryOnPress');
          }, [])}
          secondaryButtonStyle={{
            backgroundColor: background.neutral,
          }}
          secondaryLabelComponent={
            <ZSText typo='subTitle.3'>2번 버튼</ZSText>
          }
          secondaryOnPress={useCallback(() => {
            console.log('건너뛰기 버튼 클릭');
          }, [])}
        />
      }
    >
      <TitleCard title='ZSText'>
        <ZSText typo="heading.1">heading.1</ZSText>
        <ZSText typo="heading.2">heading.2</ZSText>
        <ZSText typo="heading.3">heading.3</ZSText>
        <ZSText typo="heading.4">heading.4</ZSText>
        <ZSText typo="heading.5">heading.5</ZSText>
        <ZSText typo="heading.6">heading.6</ZSText>
        <ZSText typo="subTitle.1">subTitle.1</ZSText>
        <ZSText typo="subTitle.2">subTitle.2</ZSText>
        <ZSText typo="subTitle.3">subTitle.3</ZSText>
        <ZSText typo="subTitle.4">subTitle.4</ZSText>
        <ZSText typo="subTitle.5">subTitle.5</ZSText>
        <ZSText typo="subTitle.6">subTitle.6</ZSText>
        <ZSText typo="body.1">body.1</ZSText>
        <ZSText typo="body.2">body.2</ZSText>
        <ZSText typo="body.3">body.3</ZSText>
        <ZSText typo="body.4">body.4</ZSText>
        <ZSText typo="body.5">body.5</ZSText>
        <ZSText typo="body.6">body.6</ZSText>

        <ErrorComponent
          errorMessage='에러메시지'
          errorColor={danger.main}
        />
      </TitleCard>

      <TitleCard title='ZSTextField' gap={20} flexDirection='column'>
        <ZSTextField
          boxStyle="underline"
          label="닉네임"
          value={nick}
          inputBgColor={background.base}
          labelBgColor={background.base}
          focusColor={primary.darker}
          onChangeText={setNick}
          textInputProps={{
            multiline: false,
            style: { color: text.primary },
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

      <TitleCard title='ZSPressable'>
        <ZSPressable
          style={styles.buttonStyle}
          fullWidth
          onPress={useCallback(() => { console.log('ZSPressable onPress'); }, [])}
        >
          <ZSText typo="subTitle.1" color='information.50'>FullWidth 버튼</ZSText>
        </ZSPressable>
        <ZSPressable style={styles.buttonStyle} color='primary'>
          <ZSText typo="subTitle.1">버튼1</ZSText>
        </ZSPressable>
        <ZSPressable style={styles.buttonStyle} color='danger.40'>
          <ZSText typo="heading.3">버튼2</ZSText>
        </ZSPressable>
        <ZSPressable style={styles.buttonStyle} color='neutral'>
          <ZSText typo="heading.1">버튼3</ZSText>
        </ZSPressable>
      </TitleCard>

      <TitleCard title='ZSRadioGroup'>
        <ZSRadioGroup
          options={[
            { value: '답변이 필요없어요.', index: 'none' },
            { value: '앱 알림으로 받고싶어요.', index: 'app' },
            { value: '이메일로 받고싶어요.', index: 'email' },
          ]}
          value={responseType}
          onSelect={setResponseType}
          fullWidth
        />
      </TitleCard>

      <TitleCard title='ZSRadioGroup Grid'>
        <ZSRadioGroup
          options={[
            { value: '답변이 필요없어요.', index: 'none' },
            { value: '앱 알림으로 받고싶어요.', index: 'app' },
            { value: '이메일로 받고싶어요.', index: 'email' },
          ]}
          value={responseType}
          onSelect={setResponseType}
          rowCount={2}
        />
      </TitleCard>

      {/* ThrottleButton */}
      <TitleCard title='ThrottleButton'>
        <ThrottleButton
          primaryButtonStyle={{
            backgroundColor: primary.main,
            height: 55,
            overflow: 'hidden',
          }}
          primaryOnPress={useCallback(async () => {
            await handleSubmit();
          }, [handleSubmit])} // useCallback과 handleSubmit 메모이제이션 유지
          primaryLabelComponent={
            <ZSText typo="body.1" style={{ color: 'black' }}>
              ThrottleButton
            </ZSText>
          }
        />
      </TitleCard>
    </ZSContainer>
  );
}

const createStyles = ({
  background,
}: {
  background: any;
}) =>
  StyleSheet.create({
    container: {
      gap: 30,
      paddingTop: 40,
      backgroundColor: background.layer2,
      paddingHorizontal: 15,
      paddingBottom: 90,
    },
    buttonStyle: {
      padding: 12,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 10,
    },
  });

export default LayoutExample;
