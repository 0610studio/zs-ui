import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { ZSText, ZSView } from 'zs-ui';

type Props = {
  label?: string;
  children: React.ReactNode;
  gap?: number;
  direction?: 'row' | 'column';
  style?: StyleProp<ViewStyle>;
};

/** 섹션 라벨 + 흰 카드로 구성된 예제 공용 섹션 래퍼 */
export default function Section({ label, children, gap = 14, direction = 'column', style }: Props) {
  return (
    <View style={styles.wrapper}>
      {label && (
        <ZSText typo="subTitle.4" color="secondary" style={styles.label}>
          {label.toUpperCase()}
        </ZSText>
      )}
      <ZSView
        color="base"
        elevationLevel={1}
        style={[
          styles.card,
          // column + wrap 은 높이 제약 시 자식이 오른쪽 새 열로 넘어가므로 row 일 때만 wrap
          { gap, flexDirection: direction, flexWrap: direction === 'row' ? 'wrap' : 'nowrap' },
          style,
        ]}
      >
        {children}
      </ZSView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    gap: 10,
  },
  label: {
    letterSpacing: 1.5,
    marginLeft: 4,
  },
  card: {
    width: '100%',
    borderRadius: 16,
    padding: 18,
  },
});
