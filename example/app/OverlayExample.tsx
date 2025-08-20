import React, { useState } from "react";
import { Button, StyleSheet } from "react-native";
import { PopOverButton, useOverlay, ZSContainer, ZSText, ZSView, useTheme, Theme } from "zs-ui";
import MyBottomSheet from "../src/ui/MyBottomSheet";
import TitleCard from "../src/ui/TitleCard";
import RenderPopOverMenu from "../src/ui/RenderPopOverMenu";
import MyModal from "../src/ui/MyModal";
import { useStyleSheetCreate } from "zs-ui/model";

const OverlayExample = () => {
  const { showAlert, showSnackBar, showBottomSheet, showModality, hideOverlay } = useOverlay();
  const { palette } = useTheme();
  const styles = useStyleSheetCreate(createStyles);

  return (
    <ZSContainer
      style={styles.container}
      keyboardScrollExtraOffset={130}
      edges={["bottom"]}
    >
      <TitleCard title="PopOverButton">
        <ZSView style={{ flex: 1, alignItems: "flex-end" }}>
          <PopOverButton
            width={140}
            height={50}
            popOverMenuComponent={<RenderPopOverMenu />}
          >
            <ZSView style={styles.popOverButtonContainer}>
              <ZSText>팝오버 메뉴</ZSText>
              <ZSView style={styles.popOverIcon}>
                <ZSView style={styles.dot}></ZSView>
                <ZSView style={[styles.dot, { marginVertical: 3 }]}></ZSView>
                <ZSView style={styles.dot}></ZSView>
              </ZSView>
            </ZSView>
          </PopOverButton>
        </ZSView>
      </TitleCard>

      <TitleCard title="PopOverButton">
        <PopOverButton
          width={140}
          height={50}
          popOverMenuComponent={<RenderPopOverMenu />}
        >
          <ZSView style={styles.popOverButtonContainer}>
            <ZSText>팝오버 메뉴</ZSText>
            <ZSView style={styles.popOverIcon}>
              <ZSView style={styles.dot}></ZSView>
              <ZSView style={[styles.dot, { marginVertical: 3 }]}></ZSView>
              <ZSView style={styles.dot}></ZSView>
            </ZSView>
          </ZSView>
        </PopOverButton>
      </TitleCard>
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
        title="show_BottomSheet"
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

      <TitleCard title="PopOverButton">
        <PopOverButton
          width={140}
          height={50}
          popOverMenuComponent={<RenderPopOverMenu />}
        >
          <ZSView style={styles.popOverButtonContainer}>
            <ZSText>팝오버 메뉴</ZSText>
            <ZSView style={styles.popOverIcon}>
              <ZSView style={styles.dot}></ZSView>
              <ZSView style={[styles.dot, { marginVertical: 3 }]}></ZSView>
              <ZSView style={styles.dot}></ZSView>
            </ZSView>
          </ZSView>
        </PopOverButton>
      </TitleCard>
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
  popOverButtonContainer: {
    paddingRight: 10,
    paddingLeft: 15,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: palette.grey[50],
    borderRadius: 30,
    paddingVertical: 10,
    flex: 1,
  },
  popOverIcon: {
    marginLeft: 10,
    width: 30,
    height: 30,
    borderRadius: 18,
    borderWidth: 2.2,
    borderColor: palette.grey[50],
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.grey[50],
  },
});


export default OverlayExample;
