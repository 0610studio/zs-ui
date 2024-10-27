import React, { useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useNotify, ZSPressable, ZSText, ZSView } from 'zs-ui';
import { useTheme } from 'zs-ui/model/useThemeProvider';
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
      <ZSPressable fullWidth style={styles.confirm} onPress={handleConfirmPress}>
        <ZSText>확인</ZSText>
      </ZSPressable>
      <ZSPressable fullWidth style={styles.button} onPress={handleClosePress}>
        <ZSText>닫기</ZSText>
      </ZSPressable>
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
      flexDirection: 'row',
      gap: 15,
      width: '100%',
      alignItems: 'flex-end'
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
