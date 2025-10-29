import React from 'react';
import { View, Text, StyleSheet, Dimensions, Button } from 'react-native';
import { ZSContainer, ZSText, useFoldingState, useOverlay, useTheme } from 'zs-ui';
import { FoldingState } from 'zs-ui/model/types';
import MyModal from '../src/ui/MyModal';
import MyBottomSheet from '../src/ui/MyBottomSheet';

export default function FoldableDevice() {
  const foldingInfo = useFoldingState();
  const { palette } = useTheme();
  const { showModality, showBottomSheet } = useOverlay();

  return (
    <ZSContainer
      edges={[]}
      style={[styles.container, { backgroundColor: palette.background.layer1 }]}
      dividerLineComponent={<View style={{ width: 3, backgroundColor: palette.grey[60] }} />}
      rightComponent={
        <View style={styles.rightComponent}>
          <ZSText>폴더블 기기가 펼쳐졌을때 표시됩니다.</ZSText>
          <Button title='모달 표시' onPress={() => showModality({ component: <MyModal />, foldableSingleScreen: true })} />
          <Button title='바텀시트 표시' onPress={() => showBottomSheet({ component: <MyBottomSheet />, options: { foldableSingleScreen: true } })} />
          <View style={{ width: 100, height: 100, backgroundColor: '#00ff0022' }} />
          <View style={{ width: 100, height: 100, backgroundColor: '#00ff0044' }} />
          <View style={{ width: 100, height: 100, backgroundColor: '#00ff0077' }} />
          <View style={{ width: 100, height: 100, backgroundColor: '#00ff0088' }} />
          <View style={{ width: 100, height: 100, backgroundColor: '#00ff0099' }} />
          <View style={{ width: 100, height: 100, backgroundColor: '#00ff00cc' }} />
        </View>
      }
    >
      <View style={styles.contentContainer}>
        <View style={styles.foldingSection}>
          <Text style={styles.sectionTitle}>현재 폴딩 상태</Text>
          <View style={styles.foldingInfoContainer}>
            <View style={styles.foldingInfoItem}>
              <Text style={styles.foldingInfoLabel}>foldingState:</Text>
              <Text style={[
                styles.foldingInfoValue,
                { color: foldingInfo.foldingState === FoldingState.FOLDED ? palette.primary.main : palette.information.main }
              ]}>
                {foldingInfo.foldingState === FoldingState.FOLDED ? '폴딩/일반 상태' : '언폴딩'}
              </Text>
            </View>
            <View style={styles.foldingInfoItem}>
              <Text style={styles.foldingInfoLabel}>foldingState width:</Text>
              <Text style={styles.foldingInfoValue}>{foldingInfo.width} (PT)</Text>
            </View>
            <View style={styles.foldingInfoItem}>
              <Text style={styles.foldingInfoLabel}>Dimensions.get().width:</Text>
              <Text style={[styles.foldingInfoValue, { color: palette.danger.main }]}>{Dimensions.get('window').width}</Text>
            </View>
          </View>
        </View>
      </View>
    </ZSContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 20,
  },
  foldingSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  foldingInfoContainer: {
    gap: 12,
  },
  foldingInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  foldingInfoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  foldingInfoValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  foldingLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  foldingLoadingText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  foldingErrorContainer: {
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  foldingErrorText: {
    fontSize: 12,
    color: '#F44336',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  rightComponent: {
    width: '100%',
    alignItems: 'center',
    flex: 1,
    gap: 50,
    paddingTop: 50
  },
});
