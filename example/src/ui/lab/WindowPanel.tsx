import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import ScreenScrollView from '../kit/ScreenScrollView';
import { ZSText, useTheme, useWindowLayout } from '@0610studio/zs-ui';
import Section from '../kit/Section';
import LabValueRow from './LabValueRow';

export default function WindowPanel({ header }: { header: ReactNode }) {
  const { colors } = useTheme();
  const layout = useWindowLayout();
  const { platform } = layout;

  return (
    <>
      <ScreenScrollView
        style={{ backgroundColor: colors.surface1 }}
        contentContainerStyle={styles.content}
      >
        {header}
          <Section label="useWindowLayout()" gap={0}>
          <LabValueRow label="widthClass" value={layout.widthClass} testID="lab-window-layout-width-class" />
          <LabValueRow label="heightClass" value={layout.heightClass} testID="lab-window-layout-height-class" />
          <LabValueRow label="size" value={`${Math.round(layout.width)} × ${Math.round(layout.height)}`} testID="lab-window-layout-size" />
          <LabValueRow label="orientation" value={layout.orientation} testID="lab-window-layout-orientation" />
          <LabValueRow label="measured" value={String(layout.measured)} testID="lab-window-layout-measured" />
          <LabValueRow label="readableMaxWidth" value={String(Math.round(layout.readableMaxWidth))} testID="lab-window-layout-readable" isLast />
        </Section>

        <Section label="플랫폼" gap={0}>
          <LabValueRow label="os" value={platform.os} testID="lab-window-layout-os" />
          {platform.os === 'android' && (
            <>
              <LabValueRow
                label="WindowSizeClass.minWidthDp"
                value={String(platform.windowSizeClass?.minWidthDp ?? null)}
                testID="lab-window-layout-min-width-dp"
              />
              <LabValueRow
                label="WindowSizeClass.minHeightDp"
                value={String(platform.windowSizeClass?.minHeightDp ?? null)}
                testID="lab-window-layout-min-height-dp"
                isLast
              />
            </>
          )}
          {platform.os === 'ios' && (
            <>
              <LabValueRow label="horizontalSizeClass" value={String(platform.horizontalSizeClass)} testID="lab-window-layout-h-size-class" />
              <LabValueRow label="verticalSizeClass" value={String(platform.verticalSizeClass)} testID="lab-window-layout-v-size-class" isLast />
            </>
          )}
        </Section>

        <ZSText variant="label" color="textSecondary">
          iOS 는 compact/비compact 경계를 size class trait 로 정한다. 일반 iPhone 가로(약 874pt)는 폭과 무관하게 compact 이고, Pro Max 가로·iPad 는 regular 다.
          Android 는 androidx.window WindowSizeClass(창 WindowMetrics 기준)를 그대로 쓴다.
        </ZSText>
      </ScreenScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 24,
  },
});
