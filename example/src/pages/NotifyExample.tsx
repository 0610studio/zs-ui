import React, { useMemo } from "react";
import { Button, StyleSheet } from "react-native";
import { PopOverButton, useNotify, ZSContainer, ZSText, ZSView, useTheme } from "zs-ui";
import MyBottomSheet from "../ui/MyBottomSheet";
import TitleCard from "../ui/TitleCard";
import RenderPopOverMenu from "../ui/RenderPopOverMenu";
import MyModal from "../ui/MyModal";

const NotifyExample = () => {
  const { showAlert, showSnackBar, showBottomSheet, showModality, hideNotify } = useNotify();
  const {
    palette: {
      background,
      text,
      primary,
      secondary,
      danger,
      warning,
      success,
      information,
      grey,
    },
  } = useTheme();

  const styles = useMemo(
    () =>
      createStyles({
        background,
        text,
        primary,
        secondary,
        danger,
        warning,
        success,
        information,
        grey
      }),
    [background, text, primary, secondary, danger, warning, success, information, createStyles, grey]
  );

  return (
    <ZSContainer style={styles.container} edges={["top"]}>
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

      <Button
        onPress={() => {
          showSnackBar({
            message: Date.now().toString(),
            type: "success",
          });
        }}
        title="show_SnackBar"
        color="#841500"
      />

      <Button
        onPress={() => {
          showBottomSheet({
            isScrollView: true,
            contentsGestureEnable: false,
            maxHeight: 300,
            showsVerticalScrollIndicator: true,
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
        onPress={() => {
          showModality({
            component: (
              <MyModal
                onConfirm={() => {
                  console.log("event");
                  hideNotify('all');
                }}
              />
            ),
          });
        }}
        title="show_Modality"
        color="#331599"
      />
    </ZSContainer>
  );
};


const createStyles = ({
  background,
  text,
  primary,
  secondary,
  danger,
  warning,
  success,
  information,
  grey
}: {
  background: any;
  text: any;
  primary: any;
  secondary: any;
  danger: any;
  warning: any;
  success: any;
  information: any;
  grey: any
}) =>
  StyleSheet.create({
    container: {
      gap: 30,
      paddingTop: 90,
      backgroundColor: background.layer2,
      paddingHorizontal: 15,
    },
    popOverButtonContainer: {
      paddingRight: 10,
      paddingLeft: 15,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: grey[50],
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
      borderColor: grey[50],
      justifyContent: "center",
      alignItems: "center",
    },
    dot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: grey[50],
    },
  });


export default NotifyExample;
