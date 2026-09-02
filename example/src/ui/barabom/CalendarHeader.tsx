import { Image, Pressable, StyleSheet, View } from 'react-native';
import { ZSPressable, ZSText, useTheme, type CalendarHeaderContext } from '@0610studio/zs-ui';
import { BARABOM_IMAGES } from './stickers';

type Props = CalendarHeaderContext & {
  petName: string;
  /** 새 알림이 있으면 종 아이콘에 점을 찍는다 */
  hasUnread?: boolean;
  onNotificationPress?: () => void;
};

/**
 * 바라봄 ZSCalendar/ui/calendar-header — 왼쪽 반려동물, 가운데 연월, 오른쪽 알림 종.
 * 달 이동 화살표가 없다. 바라봄처럼 달력 스와이프로만 넘긴다.
 */
export default function BarabomCalendarHeader({ visibleMonth, onTitlePress, petName, hasUnread = false, onNotificationPress }: Props) {
  const { palette } = useTheme();
  const year = Number(visibleMonth.slice(0, 4));
  const month = Number(visibleMonth.slice(5, 7));
  const title = `${year}년 ${month}월`;

  return (
    <View style={styles.header}>
      <View style={styles.leftBox}>
        <View style={styles.petContainer}>
          <View style={[styles.petImg, { backgroundColor: palette.primary[20] }]}>
            <ZSText style={styles.petEmoji}>🐶</ZSText>
          </View>
          <ZSText allowFontScaling={false} typo="subTitle.2" color="secondary">{petName}</ZSText>
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
          <ZSText allowFontScaling={false} typo="subTitle.1">{title}</ZSText>
          <Image source={BARABOM_IMAGES.ARROW_DOWN} style={[styles.arrow, { tintColor: palette.text.base }]} />
        </Pressable>
      </View>

      <View style={styles.rightBox}>
        <ZSPressable onPress={onNotificationPress} hitSlop={10} pressedBackgroundColor="transparent" accessibilityRole="button" accessibilityLabel="알림">
          <Image source={BARABOM_IMAGES.NOTI_MESSAGE} style={[styles.bell, { tintColor: palette.grey[50] }]} />
          {hasUnread && <View style={[styles.dot, { backgroundColor: palette.primary.main, borderColor: palette.background.base }]} />}
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
  petImg: { borderRadius: 12, width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  petEmoji: { fontSize: 13, lineHeight: 16 },
  titleContainer: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  arrow: { width: 18, height: 18, marginTop: 1 },
  bell: { width: 18, height: 18, marginTop: 1 },
  dot: { width: 7, height: 7, borderRadius: 4, borderWidth: 1, position: 'absolute', right: 1, top: 1 },
});
