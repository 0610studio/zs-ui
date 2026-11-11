import { useRef, useState } from 'react';
import { StyleSheet, View, type HostInstance } from 'react-native';
import { ZSChip, ZSPaneLayout, ZSPressable, ZSText, ZSTextField, usePaneLayout, useTheme, useWindowLayout } from '@0610studio/zs-ui';
import ScreenHeader from '../../src/ui/ScreenHeader';
import { EndMarker } from '../../src/ui/lab/FoldableLab';

const ITEMS = Array.from({ length: 12 }, (_, index) => ({ id: index + 1, title: `항목 ${index + 1}` }));
const FRACTIONS = [0.4, 0.5];

export default function LabPaneLayout() {
  const { colors } = useTheme();
  const { widthClass } = useWindowLayout();
  const [selected, setSelected] = useState(1);
  const [memo, setMemo] = useState('');
  const [compactBehavior, setCompactBehavior] = useState<'hide' | 'stack'>('hide');
  const [fraction, setFraction] = useState(FRACTIONS[0]);
  const [tabletop, setTabletop] = useState(false);

  const primary = (
    <View style={styles.pane}>
      <PaneWidth label="primary" testID="lab-pane-primary-width" />
      <PaneHook testID="lab-pane-primary-hook" />
      <ZSText variant="overline" color="textSecondary" style={styles.hook}>{`widthClass ${widthClass}`}</ZSText>
      <View style={styles.chips}>
        <ZSChip label="hide" selected={compactBehavior === 'hide'} onSelectedChange={() => setCompactBehavior('hide')} testID="lab-pane-compact-hide" />
        <ZSChip label="stack" selected={compactBehavior === 'stack'} onSelectedChange={() => setCompactBehavior('stack')} testID="lab-pane-compact-stack" />
        <ZSChip label="tabletop" selected={tabletop} onSelectedChange={() => setTabletop(!tabletop)} testID="lab-pane-tabletop" />
      </View>
      <View style={styles.chips}>
        {FRACTIONS.map((value) => (
          <ZSChip
            key={value}
            label={`${value}`}
            selected={fraction === value}
            onSelectedChange={() => setFraction(value)}
            testID={`lab-pane-fraction-${value}`}
          />
        ))}
      </View>
      {ITEMS.map((item) => (
        <ZSPressable key={item.id} onPress={() => setSelected(item.id)} testID={`lab-pane-item-${item.id}`}>
          <View
            style={[
              styles.item,
              {
                backgroundColor: colors.surface2,
                borderColor: item.id === selected ? colors.text : 'transparent',
              },
            ]}
          >
            <ZSText variant="subtitle2">{item.title}</ZSText>
          </View>
        </ZSPressable>
      ))}
      <View style={styles.detail}><EndMarker testID="lab-pane-primary-end" /></View>
    </View>
  );

  const secondary = (
    <View style={styles.pane}>
      <PaneWidth label="secondary" testID="lab-pane-secondary-width" />
      <PaneHook testID="lab-pane-secondary-hook" />
      <View style={styles.detail}>
        <ZSText variant="h3" emphasized testID="lab-pane-detail-title">{`항목 ${selected} 상세`}</ZSText>
        <ZSText variant="subtitle2" color="textSecondary">
          넓은 창에서는 목록 옆에 상세가 함께 보인다. compact 창에서는 compactBehavior 에 따라 숨기거나 목록 아래에 쌓는다.
        </ZSText>
        <ZSTextField label="상세 메모" value={memo} onChangeText={setMemo} testID="lab-pane-memo" />
        {Array.from({ length: 8 }, (_, index) => <ZSText key={index} variant="body2">{`${index + 1}. 창이 바뀌어도 선택한 항목과 메모가 유지되어야 합니다. 목록과 상세를 각각 스크롤하고 마지막 테두리까지 확인하세요.`}</ZSText>)}
        <EndMarker testID="lab-pane-secondary-end" />
      </View>
    </View>
  );

  return (
    <>
      <ScreenHeader title="Pane Layout" />
      <ZSPaneLayout
        primary={primary}
        secondary={secondary}
        primaryFraction={fraction}
        compactBehavior={compactBehavior}
        tabletop={tabletop}
        scroll
        backgroundColor={colors.surface1}
      />
    </>
  );
}

function PaneWidth({ label, testID }: { label: string; testID: string }) {
  const { colors } = useTheme();
  const ref = useRef<HostInstance>(null);
  const [width, setWidth] = useState(0);
  const [top, setTop] = useState(0);
  return (
    <View
      ref={ref}
      style={[styles.probe, { backgroundColor: colors.primary }]}
      onLayout={(event) => {
        setWidth(Math.round(event.nativeEvent.layout.width));
        ref.current?.measureInWindow((_x, y) => setTop(Math.round(y)));
      }}
    >
      <ZSText variant="subtitle2" style={{ color: colors.background }} testID={testID}>{`${label} ${width}`}</ZSText>
      <ZSText variant="overline" style={{ color: colors.background }} testID={`${testID}-top`}>{`top ${top}`}</ZSText>
    </View>
  );
}

function PaneHook({ testID }: { testID: string }) {
  const pane = usePaneLayout();
  return (
    <ZSText variant="label" color="textSecondary" style={styles.hook} testID={testID}>
      {`usePaneLayout ${pane.role} ${Math.round(pane.width)} ${pane.widthClass}`}
    </ZSText>
  );
}

const styles = StyleSheet.create({
  hook: {
    paddingHorizontal: 20,
  },
  detail: {
    paddingHorizontal: 20,
    gap: 8,
  },
  pane: {
    width: '100%',
    gap: 8,
    paddingBottom: 24,
  },
  probe: {
    width: '100%',
    paddingVertical: 8,
    alignItems: 'center',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 20,
  },
  item: {
    marginHorizontal: 20,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
});
