import { Image, Pressable, StyleSheet, View } from 'react-native';
import { ZSPressable, ZSText, useTheme, type CalendarHeaderContext } from '@0610studio/zs-ui';
import { BARABOM_IMAGES } from './stickers';
import AnimalPhoto from '../kit/AnimalPhoto';

const PET_SIZE = 24;

type Props = CalendarHeaderContext & {
  petName: string;
  hasUnread?: boolean;
  onNotificationPress?: () => void;
};

export default function BarabomCalendarHeader({ visibleMonth, onTitlePress, petName, hasUnread = false, onNotificationPress }: Props) {
  const { colors } = useTheme();
  const year = Number(visibleMonth.slice(0, 4));
  const month = Number(visibleMonth.slice(5, 7));
  const title = `${year}년 ${month}월`;

  return (
    <View style={styles.header}>
      <View style={styles.leftBox}>
        <View style={styles.petContainer}>
          <AnimalPhoto kind="bori" width={PET_SIZE} height={PET_SIZE} radius="full" />
          <ZSText allowFontScaling={false} variant="subtitle2" emphasized color="textSecondary">{petName}</ZSText>
        </View>
      </View>

      <View style={styles.centerBox}>
        <Pressable
          style={styles.titleContainer}
          onPress={onTitlePress}
          disabled={!onTitlePress}
          hitSlop={8}
          accessibilityRole={onTitlePress ? 'button' : 'header'}
          accessibilityLabel={title}
          testID="calendar-header-title"
        >
          <ZSText allowFontScaling={false} variant="subtitle1">{title}</ZSText>
          <Image source={BARABOM_IMAGES.ARROW_DOWN} style={[styles.arrow, { tintColor: colors.text }]} />
        </Pressable>
      </View>

      <View style={styles.rightBox}>
        <ZSPressable onPress={onNotificationPress} hitSlop={10} pressedColor="transparent" accessibilityRole="button" accessibilityLabel="알림">
          <Image source={BARABOM_IMAGES.NOTI_MESSAGE} style={[styles.bell, { tintColor: colors.text }]} />
          {hasUnread && <View style={[styles.dot, { backgroundColor: colors.text, borderColor: colors.background }]} />}
        </ZSPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingBottom: 9, paddingTop: 7, paddingHorizontal: 16 },
  leftBox: { flex: 1, alignItems: 'flex-start' },
  centerBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, flex: 1, paddingLeft: 5 },
  rightBox: { flex: 1, alignItems: 'flex-end' },
  petContainer: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', overflow: 'hidden' },
  titleContainer: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  arrow: { width: 18, height: 18, marginTop: 1 },
  bell: { width: 18, height: 18, marginTop: 1 },
  dot: { width: 7, height: 7, borderRadius: 4, borderWidth: 1, position: 'absolute', right: 1, top: 1 },
});
