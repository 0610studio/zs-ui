import React from "react";
import { Button, StyleSheet } from "react-native";
import { useOverlay, ZSContainer, ZSText, useTheme, Theme } from "zs-ui";
import MyBottomSheet from "../src/ui/MyBottomSheet";
import MyModal from "../src/ui/MyModal";
import { useStyleSheetCreate } from "zs-ui";

const OverlayExample = () => {
  const { showAlert, showSnackBar, showBottomSheet, showModality, hideOverlay } = useOverlay();
  const { palette } = useTheme();
  const styles = useStyleSheetCreate(createStyles);

  return (
    <ZSContainer style={styles.container}>
      <Button
        onPress={() =>
          showAlert({
            title: "타이틀 테스트 길어지면 줄바꿈이 될 수 있습니다.",
            informative: "테스트 informative 길~~~~~~~~어지면 줄바꿈이 될 수 있습니다.",
            primaryButtonStyle: { backgroundColor: palette.primary.main },
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
      />

      <Button
        onPress={() => {
          showSnackBar({
            message: Date.now().toString(),
            type: "success",
          });
        }}
        title="show_SnackBar"
      />

      <Button
        onPress={() => {
          showSnackBar({
            message: Date.now().toString() + '길~~~~~~어진 스낵바 테스트 입니다아아아아아',
            type: "error",
          });
        }}
        title="show_SnackBar_Error"
      />

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
        title="show_BottomSheet_Floating"
      />

      <Button
        onPress={() => {
          showBottomSheet({
            options: {
              height: 400,
              type: 'fixed'
            },
            component: (
              <MyBottomSheet
                onConfirm={() => {
                  console.log("event");
                }}
              />
            ),
          });
        }}
        title="show_BottomSheet_Fixed"
      />

      <Button
        onPress={() => {
          showModality({
            component: (
              <MyModal
                onConfirm={() => {
                  console.log("event");
                  hideOverlay('modal');
                }}
              />
            ),
          });
        }}
        title="show_Modality"
      />
    </ZSContainer>
  );
};



const createStyles = (palette: Theme) => StyleSheet.create({
  container: {
    gap: 30,
    paddingTop: 40,
    backgroundColor: palette.background.layer2,
    paddingHorizontal: 15,
  },
});


export default OverlayExample;
