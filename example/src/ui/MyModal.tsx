import React, { useCallback, useMemo, useState } from 'react';
import { Button, ScrollView, StyleSheet, View } from 'react-native';
import { useOverlay, ZSPressable, ZSText, ZSView, useTheme, ZSTextField, ZSAboveKeyboard } from 'zs-ui';
import { ColorPalette, ThemeBackground } from 'zs-ui/theme';
import MyBottomSheet from './MyBottomSheet';
import CtaButton from './CtaButton';

interface MyModalProps {
  onConfirm?: () => void;
}

function MyModal({ onConfirm }: MyModalProps) {
  const { hideOverlay, showBottomSheet, showAlert } = useOverlay();
  const { palette: { background, primary, divider } } = useTheme();
  const [search, setSearch] = useState<string>('');
  const styles = useMemo(() => createStyles({ background, primary }), [background, primary]);

  const handleConfirmPress = useCallback(() => {
    onConfirm?.();
  }, [onConfirm]);

  const handleClosePress = useCallback(() => {
    hideOverlay('modal');
  }, [hideOverlay]);

  return (
    <ZSView style={styles.container}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 15, paddingHorizontal: 15, paddingTop: 5 }}>
        <ZSPressable onPress={handleConfirmPress}>
          <ZSText typo='subTitle.1'>닫기</ZSText>
        </ZSPressable>
        <ZSPressable onPress={handleClosePress}>
          <ZSText typo='subTitle.1'>확인</ZSText>
        </ZSPressable>
      </View>

      <View style={{ width: '100%', height: 1, backgroundColor: divider }} />

      <View style={styles.contents}>
        <ZSTextField
          boxStyle="outline"
          label="검색어를 입력해주세요"
          value={search}
          inputBgColor={background.base}
          labelBgColor={background.base}
          focusColor={primary.main}
          onChangeText={setSearch}
          textInputProps={{
            multiline: false,
          }}
        />
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps='handled'>
        <Button
          onPress={() => {
            showBottomSheet({
              options: {
                height: 400
              },
              headerComponent: (
                <ZSText style={{ textAlign: "center", padding: 30, backgroundColor: '#ff00ff' }}>헤더 컴포넌트1</ZSText>
              ),
              component: (
                <MyBottomSheet
                  onConfirm={() => {
                    console.log("event");
                  }}
                />
              ),
            });
          }}
          title="show_BottomSheet"
          color="#331599"
        />

        <Button
          onPress={() =>
            showAlert({
              title: "타이틀 테스트 길어지면 줄바꿈이 될 수 있습니다.",
              informative: "테스트 informative 길~~~~~~~~어지면 줄바꿈이 될 수 있습니다.",
              primaryButtonStyle: { backgroundColor: primary.main },
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

        <ZSAboveKeyboard showOnlyKeyboardVisible>
          <CtaButton
            primaryButtonText='CTA 버튼'
            onPrimaryButtonPress={() => { }}
          />
        </ZSAboveKeyboard>
      </ScrollView>
    </ZSView >
  );
}

const createStyles = ({
  background,
  primary
}: {
  background: ThemeBackground;
  primary: ColorPalette;
}) =>
  StyleSheet.create({
    container: {
      width: '100%',
      flex: 1,
    },
    contents: {
      paddingHorizontal: 15,
      paddingTop: 30
    }
  });

// 컴포넌트 export, 이름을 명확하게 수정
export default MyModal;
