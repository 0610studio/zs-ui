import { Platform } from 'react-native';
import { useVerticalBarEdgeIOS } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWindowLayout } from '@0610studio/zs-ui';
import Section from '../kit/Section';
import LabValueRow from '../lab/LabValueRow';
import { useBarAxisSetting } from '../../model/BarAxisSetting';

export default function BarAxisReadout({ testIDPrefix, label = 'LayoutProvider barAxis' }: { testIDPrefix: string; label?: string }) {
  const { barAxis } = useBarAxisSetting();
  const insets = useSafeAreaInsets();
  const layout = useWindowLayout();

  return (
    <Section label={label} gap={0}>
      <LabValueRow label="barAxis" value={barAxis} testID={`${testIDPrefix}-value`} />
      {Platform.OS === 'ios' ? <VerticalBarEdgeRow testID={`${testIDPrefix}-edge`} /> : null}
      <LabValueRow
        label="safe area (top/end/bottom/start)"
        value={[insets.top, insets.right, insets.bottom, insets.left].map(Math.round).join('/')}
        testID={`${testIDPrefix}-insets`}
      />
      <LabValueRow
        label="window"
        value={`${Math.round(layout.width)} × ${Math.round(layout.height)} · ${layout.widthClass}/${layout.heightClass}`}
        testID={`${testIDPrefix}-window`}
        isLast
      />
    </Section>
  );
}

function VerticalBarEdgeRow({ testID }: { testID: string }) {
  const edge = useVerticalBarEdgeIOS();
  return <LabValueRow label="verticalBarEdge" value={edge ?? 'none'} testID={testID} />;
}
