import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useOverlay, ZSPressable, ZSText, ZSView, useTheme, ZSTextField, ThemeBackground, ColorPalette } from 'zs-ui';
import { useBottomSheet } from 'zs-ui/model/useOverlay';

interface MyBottomSheetProps {
  onConfirm?: () => void;
}

function MyBottomSheet({ onConfirm }: MyBottomSheetProps) {
  const { hideOverlay, showAlert } = useOverlay();
  const { palette: { background, primary } } = useTheme();
  const styles = useMemo(() => createStyles({ background, primary }), [background, primary]);
  const [nick, setNick] = useState<string>('');
  const { setHeight: setBottomSheetHeight } = useBottomSheet();
  const [height, setHeight] = useState<number>(300);

  useEffect(() => {
    setBottomSheetHeight(height);
  }, [height]);

  const handleConfirmPress = useCallback(() => {
    onConfirm?.();
    // 시트 위 Alert 스택 데모 — back 우선순위(Alert 먼저 닫힘) 검증용
    showAlert({
      title: '시트 위 알럿',
      informative: 'back 키는 이 알럿만 닫아야 합니다.',
      actions: { primary: { label: '확인' } },
    });
  }, [onConfirm, showAlert]);

  const handleClosePress = useCallback(() => {
    hideOverlay('bottomSheet');
  }, [hideOverlay]);

  return (
    <ZSView style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, gap: 10 }}>
        <ZSPressable style={{ width: '100%', height: 50, backgroundColor: 'red' }} onPress={() => setHeight(height + 20)}>
          <ZSText>높이 증가</ZSText>
        </ZSPressable>
        <ZSPressable style={{ width: '100%', height: 50, backgroundColor: 'red' }} onPress={() => setHeight(height - 20)}>
          <ZSText>높이 감소</ZSText>
        </ZSPressable>
        <ZSTextField label="닉네임" value={nick} onChangeText={setNick} />
        <View style={{ width: '100%', height: 50, backgroundColor: 'red' }}></View>
        <View style={{ width: '100%', height: 50, backgroundColor: 'yellow' }}></View>
        <View style={{ width: '100%', height: 50, backgroundColor: 'red' }}></View>
        <View style={{ width: '100%', height: 50, backgroundColor: 'yellow' }}></View>
        <View style={{ width: '100%', height: 50, backgroundColor: 'red' }}></View>
      </ScrollView>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <ZSPressable fullWidth style={styles.confirm} onPress={handleConfirmPress}>
            <ZSText>확인</ZSText>
          </ZSPressable>
        </View>
        <View style={{ flex: 1 }}>
          <ZSPressable fullWidth style={styles.button} onPress={handleClosePress}>
            <ZSText>닫기</ZSText>
          </ZSPressable>
        </View>
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
