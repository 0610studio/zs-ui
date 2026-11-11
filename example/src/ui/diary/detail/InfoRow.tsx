import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { ZSText } from '@0610studio/zs-ui';
import { GAP, ROW_HEIGHT } from '../../kit/layout';

type Props = {
  label?: string;
  value: ReactNode;
  leading?: ReactNode;
  trailing?: string;
  testID?: string;
};

export default function InfoRow({ label, value, leading, trailing, testID }: Props) {
  return (
    <View style={styles.row} accessible testID={testID}>
      {leading}
      <View style={styles.body}>
        {label ? (
          <ZSText variant="body2" color="textSecondary">
            {label}
          </ZSText>
        ) : null}
        {typeof value === 'string' ? <ZSText variant="subtitle1">{value}</ZSText> : value}
      </View>
      {trailing ? (
        <ZSText variant="body1" color="textSecondary">
          {trailing}
        </ZSText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { width: '100%', minHeight: ROW_HEIGHT.single, flexDirection: 'row', alignItems: 'center', gap: GAP.md, paddingVertical: GAP.md },
  body: { flexGrow: 1, flexShrink: 1, gap: GAP.xxs },
});
