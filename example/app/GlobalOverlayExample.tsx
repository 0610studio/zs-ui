import React from 'react';
import { View } from 'react-native';
import { ZSText, GlobalOverlay, ZSPressable } from 'zs-ui';

export default function GlobalOverlayExample() {
  return (
    <View style={{ padding: 20, gap: 16 }}>
      <ZSPressable
        onPress={() => {
          // 컴포넌트 내에서 global 함수 사용
          GlobalOverlay.showAlert({
            title: '알림',
            informative: '컴포넌트에서 호출된 Global Alert입니다.',
            actions: {
              primary: {
                label: '확인',
                onPress: () => GlobalOverlay.showSnackBar({ message: '확인 버튼 클릭됨!', type: 'success' })
              },
              secondary: {
                label: '취소',
                onPress: () => console.log('취소됨')
              }
            }
          });
        }}
        style={{ padding: 12, backgroundColor: '#007AFF', borderRadius: 8 }}
      >
        <ZSText color="white">Global Alert 표시</ZSText>
      </ZSPressable>

      <ZSPressable
        onPress={() => {
          // Global 객체를 통한 사용법
          GlobalOverlay.showBottomSheet({
            component: (
              <View style={{ padding: 20, gap: 12 }}>
                <ZSText>Global BottomSheet</ZSText>
                <ZSText>GlobalOverlay 객체를 통해 호출되었습니다.</ZSText>
                <ZSPressable
                  onPress={() => GlobalOverlay.hideOverlay('bottomSheet')}
                  style={{ padding: 8, backgroundColor: '#FF3B30', borderRadius: 6, marginTop: 8 }}
                >
                  <ZSText color="white">닫기</ZSText>
                </ZSPressable>
              </View>
            ),
            options: { height: 200 }
          });
        }}
        style={{ padding: 12, backgroundColor: '#FF9500', borderRadius: 8 }}
      >
        <ZSText color="white">Global BottomSheet 표시</ZSText>
      </ZSPressable>

      <ZSPressable
        onPress={() => {
          GlobalOverlay.showSnackBar({ message: 'SnackBar 표시', type: 'success' });
        }}
        style={{ padding: 12, backgroundColor: '#8E8E93', borderRadius: 8 }}
      >
        <ZSText color="white">SnackBar 표시</ZSText>
      </ZSPressable>
    </View>
  );
}
