import { StyleSheet, View } from 'react-native';
import { ZSBox, ZSText, radiusStyle } from '@0610studio/zs-ui';
import { GAP } from '../../kit/layout';
import { DETAIL_TEXT, formatDetailDateTime, formatWon, showPrice } from '../../../model/diary/detail';
import type { DiaryRecord } from '../../../model/diary/records';
import StickerView from '../StickerView';

const STICKER = 56;

export default function DetailHead({ record }: { record: DiaryRecord }) {
  const price = showPrice(record);
  return (
    <View style={styles.root}>
      <View style={styles.text}>
        <ZSText variant="subtitle1" emphasized testID="record-datetime">
          {formatDetailDateTime(record.at)}
        </ZSText>
        {price ? (
          <View style={styles.price} accessible accessibilityLabel={`${DETAIL_TEXT.price} ${formatWon(record.price)}`} testID="record-price">
            <ZSText variant="body2" color="textSecondary">
              {DETAIL_TEXT.price}
            </ZSText>
            <ZSText variant="body2" emphasized color="textSecondary">
              {formatWon(record.price)}
            </ZSText>
          </View>
        ) : null}
      </View>
      <ZSBox backgroundColor="surface2" style={[styles.sticker, radiusStyle('lg')]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <StickerView value={record.sticker} size={STICKER - 12} />
      </ZSBox>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'center', gap: GAP.md },
  text: { flexGrow: 1, flexShrink: 1, gap: GAP.xs },
  price: { flexDirection: 'row', alignItems: 'baseline', gap: GAP.xs },
  sticker: { width: STICKER, height: STICKER, alignItems: 'center', justifyContent: 'center' },
});
