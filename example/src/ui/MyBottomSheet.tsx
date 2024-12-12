import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNotify, ZSPressable, ZSText, ZSView, useTheme } from 'zs-ui';
import { ColorPalette, ThemeBackground } from 'zs-ui/theme';

interface MyBottomSheetProps {
  onConfirm?: () => void;
}

function MyBottomSheet({ onConfirm }: MyBottomSheetProps) {
  const { hideNotify } = useNotify();
  const { palette: { background, primary } } = useTheme();
  const styles = useMemo(() => createStyles({ background, primary }), [background, primary]);

  const handleConfirmPress = useCallback(() => {
    onConfirm?.();
  }, [onConfirm]);

  const handleClosePress = useCallback(() => {
    hideNotify('bottomSheet');
  }, [hideNotify]);

  return (
    <ZSView style={styles.container}>
      <View style={{ flexDirection: 'row',gap:15}}>
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
      paddingTop: 150,
      width: '100%',
      height: 2000
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
