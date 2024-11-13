import React, { useMemo, useState, useCallback } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { ZSRadioGroup, ZSTextField, ThrottleButton, ZSText, ZSContainer, ZSPressable, ZSBottomButton, useTheme } from 'zs-ui';
import TitleCard from '../ui/TitleCard';
import type { RadioOption } from 'zs-ui/types';

function LayoutExample(): React.JSX.Element {
  const [nick, setNick] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [userId, serUserId] = useState<string>('');
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);
  const [responseType, setResponseType] = useState<RadioOption>();
  const { palette: { background, primary, text } } = useTheme();

  const styles = useMemo(
    () =>
      createStyles({
        background,
      }),
    [background]
  );

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
      style={styles.container}
      edges={['top', 'bottom']}
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
      </TitleCard>

      <TitleCard title='ZSTextField' gap={20}>
        <ZSTextField
          boxStyle="underline"
          label="닉네임"
          value={nick}
          inputBgColor={background.base}
          labelBgColor={background.base}
          focusColor={primary.main}
          onChangeText={setNick}
          textInputProps={{
            multiline: false,
            style: { color: text.primary },
          }}
        />

        <ZSTextField
          boxStyle="outline"
          label="아이디"
          value={userId}
          inputBgColor={background.base}
          labelBgColor={background.base}
          focusColor={primary.main}
          onChangeText={serUserId}
          textInputProps={{
            multiline: false,
            style: { color: text.primary, paddingTop: 8, paddingBottom: 10 },
          }}
        />

        <ZSTextField
          boxStyle="inbox"
          label="이메일"
          value={email}
          inputBgColor={background.base}
          labelBgColor={background.base}
          focusColor={primary.main}
          onChangeText={setEmail}
          textInputProps={{
            multiline: false,
            style: { color: text.primary },
          }}
        />
      </TitleCard>

      <TitleCard title='ZSPressable'>
        <ZSPressable
          style={[styles.sleekStyle, { backgroundColor: background.neutral }]}
          onPress={useCallback(() => {
            console.log('ZSPressable onPress');
          }, [])}
          fullWidth
        >
          <ZSText typo="subTitle.1">ZSPressable 버튼</ZSText>
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
          onSelect={setResponseType} // 콜백 단축
          fullWidth
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
      paddingVertical: 20,
      backgroundColor: background.layer2,
      paddingHorizontal: 15,
    },
    sleekStyle: {
      width: '100%',
      paddingVertical: 20,
      paddingHorizontal: 10,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 20,
    },
  });

export default LayoutExample;
