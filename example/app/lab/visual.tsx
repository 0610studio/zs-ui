import { useRef, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { ZSButton, ZSChip, ZSPaneLayout, ZSScreen, ZSText, type ZSScreenRef, useOverlay, usePaneLayout, useTheme } from '@0610studio/zs-ui';
import ScreenHeader from '../../src/ui/ScreenHeader';
import { EndMarker, LiveSize, labStyles } from '../../src/ui/lab/FoldableLab';

const SLIDES = [
  { title: '동물 친구를 만나 보세요', body: '가까운 동물원을 고르고 오늘 만날 수 있는 동물을 확인합니다.' },
  { title: '기기를 접거나 펼쳐도 안내문과 버튼이 함께 보여야 합니다', body: '긴 제목과 여러 줄의 안내문을 사용하는 화면입니다. 글자를 크게 설정하거나 가로로 돌린 뒤에도 마지막 줄까지 스크롤할 수 있어야 합니다. 화면을 접고 펴는 동안 현재 단계가 유지되는지도 확인하세요.' },
  { title: '준비가 끝났습니다', body: '마지막 단계에서도 아래 버튼을 누를 수 있는지 확인합니다. 처음으로 돌아가 같은 순서로 다시 비교하세요.' },
];

export default function LabVisual() {
  const { colors } = useTheme();
  const { showSnackbar } = useOverlay();
  const [mode, setMode] = useState<'qr' | 'tutorial'>('qr');
  const scrollRef = useRef<ZSScreenRef>(null);
  const frameTop = useRef(0);
  const [long, setLong] = useState(false);
  const [flash, setFlash] = useState(false);
  const [slide, setSlide] = useState(0);
  const [footerHeight, setFooterHeight] = useState(0);
  const selectMode = (next: 'qr' | 'tutorial') => {
    setMode(next);
    scrollRef.current?.scrollTo({ y: next === 'qr' ? Math.max(0, frameTop.current - 16) : 0, animated: false });
  };
  const focusFrame = (event: LayoutChangeEvent) => {
    frameTop.current = event.nativeEvent.layout.y;
    scrollRef.current?.scrollTo({ y: Math.max(0, frameTop.current - 16), animated: false });
  };
  const controls = (
    <View style={labStyles.row}>
      <ZSChip label="QR 배치" selected={mode === 'qr'} onSelectedChange={() => selectMode('qr')} testID="lab-visual-mode-qr" />
      <ZSChip label="튜토리얼" selected={mode === 'tutorial'} onSelectedChange={() => selectMode('tutorial')} testID="lab-visual-mode-tutorial" />
      {mode === 'qr' && <ZSChip label="긴 안내" selected={long} onSelectedChange={() => setLong(!long)} testID="lab-visual-long" />}
    </View>
  );
  const footer = (
    <View onLayout={(event) => setFooterHeight(event.nativeEvent.layout.height)} style={[styles.controls, { backgroundColor: colors.surface2 }]} testID="lab-visual-footer">
      {controls}
      {mode === 'qr' ? (
        <View style={labStyles.row}>
          <ZSButton title={flash ? '조명 켜짐' : '조명 꺼짐'} variant="tonal" onPress={() => setFlash(!flash)} testID="lab-visual-flash" />
          <ZSButton title="직접 입력" onPress={() => showSnackbar({ message: '배치 확인용 화면입니다. 카메라와 네트워크를 사용하지 않습니다.' })} testID="lab-visual-action" />
        </View>
      ) : (
        <View style={[labStyles.row, styles.pagination]}>
          <ZSText variant="caption" testID="lab-visual-step">{`${slide + 1} / ${SLIDES.length}`}</ZSText>
          <ZSButton title={slide === SLIDES.length - 1 ? '처음으로' : '다음 안내'} style={{ flex: 1 }} onPress={() => { setSlide((slide + 1) % SLIDES.length); scrollRef.current?.scrollTo({ y: 0, animated: false }); }} testID="lab-visual-next" />
        </View>
      )}
    </View>
  );
  return (
    <>
      <ScreenHeader title="QR과 튜토리얼 배치" />
      <ZSPaneLayout
        backgroundColor={colors.surface1}
        primaryFraction={0.6}
        tabletop
        primary={
          <ZSScreen ref={scrollRef} backgroundColor="surface1" bottomComponent={footer} style={labStyles.content}>
            <LiveSize padded={false} />
            {mode === 'qr' ? (
              <>
                <ZSText variant="h4" emphasized>QR 코드를 맞춰주세요</ZSText>
                <ZSText variant="body2" color="textSecondary">{long ? SLIDES[1].body.repeat(2) : '카메라 없는 배치 미리보기입니다. 접힘선과 스캔창, 아래 버튼을 확인하세요.'}</ZSText>
                <ScanFrame flash={flash} footerHeight={footerHeight} onLayout={focusFrame} />
                <EndMarker testID="lab-visual-end" label="안내문과 스캔창 아래도 스크롤할 수 있어야 합니다." />
              </>
            ) : (
              <>
                <ZSText variant="h3" emphasized testID="lab-visual-title">{SLIDES[slide].title}</ZSText>
                <TutorialIllustration step={slide + 1} footerHeight={footerHeight} />
                <ZSText variant="body1">{SLIDES[slide].body}</ZSText>
                <EndMarker testID="lab-visual-end" />
              </>
            )}
          </ZSScreen>
        }
        secondary={
          <ZSScreen backgroundColor="surface2" style={labStyles.content}>
            <ZSText variant="h4" emphasized>확인할 항목</ZSText>
            {['스캔창 테두리와 안내문이 접힘선·시스템 바에 가려지지 않습니다.', '아래 버튼은 짧은 화면과 큰 글자에서도 누를 수 있습니다.', '회전·접기·펴기로 조명 상태와 튜토리얼 단계가 바뀌지 않습니다.'].map((text) => <ZSText key={text} variant="body2">{text}</ZSText>)}
            <EndMarker label="넓은 창에서는 체크리스트를 따로 스크롤합니다." />
          </ZSScreen>
        }
      />
    </>
  );
}

function ScanFrame({ flash, footerHeight, onLayout }: { flash: boolean; footerHeight: number; onLayout: (event: LayoutChangeEvent) => void }) {
  const { width, height } = usePaneLayout();
  const { colors } = useTheme();
  const size = Math.max(0, Math.min(240, width - 40, height - footerHeight - 32));
  return (
    <View onLayout={onLayout} accessible accessibilityRole="image" accessibilityLabel="카메라 없는 QR 스캔창" testID="lab-visual-frame" style={[styles.frame, { width: size, height: size, borderColor: colors.text, backgroundColor: flash ? colors.primary : colors.surface2 }]}>
      {size >= 80 && <ZSText variant={size < 160 ? 'subtitle2' : 'h4'} emphasized>QR</ZSText>}
      {size >= 180 && <ZSText variant="caption">카메라 미사용</ZSText>}
    </View>
  );
}

function TutorialIllustration({ step, footerHeight }: { step: number; footerHeight: number }) {
  const { height } = usePaneLayout();
  const { colors } = useTheme();
  const available = Math.max(0, Math.min(120, height - footerHeight - 32));
  return (
    <View style={[styles.illustration, { height: available, backgroundColor: colors.primary }]}>
      {available >= 60 && <ZSText variant="h1" emphasized color="onPrimary" maxFontSizeMultiplier={1}>{step}</ZSText>}
    </View>
  );
}

const styles = StyleSheet.create({
  controls: { padding: 12, gap: 8 },
  frame: { alignSelf: 'center', borderWidth: 3, borderRadius: 20, alignItems: 'center', justifyContent: 'center', gap: 8 },
  pagination: { alignItems: 'center' },
  illustration: { borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
});
