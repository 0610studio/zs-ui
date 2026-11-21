import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ZSButton, ZSMenu, ZSSegmentedControl, ZSText, ZSTextField, useDisplayFeatures, useOverlay, useWindowLayout } from '@0610studio/zs-ui';
import { useSheetWidthSetting } from '../../src/model/SheetWidthSetting';
import Section from '../../src/ui/kit/Section';
import LabValueRow from '../../src/ui/lab/LabValueRow';
import { EndMarker, LabPage, labStyles } from '../../src/ui/lab/FoldableLab';

export default function LabOverlayPlacement() {
  const { width, widthClass, readableMaxWidth } = useWindowLayout();
  const { sheetMaxWidth, setSheetMaxWidth } = useSheetWidthSetting();
  const { fold } = useDisplayFeatures();
  const { showAlert, showSnackbar, showBottomSheet, hideBottomSheet } = useOverlay();
  const [closed, setClosed] = useState(0);
  const openSheet = (longList: boolean) => showBottomSheet({
    options: { snapPoints: longList ? ['full'] : undefined, onClose: () => setClosed((count) => count + 1) },
    header: '네이티브 시트',
    component: longList ? <ScrollView keyboardShouldPersistTaps="handled"><SheetContent longList /></ScrollView> : <SheetContent longList={false} />,
    bottomComponent: longList ? <ZSButton title="닫기" fullWidth onPress={hideBottomSheet} testID="lab-overlay-sheet-close" /> : undefined,
  });

  return (
    <LabPage title="시트와 알림">
      <Section label="useWindowLayout() · useDisplayFeatures()" gap={0}>
        <LabValueRow label="width" value={String(Math.round(width))} testID="lab-overlay-width" />
        <LabValueRow label="widthClass" value={widthClass} testID="lab-overlay-width-class" />
        <LabValueRow label="readableMaxWidth" value={String(Math.round(readableMaxWidth))} testID="lab-overlay-readable" />
        <LabValueRow label="fold" value={fold ? `${fold.orientation} x ${Math.round(fold.rect.x * 10) / 10} · ${fold.active ? 'active' : 'flat'}` : 'none'} testID="lab-overlay-fold" isLast />
      </Section>
      <ZSText variant="body2" color="textSecondary">시트를 띄운 채로 접기·펴기·회전을 반복하세요. 입력값이 유지되고 닫힘 횟수는 실제로 닫을 때 한 번만 증가해야 합니다.</ZSText>
      <ZSText variant="subtitle2" testID="lab-overlay-close-count">{`시트 닫힘 ${closed}회`}</ZSText>
      <Section label="OverlayProvider bottomSheetMaxWidth" gap={12}>
        <ZSSegmentedControl
          options={[{ label: '기본', value: 0 }, { label: '500', value: 500 }]}
          value={sheetMaxWidth ?? 0}
          onValueChange={(value) => setSheetMaxWidth(value === 0 ? undefined : value)}
          accessibilityLabel="시트 최대 폭"
          testID="lab-overlay-sheet-max-width"
        />
      </Section>
      <Section label="시스템 오버레이" gap={12}>
        <ZSButton title="Alert" fullWidth testID="lab-overlay-alert" onPress={() => showAlert({ title: '접힘선 확인', message: '폴더블에서도 화면 가운데에 뜬다.', confirm: { label: '닫기' } })} />
        <ZSButton title="BottomSheet" variant="tonal" fullWidth testID="lab-overlay-sheet" onPress={() => openSheet(false)} />
        <ZSButton title="긴 목록 시트" variant="tonal" fullWidth testID="lab-overlay-long-sheet" onPress={() => openSheet(true)} />
        <View style={labStyles.row}>
          <ZSButton title="긴 알림" variant="text" testID="lab-overlay-long-alert" onPress={() => showAlert({ title: '긴 안내문', message: '작은 높이와 큰 글자에서도 마지막 문장과 확인 버튼이 보여야 합니다. '.repeat(12), confirm: { label: '확인' } })} />
          <ZSButton title="Snackbar" variant="text" testID="lab-overlay-snackbar" onPress={() => showSnackbar({ message: '화면 위에 뜬다', duration: 'long' })} />
          <ZSMenu items={[{ key: 'a', label: '첫 번째' }, { key: 'b', label: '두 번째' }]} onSelect={(key) => showAlert({ title: `메뉴 ${key}`, confirm: { label: '확인' } })} testID="lab-overlay-menu">
            <ZSButton title="메뉴" variant="outlined" />
          </ZSMenu>
        </View>
      </Section>
    </LabPage>
  );
}

function SheetContent({ longList }: { longList: boolean }) {
  const { showAlert, hideBottomSheet } = useOverlay();
  const [memo, setMemo] = useState('');
  return (
    <View style={styles.sheet}>
      <ZSText color="textSecondary">iOS는 detent 시트, Android는 M3 ModalBottomSheet(최대 640dp).</ZSText>
      <ZSTextField label="시트 메모" value={memo} onChangeText={setMemo} testID="lab-overlay-memo" />
      <ZSButton title="시트 위 알림" variant="tonal" testID="lab-overlay-sheet-alert" onPress={() => showAlert({ title: '시트 위 알림', message: '알림을 닫아도 메모와 시트가 남아야 합니다.', confirm: { label: '확인' } })} />
      {longList && Array.from({ length: 20 }, (_, index) => <ZSText key={index} variant="body2">{`${index + 1}. 목록을 끝까지 스크롤합니다. 기기 자세를 바꿔도 마지막 항목에 도달할 수 있어야 합니다.`}</ZSText>)}
      {longList && <EndMarker testID="lab-overlay-sheet-end" />}
      {!longList && <ZSButton title="닫기" fullWidth onPress={hideBottomSheet} testID="lab-overlay-sheet-close" />}
    </View>
  );
}

const styles = StyleSheet.create({ sheet: { gap: 12, paddingBottom: 24 } });
