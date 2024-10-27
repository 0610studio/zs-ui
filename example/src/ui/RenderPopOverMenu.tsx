import React from 'react';
import { StyleSheet } from 'react-native';
import { ZSText, ZSView } from "zs-ui";
import ViewAtom from "zs-ui/ui/atoms/ViewAtom";

function PopOverMenu(): JSX.Element {
  return (
    <ZSView style={styles.container}>
      {/* 삭제하기 항목 */}
      <ViewAtom style={styles.menuItem}>
        <ZSText color="danger">삭제하기</ZSText>
      </ViewAtom>

      {/* 수정하기 항목 */}
      <ViewAtom style={styles.menuItem}>
        <ZSText color="information">수정하기</ZSText>
      </ViewAtom>
    </ZSView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
});

export default PopOverMenu;
