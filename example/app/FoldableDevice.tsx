import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { ZSContainer, useFoldingState } from 'zs-ui';
import { FoldingState } from 'zs-ui/model/types';

export default function FoldableDevice() {
  const foldingState = useFoldingState();

  return (
    <ZSContainer edges={[]} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* 현재 폴딩 상태 */}
        <View style={styles.foldingSection}>
          <Text style={styles.sectionTitle}>현재 폴딩 상태</Text>
          <View style={styles.foldingInfoContainer}>
            <View style={styles.foldingInfoItem}>
              <Text style={styles.foldingInfoLabel}>상태:</Text>
              <Text style={[
                styles.foldingInfoValue,
                { color: foldingState.foldingState === FoldingState.FOLDED ? '#FF9800' : '#4CAF50' }
              ]}>
                {foldingState.foldingState === FoldingState.FOLDED ? '폴딩/일반 상태' : '언폴딩'}
              </Text>
            </View>
            <View style={styles.foldingInfoItem}>
              <Text style={styles.foldingInfoLabel}>화면 너비:</Text>
              <Text style={styles.foldingInfoValue}>{foldingState.width} (PT)</Text>
            </View>
            <View style={styles.foldingInfoItem}>
              <Text style={styles.foldingInfoLabel}>Dimensions.get().width:</Text>
              <Text style={styles.foldingInfoValue}>{Dimensions.get('window').width}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ZSContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
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
});
