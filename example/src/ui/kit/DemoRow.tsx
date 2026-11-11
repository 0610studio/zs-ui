import { StyleSheet, View } from 'react-native';
import { ZSPressable, ZSText, useTheme } from '@0610studio/zs-ui';
import ContentIcon from './ContentIcon';
import { GAP, ROW_HEIGHT, ROW_INSET } from './layout';

type Props = {
  title: string;
  caption: string;
  onPress: () => void;
  destructive?: boolean;
  testID?: string;
};

export default function DemoRow({ title, caption, onPress, destructive = false, testID }: Props) {
  const { colors } = useTheme();

  return (
    <ZSPressable onPress={onPress} testID={testID} accessibilityRole="button" style={styles.pressable}>
      <View style={styles.row}>
        <View style={styles.textWrap}>
          <ZSText variant="subtitle1" color={destructive ? 'error' : 'text'}>
            {title}
          </ZSText>
          <ZSText variant="caption" color="textSecondary">
            {caption}
          </ZSText>
        </View>
        <ContentIcon name="chevronRight" size={20} color={colors.textSecondary} />
      </View>
    </ZSPressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    marginHorizontal: -ROW_INSET,
    paddingHorizontal: ROW_INSET,
  },
  row: {
    width: '100%',
    minHeight: ROW_HEIGHT.double,
    flexDirection: 'row',
    alignItems: 'center',
    gap: GAP.md,
    paddingVertical: GAP.md,
  },
  textWrap: {
    flex: 1,
    gap: GAP.xxs,
  },
});
