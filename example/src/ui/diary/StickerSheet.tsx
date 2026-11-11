import { useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions, type LayoutChangeEvent } from 'react-native';
import { ZSPressable, ZSSegmentedControl, ZSText, ZSTextField, useTheme } from '@0610studio/zs-ui';
import { GAP } from '../kit/layout';
import { STICKER_EMOJI_GROUPS, STICKER_TABS, pickCustomEmoji, type StickerTab, type StickerValue } from '../../model/diary/common';
import { STICKERS, findSticker } from './diaryAssets';
import StickerView from './StickerView';

const PRESS_DELAY = 130;
const CELL_TARGET = 76;
const MIN_COLUMNS = 5;

type Props = {
  value: StickerValue;
  onSelect: (value: StickerValue) => void;
};

function Cell({ selected, label, onPress, testID, width, children }: { selected: boolean; label: string; onPress: () => void; testID: string; width: `${number}%`; children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.cell, { width }]}>
      <ZSPressable
        onPress={onPress}
        unstable_pressDelay={PRESS_DELAY}
        radius="lg"
        accessibilityRole="radio"
        accessibilityLabel={label}
        accessibilityState={{ checked: selected }}
        testID={testID}
        style={[styles.cellInner, { borderColor: selected ? colors.text : 'transparent' }]}
      >
        {children}
      </ZSPressable>
    </View>
  );
}

/** 시트 제목 — showBottomSheet header 로 넘긴다(헤더 줄에서 시트를 끈다) */
export const STICKER_SHEET_TITLE = '스티커를 선택해주세요.';

export default function StickerSheet({ value, onSelect }: Props) {
  const { height: windowHeight } = useWindowDimensions();
  const [tab, setTab] = useState<StickerTab>(findSticker(value) ? 'image' : 'emoji');
  const [custom, setCustom] = useState('');
  const [customError, setCustomError] = useState<string | undefined>(undefined);
  const [columns, setColumns] = useState(MIN_COLUMNS);
  const cellWidth = `${100 / columns}%` as const;
  const measure = (event: LayoutChangeEvent) => setColumns(Math.max(MIN_COLUMNS, Math.floor(event.nativeEvent.layout.width / CELL_TARGET)));

  const onCustomChange = (text: string) => {
    setCustom(text);
    if (!text.trim()) {
      setCustomError(undefined);
      return;
    }
    const emoji = pickCustomEmoji(text);
    if (emoji) onSelect(emoji);
    else setCustomError('이모지 하나를 골라 주세요');
  };

  return (
    <View style={styles.root}>
      <ZSSegmentedControl options={STICKER_TABS} value={tab} onValueChange={setTab} testID="diary-sticker-tab" />
      <ScrollView style={{ maxHeight: Math.round(windowHeight * 0.5) }} keyboardShouldPersistTaps="handled" onLayout={measure}>
        {tab === 'image' ? (
          <View style={styles.grid} accessibilityRole="radiogroup">
            {STICKERS.map((sticker) => (
              <Cell key={sticker.code} selected={sticker.code === value} label={sticker.name} onPress={() => onSelect(sticker.code)} testID={`diary-sticker-${sticker.code}`} width={cellWidth}>
                <StickerView value={sticker.code} size={48} />
              </Cell>
            ))}
          </View>
        ) : (
          <View style={styles.groups}>
            {STICKER_EMOJI_GROUPS.map((group) => (
              <View key={group.title} style={styles.group}>
                <ZSText variant="subtitle2" emphasized color="textSecondary">
                  {group.title}
                </ZSText>
                <View style={styles.grid} accessibilityRole="radiogroup">
                  {group.items.map((item) => (
                    <Cell key={item.emoji} selected={item.emoji === value} label={item.name} onPress={() => onSelect(item.emoji)} testID={`diary-emoji-${item.name}`} width={cellWidth}>
                      <ZSText style={styles.emoji} allowFontScaling={false}>
                        {item.emoji}
                      </ZSText>
                    </Cell>
                  ))}
                </View>
              </View>
            ))}
            <View style={styles.group}>
              <ZSText variant="subtitle2" emphasized color="textSecondary">
                직접 고르기
              </ZSText>
              <ZSTextField label="키보드에서 이모지 하나" placeholder="이모지 하나" value={custom} onChangeText={onCustomChange} errorText={customError} testID="diary-emoji-custom" />
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: GAP.lg, paddingBottom: GAP.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -GAP.xxs },
  cell: { aspectRatio: 1, padding: GAP.xxs },
  cellInner: { flex: 1, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  emoji: { fontSize: 30, lineHeight: 38 },
  groups: { gap: GAP.xl, paddingBottom: GAP.sm },
  group: { gap: GAP.sm },
});
