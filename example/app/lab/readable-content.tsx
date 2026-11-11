import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ZSChip, ZSScreen, ZSText, useTheme, useWindowLayout, type ContentMaxWidth } from '@0610studio/zs-ui';
import CtaButton from '../../src/ui/CtaButton';
import ScreenHeader from '../../src/ui/ScreenHeader';

const MODES: { id: string; label: string; value: ContentMaxWidth }[] = [
  { id: 'readable', label: "'readable'", value: 'readable' },
  { id: 'fixed', label: '600', value: 600 },
  { id: 'none', label: "'none'", value: 'none' },
];

const PARAGRAPHS = [
  '넓은 창에서 한 줄이 너무 길면 눈이 다음 줄 시작을 놓친다. iOS 는 readableContentGuide 로, Material\u00a03 는 시트 최대 폭으로 이 길이를 제한한다.',
  'ZSScreen 은 스크롤 뷰를 전폭으로 두고 콘텐츠만 가운데 열로 모은다. 그래서 측면 여백에서도 스크롤되고, 스크롤 인디케이터는 창 가장자리에 붙는다.',
  'compact 창(폰 세로, 일반 iPhone 가로)에서는 제한하지 않는다. 글자 크기를 키우면 iOS 가독 폭도 함께 넓어진다.',
];

export default function LabReadableContent() {
  const { colors } = useTheme();
  const [mode, setMode] = useState(MODES[0]);

  return (
    <>
      <ScreenHeader title="Readable Content" />
      <ZSScreen
        maxContentWidth={mode.value}
        style={{ backgroundColor: colors.surface1 }}
        bottomComponent={
          <View style={styles.cta} testID="lab-readable-cta">
            <CtaButton
              disabled={false}
              primaryButtonText="하단 CTA"
              onPrimaryButtonPress={() => {}}
              backgroundColor={colors.surface1}
            />
          </View>
        }
      >
        <ContentWidthProbe />
        <View style={styles.body}>
          <View style={styles.modes}>
            {MODES.map((item) => (
              <ZSChip
                key={item.id}
                label={item.label}
                selected={item.id === mode.id}
                onSelectedChange={() => setMode(item)}
                testID={`lab-readable-mode-${item.id}`}
              />
            ))}
          </View>
          {PARAGRAPHS.map((text) => (
            <View key={text} style={[styles.paragraph, { backgroundColor: colors.background }]}>
              <ZSText variant="subtitle2">{text}</ZSText>
            </View>
          ))}
        </View>
      </ZSScreen>
    </>
  );
}

function ContentWidthProbe() {
  const { colors } = useTheme();
  const { widthClass, readableMaxWidth } = useWindowLayout();
  const [width, setWidth] = useState(0);

  return (
    <View
      style={[styles.probe, { backgroundColor: colors.primary }]}
      onLayout={(event) => setWidth(Math.round(event.nativeEvent.layout.width))}
    >
      <ZSText variant="subtitle2" style={{ color: colors.background }} testID="lab-readable-content-width">
        {`content ${width}`}
      </ZSText>
      <ZSText variant="overline" style={[styles.probeText, { color: colors.background }]}>
        {`widthClass ${widthClass} · readableMaxWidth ${Math.round(readableMaxWidth)}`}
      </ZSText>
    </View>
  );
}

const styles = StyleSheet.create({
  probe: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 2,
  },
  probeText: {
    textAlign: 'center',
  },
  body: {
    width: '100%',
    padding: 20,
    gap: 12,
  },
  modes: {
    flexDirection: 'row',
    gap: 8,
  },
  paragraph: {
    padding: 16,
    borderRadius: 12,
  },
  cta: {
    paddingTop: 8,
  },
});
