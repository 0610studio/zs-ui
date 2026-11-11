import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useOverlay, ZSButton, ZSText, ZSTextField } from '@0610studio/zs-ui';

type MyBottomSheetProps = {
  onConfirm?: () => void;
};

function MyBottomSheet({ onConfirm }: MyBottomSheetProps) {
  const { showBottomSheet, hideBottomSheet, showAlert, showSnackbar, showLoader, hideLoader } = useOverlay();
  const [nick, setNick] = useState('');

  const handleShowLoader = () => {
    showLoader({ accessibilityLabel: '시트에서 저장하는 중' });
    setTimeout(hideLoader, 3000);
  };

  return (
    <View style={styles.container}>
      <ZSTextField label="닉네임" value={nick} onChangeText={setNick} helperText="2~10자" testID="sheet-nickname" />
      <View style={styles.row}>
        <ZSButton
          title="확인"
          fullWidth
          style={{ flex: 1 }}
          onPress={() => {
            onConfirm?.();
            showAlert({ title: '시트 위 알럿', message: '시트를 닫지 않고 위에 뜹니다.', confirm: { label: '확인' } });
          }}
        />
        <ZSButton title="닫기" variant="tonal" color="neutral" fullWidth style={{ flex: 1 }} onPress={hideBottomSheet} />
      </View>
      <View style={styles.overlays}>
        <ZSText variant="caption" color="textSecondary">시트 위에 띄우기 — 확인은 대화상자</ZSText>
        <View style={styles.wrap}>
          <ZSButton
            title="스낵바"
            variant="outlined"
            size="small"
            testID="sheet-overlay-snackbar"
            onPress={() => showSnackbar({ message: '시트에서 띄운 스낵바' })}
          />
          <ZSButton
            title="실행 취소 스낵바"
            variant="outlined"
            size="small"
            testID="sheet-overlay-snackbar-action"
            onPress={() =>
              showSnackbar({ message: '시트에서 보관했습니다', action: { label: '실행 취소', onPress: () => showSnackbar({ message: '되돌렸습니다' }) } })
            }
          />
          <ZSButton title="진행 표시 3초" variant="outlined" size="small" testID="sheet-overlay-loader" onPress={handleShowLoader} />
          <ZSButton
            title="시트 교체"
            variant="outlined"
            size="small"
            testID="sheet-overlay-replace"
            onPress={() => showBottomSheet({
              options: { snapPoints: ['half', 'full'] },
              header: '교체된 시트',
              component: (
                <View style={{ gap: 16, paddingBottom: 24 }}>
                  <ZSButton title="닫기" testID="sheet-replaced-close" onPress={hideBottomSheet} />
                </View>
              ),
            })}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16, paddingBottom: 24 },
  row: { flexDirection: 'row', gap: 12 },
  overlays: { gap: 8 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});

export default MyBottomSheet;
