import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { ZSContainer, ZSText, useFoldingState, useTheme } from 'zs-ui';
import { FoldingState } from 'zs-ui/model/types';

export default function FoldableDevice() {
  const foldingInfo = useFoldingState();
  const { palette } = useTheme();

  return (
    <ZSContainer
      edges={[]}
      style={[styles.container, { backgroundColor: palette.background.layer1 }]}
      dividerLineComponent={<View style={{ width: 3, backgroundColor: palette.divider }} />}
      rightComponent={
        <View style={styles.rightComponent}>
          <ZSText>폴더블 기기가 펼쳐졌을때 표시됩니다.</ZSText>
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
