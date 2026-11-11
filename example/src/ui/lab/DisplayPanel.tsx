import type { ReactNode } from 'react';
import { useCallback, useRef, useState } from 'react';
import { StyleSheet, View, type HostInstance } from 'react-native';
import ScreenScrollView from '../kit/ScreenScrollView';
import { ZSText, useDevicePosture, useDisplayFeatures, useTheme, useWindowLayout } from '@0610studio/zs-ui';
import Section from '../kit/Section';
import LabValueRow from './LabValueRow';

const round = (value: number) => Math.round(value * 10) / 10;
const formatRect = ({ x, y, width, height }: { x: number; y: number; width: number; height: number }) =>
  `${round(x)}, ${round(y)} · ${round(width)} × ${round(height)}`;

export default function DisplayPanel({ header }: { header: ReactNode }) {
  const { colors } = useTheme();
  const { fold, occlusions } = useDisplayFeatures();
  const { posture, hingeAngle } = useDevicePosture();
  const { width, height } = useWindowLayout();

  const rootRef = useRef<HostInstance>(null);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const handleLayout = useCallback(() => {
    rootRef.current?.measureInWindow((x, y) => setOrigin({ x, y }));
  }, []);

  const rect = fold?.rect;
  return (
    <>
      <View ref={rootRef} style={styles.flex} onLayout={handleLayout}>
        <ScreenScrollView
          style={{ backgroundColor: colors.surface1 }}
          contentContainerStyle={styles.content}
        >
          {header}
          <Section label="useDisplayFeatures()" gap={0}>
            <LabValueRow label="fold" value={fold ? 'present' : 'none'} testID="lab-display-fold" />
            <LabValueRow label="rect" value={rect ? formatRect(rect) : '-'} testID="lab-display-fold-rect" />
            <LabValueRow label="orientation" value={fold?.orientation ?? '-'} testID="lab-display-fold-orientation" />
            <LabValueRow label="state" value={fold?.state ?? '-'} testID="lab-display-fold-state" />
            <LabValueRow label="active" value={fold ? String(fold.active) : '-'} testID="lab-display-fold-active" />
            <LabValueRow
              label="occlusions"
              value={String(occlusions.length)}
              testID="lab-display-occlusions"
              isLast={occlusions.length === 0}
            />
            {occlusions.map((occlusion, index) => (
              <LabValueRow
                key={index}
                label={`occlusion ${index + 1}`}
                value={`${formatRect(occlusion.rect)}${occlusion.active ? ' · active' : ''}`}
                testID={`lab-display-occlusion-${index + 1}`}
                isLast={index === occlusions.length - 1}
              />
            ))}
          </Section>

          <Section label="useDevicePosture() — 연출 전용" gap={0}>
            <LabValueRow label="posture" value={posture} testID="lab-display-posture" />
            <LabValueRow label="hingeAngle" value={String(hingeAngle)} testID="lab-display-hinge-angle" isLast />
          </Section>

          <ZSText variant="label" color="textSecondary">
            {`창 ${round(width)} × ${round(height)}. 빨간 띠가 접힘선 rect, 파란 테두리가 가림 영역이다. Android 는 FoldingFeature(평평하면 active false, 반쯤 접으면 true), 접힌 커버 화면은 접힘선이 없다. iOS 는 reservedRegions(아이폰 듀오, iOS 27.1 SDK 빌드) — 접힘선 rect 는 터치 대상이 피할 여백(margins)을 포함한다. iOS 자세는 expo-hinge 로 정한다 — 그 밖의 기기·빌드는 null. 자세는 레이아웃 판단에 쓰지 않는다.`}
          </ZSText>
        </ScreenScrollView>

        {rect ? (
          <View
            pointerEvents="none"
            testID="lab-display-fold-line"
            style={[
              styles.line,
              {
                left: rect.x - origin.x - (rect.width < 2 ? 1 : 0),
                top: rect.y - origin.y,
                width: Math.max(rect.width, 2),
                height: Math.max(rect.height, 2),
                backgroundColor: colors.error,
              },
            ]}
          />
        ) : null}
        {occlusions.map((occlusion, index) => (
          <View
            key={index}
            pointerEvents="none"
            testID={`lab-display-occlusion-box-${index + 1}`}
            style={[
              styles.occlusion,
              {
                left: occlusion.rect.x - origin.x,
                top: occlusion.rect.y - origin.y,
                width: occlusion.rect.width,
                height: occlusion.rect.height,
                borderColor: colors.info,
              },
            ]}
          />
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 24,
  },
  line: {
    position: 'absolute',
    opacity: 0.8,
  },
  occlusion: {
    position: 'absolute',
    borderWidth: 2,
  },
});
