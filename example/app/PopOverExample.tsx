import React from "react";
import { StyleSheet, View } from "react-native";
import { PopOverButton, useOverlay, ZSContainer, ZSText, ZSView, useTheme, Theme } from "zs-ui";
import TitleCard from "../src/ui/TitleCard";
import RenderPopOverMenu from "../src/ui/RenderPopOverMenu";
import { useStyleSheetCreate } from "zs-ui/model";

const PopOverExample = () => {
  const { showAlert, showSnackBar, showBottomSheet, showModality, hideOverlay } = useOverlay();
  const { palette } = useTheme();
  const styles = useStyleSheetCreate(createStyles);

  return (
    <ZSContainer style={styles.container} edges={["bottom"]} >
      <TitleCard title="우측">
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

      <TitleCard title="좌측">
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

      <View style={{ width: 10, height: 300 }} />

      <TitleCard title="하단">
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


export default PopOverExample;
