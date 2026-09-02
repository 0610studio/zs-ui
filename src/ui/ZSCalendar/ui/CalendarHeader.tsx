import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import ZSText from '../../ZSText';
import { useTheme } from '../../../context/ThemeContext';
import type { DateString } from '../core';
import { CALENDAR_LOCALES } from '../core';

export interface CalendarHeaderContext {
  visibleMonth: DateString;
  onPrev: () => void;
  onNext: () => void;
  onTitlePress?: () => void;
}

export interface CalendarHeaderProps extends CalendarHeaderContext {
  monthTitle?: (year: number, month: number) => string;
  /** 화살표 접근성 라벨 — 기본은 한국어 */
  prevMonthLabel?: string;
  nextMonthLabel?: string;
}

/** 헤더는 Skia 가 아니라 RN 뷰다 — 교체·접근성에 유리하고 요소가 적어 성능 이득도 없다 */
export default function CalendarHeader({
  visibleMonth,
  onPrev,
  onNext,
  onTitlePress,
  monthTitle = CALENDAR_LOCALES.ko.monthTitle,
  prevMonthLabel = CALENDAR_LOCALES.ko.prevMonth,
  nextMonthLabel = CALENDAR_LOCALES.ko.nextMonth,
}: CalendarHeaderProps) {
  const { palette } = useTheme();
  const year = Number(visibleMonth.slice(0, 4));
  const month = Number(visibleMonth.slice(5, 7));
  const title = monthTitle(year, month);

  return (
    <View style={styles.header}>
      <Pressable
        onPress={onPrev}
        hitSlop={12}
        style={styles.arrow}
        accessibilityRole="button"
        accessibilityLabel={prevMonthLabel}
        testID="calendar-header-prev"
      >
        <ZSText typo="heading.5" style={{ color: palette.text.secondary }}>‹</ZSText>
      </Pressable>

      <Pressable
        onPress={onTitlePress}
        disabled={!onTitlePress}
        hitSlop={8}
        accessibilityRole={onTitlePress ? 'button' : 'header'}
        accessibilityLabel={title}
        testID="calendar-header-title"
      >
        <ZSText typo="subTitle.1">{title}</ZSText>
      </Pressable>

      <Pressable
        onPress={onNext}
        hitSlop={12}
        style={styles.arrow}
        accessibilityRole="button"
        accessibilityLabel={nextMonthLabel}
        testID="calendar-header-next"
      >
        <ZSText typo="heading.5" style={{ color: palette.text.secondary }}>›</ZSText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4, paddingVertical: 8 },
  arrow: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
});
