import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ZSText, ZSView } from '@0610studio/zs-ui';

function PopOverMenu() {
  return (
    <ZSView style={styles.container}>
      {/* 삭제하기 항목 */}
      <View style={styles.menuItem}>
        <ZSText color="danger">삭제하기</ZSText>
      </View>

      {/* 수정하기 항목 */}
      <View style={styles.menuItem}>
        <ZSText color="information">수정하기</ZSText>
      </View>
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
