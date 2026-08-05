import { Dimensions, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { ZSBlockButton, ZSContainer, ZSText, useFoldingState, useOverlay, useTheme } from 'zs-ui';
import { FoldingState } from 'zs-ui/model/types';
import MyModal from '../src/ui/MyModal';
import MyBottomSheet from '../src/ui/MyBottomSheet';
import Section from '../src/ui/kit/Section';
import CodeBlock from '../src/ui/kit/CodeBlock';

function InfoRow({ label, value, valueColor, isLast }: {
  label: string;
  value: string;
  valueColor?: string;
  isLast?: boolean;
}) {
  const { palette } = useTheme();
  return (
    <View style={[styles.infoRow, !isLast && { borderBottomWidth: 1, borderBottomColor: palette.grey[20] }]}>
      <ZSText typo="label.2" color="secondary">{label}</ZSText>
      <ZSText typo="subTitle.2" style={valueColor ? { color: valueColor } : undefined}>{value}</ZSText>
    </View>
  );
}

export default function FoldableDevice() {
  const foldingInfo = useFoldingState();
  const { palette } = useTheme();
  const { showModality, showBottomSheet } = useOverlay();

  const isFolded = foldingInfo.foldingState === FoldingState.FOLDED;

  return (
    <>
      <Stack.Screen options={{ title: 'Foldable 상태' }} />
      <ZSContainer
        style={[styles.container, { backgroundColor: palette.background.layer2 }]}
        dividerLineComponent={<View style={{ width: 3, backgroundColor: palette.grey[60] }} />}
        rightComponent={
          <View style={styles.rightComponent}>
            <ZSText>폴더블 기기가 펼쳐졌을때 표시됩니다.</ZSText>
            <ZSBlockButton
              title="모달 표시"
              intent="primary"
              variant="pastel"
              typo="label.2"
              onPress={() => showModality({ component: <MyModal />, foldableSingleScreen: true })}
            />
            <ZSBlockButton
              title="바텀시트 표시"
              intent="information"
              variant="pastel"
              typo="label.2"
              onPress={() => showBottomSheet({ component: <MyBottomSheet />, options: { foldableSingleScreen: true } })}
            />
          </View>
        }
      >
        <Section label="useFoldingState()" gap={0}>
          <InfoRow
            label="foldingState"
            value={isFolded ? 'FOLDED · 폴딩/일반' : 'UNFOLDED · 언폴딩'}
            valueColor={isFolded ? palette.primary.main : palette.information.main}
          />
          <InfoRow label="foldingState width" value={`${foldingInfo.width} PT`} />
          <InfoRow
            label="Dimensions.get().width"
            value={`${Dimensions.get('window').width}`}
            valueColor={palette.danger.main}
            isLast
          />
        </Section>

        <CodeBlock
          code={`const foldingInfo = useFoldingState();

foldingInfo.foldingState
// FoldingState.FOLDED | UNFOLDED
foldingInfo.width // 현재 pane 너비 (PT)`}
        />
      </ZSContainer>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
    paddingTop: 24,
    paddingBottom: 48,
    paddingHorizontal: 20,
  },
  rightComponent: {
    flex: 1,
    padding: 20,
    gap: 12,
    alignItems: 'flex-start',
  },
  infoRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
  },
});
