import React, { useCallback, useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useOverlay, ZSPressable, ZSText, ZSView, useTheme } from 'zs-ui';
import { ColorPalette, ThemeBackground } from 'zs-ui/theme';

interface MyBottomSheetProps {
  onConfirm?: () => void;
}

function MyBottomSheet({ onConfirm }: MyBottomSheetProps) {
  const { hideOverlay } = useOverlay();
  const { palette: { background, primary } } = useTheme();
  const styles = useMemo(() => createStyles({ background, primary }), [background, primary]);

  const handleConfirmPress = useCallback(() => {
    onConfirm?.();
  }, [onConfirm]);

  const handleClosePress = useCallback(() => {
    hideOverlay('bottomSheet');
  }, [hideOverlay]);

  return (
    <ZSView style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, gap: 10 }}>
        <View style={{ width: '100%', height: 50, backgroundColor: 'red' }}></View>
        <View style={{ width: '100%', height: 50, backgroundColor: 'yellow' }}></View>
        <View style={{ width: '100%', height: 50, backgroundColor: 'red' }}></View>
        <View style={{ width: '100%', height: 50, backgroundColor: 'yellow' }}></View>
        <View style={{ width: '100%', height: 50, backgroundColor: 'red' }}></View>
        <View style={{ width: '100%', height: 50, backgroundColor: 'yellow' }}></View>
        <View style={{ width: '100%', height: 50, backgroundColor: 'red' }}></View>
        <View style={{ width: '100%', height: 50, backgroundColor: 'yellow' }}></View>
        <View style={{ width: '100%', height: 50, backgroundColor: 'red' }}></View>
      </ScrollView>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <ZSPressable fullWidth style={styles.confirm} onPress={handleConfirmPress}>
          <ZSText>확인</ZSText>
        </ZSPressable>
        <ZSPressable fullWidth style={styles.button} onPress={handleClosePress}>
          <ZSText>닫기</ZSText>
        </ZSPressable>
      </View>
    </ZSView>
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
      height: 300,
      flex: 1,
    },
    confirm: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 14,
      borderRadius: 12,
      backgroundColor: primary.main
    },
    button: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 14,
      borderRadius: 12,
      backgroundColor: background.neutral
    },
  });

// 컴포넌트 export, 이름을 명확하게 수정
export default MyBottomSheet;
