import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNotify, ZSPressable, ZSText, ZSView, useTheme, ZSTextField } from 'zs-ui';
import { ColorPalette, ThemeBackground } from 'zs-ui/theme';

interface MyModalProps {
  onConfirm?: () => void;
}

function MyModal({ onConfirm }: MyModalProps) {
  const { hideNotify } = useNotify();
  const { palette: { background, primary, divider } } = useTheme();
  const [search, setSearch] = useState<string>('');
  const styles = useMemo(() => createStyles({ background, primary }), [background, primary]);

  const handleConfirmPress = useCallback(() => {
    onConfirm?.();
  }, [onConfirm]);

  const handleClosePress = useCallback(() => {
    hideNotify('all');
  }, [hideNotify]);

  return (
    <ZSView style={styles.container}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 15, paddingHorizontal: 15, paddingTop: 5 }}>
        <ZSPressable onPress={handleConfirmPress}>
          <ZSText typo='subTitle.1'>닫기</ZSText>
        </ZSPressable>
        <ZSPressable onPress={handleClosePress}>
          <ZSText typo='subTitle.1'>확인</ZSText>
        </ZSPressable>
      </View>

      <View style={{ width: '100%', height: 1, backgroundColor: divider }} />

      <View style={styles.contents}>
        <ZSTextField
          boxStyle="outline"
          label="검색어를 입력해주세요"
          value={search}
          inputBgColor={background.base}
          labelBgColor={background.base}
          focusColor={primary.main}
          onChangeText={setSearch}
          textInputProps={{
            multiline: false,
          }}
        />
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
      flex: 1,
    },
    contents: {
      paddingHorizontal: 15,
      paddingTop: 30
    }
  });

// 컴포넌트 export, 이름을 명확하게 수정
export default MyModal;
