import React, { useCallback, useState } from 'react';
import { Image, StyleSheet, View, type TextLayoutEvent } from 'react-native';
import { ZSPressable, ZSText, radiusStyle, useTheme } from '@0610studio/zs-ui';
import { categoryMeta, type DiaryEntry } from '../../../mock-api/db';
import { GAP, ROW_INSET, RULE, TABULAR } from '../kit/layout';
import KeyValue from './KeyValue';
import { BARABOM_IMAGES, stickerToImg } from './stickers';

type Props = {
  item: DiaryEntry;
  onPress?: () => void;
};

const MEMO_COLLAPSED_LINES = 4;

export function formatDiaryTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return time;
  const period = h < 12 ? '오전' : '오후';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${period} ${String(hour12).padStart(2, '0')}시 ${String(m).padStart(2, '0')}분`;
}

export function formatCurrency(value: number): string {
  try {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(value);
  } catch {
    return `${value.toLocaleString()}원`;
  }
}

function AgendaItemComponent({ item, onPress }: Props) {
  const { colors } = useTheme();
  const meta = categoryMeta(item.category);

  const [isMemoOpen, setIsMemoOpen] = useState(false);
  const [memoLineCount, setMemoLineCount] = useState<number | null>(null);
  const isMemoOver = (memoLineCount ?? 0) > MEMO_COLLAPSED_LINES;

  const onMemoTextLayout = useCallback((e: TextLayoutEvent) => {
    setMemoLineCount((prev) => (prev === null ? e.nativeEvent.lines.length : prev));
  }, []);

  const toggleMemo = useCallback(() => setIsMemoOpen((prev) => !prev), []);

  const writer = item.writer && item.writer.length > 8 ? `${item.writer.slice(0, 8)}...` : item.writer;
  const kicker = [meta.label, writer, item.auto ? '자동 입력' : undefined].filter(Boolean).join(' · ');

  return (
    <View style={[styles.face, radiusStyle('xl'), { backgroundColor: colors.surface2 }]}>
      <ZSPressable style={styles.body} onPress={onPress} pressedColor="transparent">
        <View style={styles.head}>
          <View style={styles.headText}>
            <View style={styles.kicker}>
              <View style={[styles.kindDot, { backgroundColor: meta.color }]} />
              <ZSText variant="caption" color="textSecondary">{kicker}</ZSText>
            </View>
            <ZSText variant="subtitle1">{formatDiaryTime(item.time)}</ZSText>
          </View>
          {item.sticker && <Image style={styles.sticker} source={stickerToImg(item.sticker)} resizeMode="contain" />}
        </View>

        {!!item.memo && (
          <View>
            {memoLineCount === null && (
              <ZSText variant="body2" style={styles.memoMeasurer} onTextLayout={onMemoTextLayout}>
                {item.memo}
              </ZSText>
            )}
            <ZSText variant="body2" numberOfLines={isMemoOpen ? undefined : MEMO_COLLAPSED_LINES} ellipsizeMode="tail">
              {item.memo}
            </ZSText>
          </View>
        )}

        <KeyValue data={item.keyValues} />

        {item.price !== undefined && (
          <ZSText variant="subtitle2" style={[styles.price, TABULAR]}>
            {formatCurrency(item.price)}
          </ZSText>
        )}
      </ZSPressable>

      {isMemoOver && (
        <ZSPressable
          style={[styles.expand, { borderTopColor: colors.border }]}
          onPress={toggleMemo}
          pressedColor="transparent"
          accessibilityRole="button"
          accessibilityState={{ expanded: isMemoOpen }}
        >
          <ZSText variant="label" color="textSecondary">{isMemoOpen ? '접기' : '펼쳐보기'}</ZSText>
          <Image
            source={BARABOM_IMAGES.ARROW_DOWN}
            style={[styles.expandIcon, { tintColor: colors.textSecondary, transform: [{ rotate: isMemoOpen ? '180deg' : '0deg' }] }]}
          />
        </ZSPressable>
      )}
    </View>
  );
}

export const AgendaItem = React.memo(AgendaItemComponent);

const styles = StyleSheet.create({
  face: { marginHorizontal: ROW_INSET, paddingHorizontal: ROW_INSET, paddingVertical: GAP.md },
  body: { gap: GAP.sm },
  head: { flexDirection: 'row', alignItems: 'center', gap: GAP.md },
  headText: { flex: 1, gap: GAP.xxs },
  kicker: { flexDirection: 'row', alignItems: 'center', gap: GAP.xs + GAP.xxs },
  kindDot: { width: 8, height: 8, borderRadius: 4 },
  sticker: { width: 36, height: 36, alignSelf: 'flex-start' },
  memoMeasurer: { position: 'absolute', left: 0, right: 0, opacity: 0 },
  price: { alignSelf: 'flex-end' },
  expand: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: GAP.xs, marginTop: GAP.sm, paddingTop: GAP.md, borderTopWidth: RULE },
  expandIcon: { width: 16, height: 16 },
});
