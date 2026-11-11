import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { ZSText, ZSBox, radiusStyle, useTheme } from '@0610studio/zs-ui';
import { GAP, ROW_INSET, RULE } from './layout';

export type SectionSurface = 'group' | 'list' | 'plain';

type Props = {
  label?: string;
  required?: boolean;
  children: React.ReactNode;
  gap?: number;
  direction?: 'row' | 'column';
  surface?: SectionSurface;
  ruleInset?: number;
  /** list 행에 좌우 여백을 두지 않는다 — 행이 직접 여백을 갖고 누름 효과를 끝까지 그릴 때(ZSSwitch contentInset) */
  flushRows?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function Section({ label, required = false, children, gap = 14, direction = 'column', surface = 'group', ruleInset = ROW_INSET, flushRows = false, style }: Props) {
  return (
    <View style={styles.wrapper}>
      {label ? (
        <ZSText variant="caption" emphasized color="textSecondary" accessibilityRole="header" style={styles.header}>
          {label}
          {required ? (
            <ZSText variant="caption" emphasized color="error">
              {'  필수'}
            </ZSText>
          ) : null}
        </ZSText>
      ) : null}
      {surface === 'list' ? (
        <ListFace ruleInset={ruleInset} flushRows={flushRows} style={style}>
          {children}
        </ListFace>
      ) : (
        <ZSBox
          backgroundColor={surface === 'group' ? 'surface2' : undefined}
          style={[
            styles.body,
            surface === 'group' ? [styles.face, radiusStyle('xl')] : null,
            { gap, flexDirection: direction, flexWrap: direction === 'row' ? 'wrap' : 'nowrap' },
            style,
          ]}
        >
          {children}
        </ZSBox>
      )}
    </View>
  );
}

function ListFace({ children, ruleInset, flushRows, style }: { children: React.ReactNode; ruleInset: number; flushRows: boolean; style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();
  const rows = React.Children.toArray(children);
  return (
    <ZSBox backgroundColor="surface2" style={[styles.body, styles.list, radiusStyle('xl'), style]}>
      {rows.map((row, index) => (
        <React.Fragment key={index}>
          {index > 0 ? <View style={[styles.rule, { marginStart: ruleInset, backgroundColor: colors.border }]} /> : null}
          <View style={flushRows ? null : styles.listRow}>{row}</View>
        </React.Fragment>
      ))}
    </ZSBox>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    gap: GAP.sm,
  },
  header: {
    paddingHorizontal: GAP.xs,
  },
  body: {
    width: '100%',
  },
  face: {
    padding: ROW_INSET,
  },
  list: {
    overflow: 'hidden',
  },
  listRow: {
    paddingHorizontal: ROW_INSET,
  },
  rule: {
    height: RULE,
  },
});
