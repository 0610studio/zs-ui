import { StyleSheet, View } from 'react-native';
import { ZSBanner, ZSText, useOverlay } from '@0610studio/zs-ui';
import { GAP } from '../kit/layout';
import { BEHAVIOR_TEXT, type Advice } from '../../model/diary/behavior';

function SourcesSheet({ sources }: { sources: string[] }) {
  return (
    <View style={styles.sheet}>
      <View style={styles.sources}>
        {sources.map((source) => (
          <ZSText key={source} variant="body2" color="textSecondary">
            {source}
          </ZSText>
        ))}
      </View>
    </View>
  );
}

export default function AdviceCards({ advice, testID }: { advice: Advice[]; testID: string }) {
  const { showBottomSheet } = useOverlay();
  return (
    <View style={styles.cards}>
      {advice.map((item) => (
        <ZSBanner
          key={item.key}
          status={item.status}
          title={item.title}
          message={item.body}
          action={{ label: BEHAVIOR_TEXT.sourcesToggle(item.sources.length), onPress: () => showBottomSheet({ header: BEHAVIOR_TEXT.sources, component: <SourcesSheet sources={item.sources} /> }) }}
          fullWidth
          testID={`${testID}-${item.key}`}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  cards: { gap: GAP.md },
  sheet: { gap: GAP.lg },
  sources: { gap: GAP.md },
});
