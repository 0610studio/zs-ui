import { StyleSheet, View } from 'react-native';
import { ZSPressable, ZSText, useTheme } from '@0610studio/zs-ui';

type Props = {
  title: string;
  caption: string;
  dotColor: string;
  onPress: () => void;
  /** 마지막 행이면 하단 구분선을 생략한다 */
  isLast?: boolean;
};

export default function DemoRow({ title, caption, dotColor, onPress, isLast = false }: Props) {
  const { palette } = useTheme();

  return (
    <ZSPressable fullWidth onPress={onPress}>
      <View
        style={[
          styles.row,
          !isLast && { borderBottomWidth: 1, borderBottomColor: palette.grey[20] },
        ]}
      >
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
        <View style={styles.textWrap}>
          <ZSText typo="subTitle.2">{title}</ZSText>
          <ZSText typo="caption.1" color="secondary">{caption}</ZSText>
        </View>
        <ZSText typo="heading.6" style={{ color: palette.grey[50] }}>›</ZSText>
      </View>
    </ZSPressable>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
});
