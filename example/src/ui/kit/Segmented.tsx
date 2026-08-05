import { Pressable, StyleSheet, View } from 'react-native';
import { ZSText, useTheme } from 'zs-ui';

type Props<T extends string> = {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
};

/** layer2 트랙 위에 선택 항목이 흰 알약으로 떠 있는 세그먼트 컨트롤 */
export default function Segmented<T extends string>({ options, value, onChange }: Props<T>) {
  const { palette } = useTheme();

  return (
    <View style={[styles.track, { backgroundColor: palette.background.layer2 }]}>
      {options.map((option) => {
        const active = option === value;
        return (
          <Pressable
            key={option}
            style={[styles.item, active && [styles.activeItem, { backgroundColor: palette.background.base }]]}
            onPress={() => onChange(option)}
          >
            <ZSText typo={active ? 'subTitle.3' : 'label.3'} color={active ? 'base' : 'secondary'}>
              {option}
            </ZSText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 9,
  },
  activeItem: {
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.08)',
  },
});
