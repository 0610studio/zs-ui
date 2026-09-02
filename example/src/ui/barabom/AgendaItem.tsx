import React, { useCallback, useState } from 'react';
import { Image, StyleSheet, View, type TextLayoutEvent } from 'react-native';
import { ZSPressable, ZSText, ZSView, useTheme } from '@0610studio/zs-ui';
import { categoryMeta, type DiaryEntry } from '../../../mock-api/db';
import KeyValue from './KeyValue';
import { BARABOM_IMAGES, stickerToImg } from './stickers';

type Props = {
  item: DiaryEntry;
  onPress?: () => void;
};

const MEMO_COLLAPSED_LINES = 4;
const PRICE_COLOR = '#8f4c38';

/** 'HH:mm' → '오전 08시 30분' (바라봄 formats.time) */
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

/** 바라봄 widgets/ui/AgendaItem — 카테고리 색 바 · 시간 · 작성자 · 스티커 · 메모(4줄 접힘) · key-value · 소비 금액 */
function AgendaItemComponent({ item, onPress }: Props) {
  const { palette } = useTheme();
  const meta = categoryMeta(item.category);

  const [isMemoOpen, setIsMemoOpen] = useState(false);
  const [memoLineCount, setMemoLineCount] = useState<number | null>(null);
  const isMemoOver = (memoLineCount ?? 0) > MEMO_COLLAPSED_LINES;

  // 실제 줄 수는 한 번만 잰다 — 접힌 뒤에는 numberOfLines 때문에 4 로 고정돼 버린다
  const onMemoTextLayout = useCallback((e: TextLayoutEvent) => {
    setMemoLineCount((prev) => (prev === null ? e.nativeEvent.lines.length : prev));
  }, []);

  const toggleMemo = useCallback(() => setIsMemoOpen((prev) => !prev), []);

  const writer = item.writer && item.writer.length > 8 ? `${item.writer.slice(0, 8)}...` : item.writer;

  return (
    <ZSView style={styles.container} elevationLevel={0}>
      <ZSPressable style={styles.contentsBox} isAnimation onPress={onPress} pressedBackgroundColor="transparent" fullWidth>
        <View style={styles.header}>
          <View style={[styles.categoryBar, { backgroundColor: meta.color }]} />

          <View style={styles.headerInBox}>
            <ZSText typo="body.3">{meta.label}</ZSText>

            <View style={styles.categoryBox}>
              <ZSText typo="label.2">{formatDiaryTime(item.time)}</ZSText>

              {item.auto && (
                <View style={[styles.autoBadge, { backgroundColor: palette.primary[10], borderColor: palette.primary[30] }]}>
                  <ZSText typo="caption.4" style={{ color: palette.primary.dark }}>자동 입력</ZSText>
                </View>
              )}

              {writer && (
                <View style={[styles.writerBox, { borderColor: palette.grey[30] }]}>
                  <ZSText typo="caption.4" color="secondary">{writer}</ZSText>
                </View>
              )}
            </View>
          </View>

          {item.sticker && <Image style={styles.sticker} source={stickerToImg(item.sticker)} resizeMode="contain" />}
        </View>

        {!!item.memo && (
          <>
            {memoLineCount === null && (
              <ZSText style={[styles.memoText, styles.memoMeasurer]} onTextLayout={onMemoTextLayout}>
                {item.memo}
              </ZSText>
            )}
            <ZSText style={styles.memoText} numberOfLines={isMemoOpen ? undefined : MEMO_COLLAPSED_LINES} ellipsizeMode="tail">
              {item.memo}
            </ZSText>
          </>
        )}

        <KeyValue data={item.keyValues} />

        {item.price !== undefined && (
          <View style={styles.priceBox}>
            <ZSText typo="body.4" style={{ color: PRICE_COLOR }}>{formatCurrency(item.price)}</ZSText>
          </View>
        )}
      </ZSPressable>

      {isMemoOver && (
        <View style={styles.expandContainer}>
          <Image source={BARABOM_IMAGES.DIVIDER_GRADIENT} resizeMode="cover" style={styles.gradient} />

          <ZSPressable style={styles.expandButton} fullWidth onPress={toggleMemo} pressedBackgroundColor="transparent">
            <ZSView style={styles.expandIconBox} color="grey.20">
              <Image
                source={BARABOM_IMAGES.ARROW_DOWN}
                style={[styles.expandIcon, { tintColor: palette.text.secondary, transform: [{ rotate: isMemoOpen ? '180deg' : '0deg' }] }]}
              />
            </ZSView>
            <ZSText typo="label.4" color="secondary">{isMemoOpen ? '접기' : '펼쳐보기'}</ZSText>
          </ZSPressable>
        </View>
      )}
    </ZSView>
  );
}

export const AgendaItem = React.memo(AgendaItemComponent);

const styles = StyleSheet.create({
  container: { marginHorizontal: 14, borderRadius: 16, paddingVertical: 15, paddingHorizontal: 15 },
  contentsBox: { justifyContent: 'center', alignItems: 'center', gap: 10 },
  header: { flexDirection: 'row', width: '100%', marginVertical: 2 },
  categoryBar: { width: 3, height: '100%', borderRadius: 2 },
  headerInBox: { flexDirection: 'column', flex: 1, paddingLeft: 8, gap: 2 },
  categoryBox: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  autoBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  writerBox: { borderWidth: 1, borderRadius: 30, paddingVertical: 3, paddingHorizontal: 5, justifyContent: 'center', alignItems: 'center' },
  sticker: { width: 36, height: 36 },
  memoText: { width: '100%', paddingHorizontal: 3, paddingBottom: 6 },
  memoMeasurer: { position: 'absolute', left: 0, right: 0, opacity: 0 },
  priceBox: { flexDirection: 'row', alignItems: 'center', marginTop: 4, justifyContent: 'flex-end', width: '100%' },
  expandContainer: { marginTop: 10, width: '100%', alignItems: 'center' },
  gradient: { width: '100%', height: 1 },
  expandButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingTop: 12 },
  expandIconBox: { borderRadius: 30, justifyContent: 'center', alignItems: 'center', width: 16, height: 16 },
  expandIcon: { width: 13, height: 13, marginBottom: -1 },
});
