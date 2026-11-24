import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ZSButton, ZSScreen, ZSText, ZSTextField, useOverlay } from '@0610studio/zs-ui';
import MyBottomSheet from '../src/ui/MyBottomSheet';
import PeriodFields from '../src/ui/overlay/PeriodFields';
import Section from '../src/ui/kit/Section';
import DemoRow from '../src/ui/kit/DemoRow';
import { GAP, PAGE_CONTENT } from '../src/ui/kit/layout';
import { router } from 'expo-router';
import ScreenHeader from '../src/ui/ScreenHeader';

const SHEET_ROWS = Array.from({ length: 30 }, (_, index) => index + 1);

export default function OverlayExample() {
  const { showAlert, showSnackbar, showBottomSheet, hideBottomSheet, showLoader, hideLoader } = useOverlay();

  const handleShowLoader = () => {
    showLoader({ accessibilityLabel: '저장하는 중' });
    setTimeout(hideLoader, 4000);
  };

  const handleShowProgressLoader = () => {
    const steps = 20;
    showLoader({ accessibilityLabel: '압축하는 중', progress: 0 });
    for (let step = 1; step <= steps; step += 1) {
      setTimeout(() => showLoader({ accessibilityLabel: '압축하는 중', progress: step / steps }), step * 250);
    }
    setTimeout(hideLoader, steps * 250 + 600);
  };

  return (
    <>
      <ScreenHeader title="Overlay" />
      <ZSScreen backgroundColor="background" style={styles.container}>
        <Section label="Alert · 대화상자" surface="list">
          <DemoRow
            title="showAlert · 확인·취소"
            caption="저장하면 스낵바로 알린다"
            testID="overlay-alert-confirm"
            onPress={() =>
              showAlert({
                title: '변경 내용을 저장할까요?',
                message: '저장하지 않으면 입력한 내용이 사라집니다.',
                confirm: { label: '저장', onPress: () => showSnackbar({ message: '저장했습니다', type: 'success' }) },
                cancel: { label: '취소' },
              })
            }
          />
          <DemoRow
            title="showAlert · 파괴 동작"
            caption="destructive + 취소(HIG)"
            destructive
            testID="overlay-alert-destructive"
            onPress={() =>
              showAlert({
                title: '기록을 삭제할까요?',
                message: '삭제한 기록은 되돌릴 수 없습니다.',
                confirm: { label: '삭제', destructive: true },
                cancel: { label: '취소' },
              })
            }
          />
          <DemoRow
            title="showAlert · 바깥 탭으로 닫기"
            caption="dismissible — 기본은 버튼·뒤로가기로만 닫힌다"
            testID="overlay-alert-dismissible"
            onPress={() =>
              showAlert({
                title: '바깥을 눌러 닫을 수 있어요',
                confirm: { label: '확인' },
                dismissible: true,
              })
            }
          />
        </Section>

        <Section label="Snackbar · 짧은 알림(화면 위, 최대 3개)" surface="plain" gap={GAP.md}>
          <ZSButton title="showSnackbar" variant="tonal" testID="overlay-snackbar" onPress={() => showSnackbar({ message: `저장했습니다 ${new Date().toLocaleTimeString()}` })} />
          <View style={styles.row}>
            <ZSButton title="success" variant="outlined" color="success" testID="overlay-snackbar-success" style={styles.rowButton} onPress={() => showSnackbar({ message: '업로드를 마쳤습니다', type: 'success' })} />
            <ZSButton title="error" variant="outlined" color="error" testID="overlay-snackbar-error" style={styles.rowButton} onPress={() => showSnackbar({ message: '보내지 못했습니다', type: 'error' })} />
          </View>
          <ZSButton
            title="showSnackbar · 실행 취소"
            variant="outlined"
            testID="overlay-snackbar-action"
            onPress={() => showSnackbar({ message: '기록을 보관했습니다', action: { label: '실행 취소', onPress: () => showSnackbar({ message: '되돌렸습니다' }) } })}
          />
        </Section>

        <Section label="BottomSheet · 시스템 시트" surface="list">
          <DemoRow
            title="showBottomSheet · 콘텐츠 높이"
            caption="높이를 콘텐츠에 맞춤 · 끌어내리기·바깥 탭으로 닫기"
            testID="overlay-sheet-fit"
            onPress={() =>
              showBottomSheet({
                header: '헤더 컴포넌트1',
                component: (
                  <View style={{ gap: 12, paddingBottom: 24 }}>
                    <ZSText color="textSecondary">시트 높이는 이 내용에 맞춰진다. 헤더 줄을 끌어도 시트가 움직인다.</ZSText>
                  </View>
                ),
              })
            }
          />
          <DemoRow
            title="showBottomSheet · 절반·전체"
            caption="snapPoints ['half', 'full'] · 헤더 끌기 + 오른쪽 버튼 · 입력 + 시트 위 대화상자·스낵바·진행 표시"
            testID="overlay-sheet-snap"
            onPress={() =>
              showBottomSheet({
                options: { snapPoints: ['half', 'full'] },
                header: '프로필',
                headerRight: <ZSButton title="닫기" variant="text" size="small" onPress={hideBottomSheet} testID="sheet-header-close" />,
                component: <MyBottomSheet />,
              })
            }
          />
          <DemoRow
            title="bottomComponent · 콘텐츠 높이"
            caption="본문 아래 고정 버튼 · 입력하면 키보드 위로"
            testID="overlay-sheet-bottom-fit"
            onPress={() =>
              showBottomSheet({
                header: '메모 남기기',
                component: (
                  <View style={{ gap: 12 }}>
                    <ZSTextField label="메모" defaultValue="" testID="sheet-bottom-memo" />
                  </View>
                ),
                bottomComponent: <ZSButton title="저장" fullWidth onPress={hideBottomSheet} testID="overlay-sheet-cta" />,
              })
            }
          />
          <DemoRow
            title="bottomComponent · 절반·전체"
            caption="긴 목록은 본문 안에서 스크롤 · 버튼은 시트 바닥에 고정"
            testID="overlay-sheet-bottom-snap"
            onPress={() =>
              showBottomSheet({
                options: { snapPoints: ['half', 'full'] },
                header: '지역 선택',
                component: (
                  <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 12 }} testID="sheet-bottom-list">
                    {SHEET_ROWS.map((row) => (
                      <ZSText key={row}>{`지역 ${row}`}</ZSText>
                    ))}
                  </ScrollView>
                ),
                bottomComponent: <ZSButton title="선택 완료" fullWidth onPress={hideBottomSheet} testID="overlay-sheet-cta" />,
              })
            }
          />
          <DemoRow
            title="showBottomSheet · dismissible false"
            caption="제스처·바깥 탭으로 닫히지 않음 (버튼으로만 닫기)"
            testID="overlay-sheet-locked"
            onPress={() =>
              showBottomSheet({
                options: {
                  dismissible: false,
                  onClose: () => showAlert({ title: 'onClose 발화', confirm: { label: '확인' } }),
                },
                header: 'dismissible false 시트',
                component: (
                  <View style={{ gap: 16, paddingBottom: 24 }}>
                    <ZSButton title="시트 닫기" fullWidth onPress={hideBottomSheet} testID="overlay-sheet-close" />
                  </View>
                ),
              })
            }
          />
        </Section>

        <Section label="시트 겹치기 · 라우트 위 시트" surface="list">
          <DemoRow
            title="전체 높이 시트 위 날짜 시트"
            caption="snapPoints ['full'] · 시작일을 누르면 날짜 시트가 위에 뜨고, 닫으면 입력이 남은 채 돌아온다"
            testID="overlay-sheet-stack"
            onPress={() =>
              showBottomSheet({
                options: { snapPoints: ['full'] },
                header: '기록 검색',
                component: <StackedSearchForm />,
                bottomComponent: <ZSButton title="검색" fullWidth onPress={hideBottomSheet} testID="overlay-sheet-stack-submit" />,
              })
            }
          />
          <DemoRow title="presentation: formSheet" caption="라우터로 여는 입력 폼 · 날짜 칸은 시트를 위에 띄운다" testID="open-form-sheet" onPress={() => router.push('/FormSheetDemo')} />
          <DemoRow title="presentation: modal" caption="모달 라우트 위 날짜 시트 · 모달은 그대로 남는다" testID="open-modal-sheet" onPress={() => router.push('/ModalSheetDemo')} />
        </Section>

        <Section label="Loader · 작업 진행 상태" surface="list">
          <DemoRow title="showLoader" caption="4초 뒤 hideLoader · Android M3 LoadingIndicator" onPress={handleShowLoader} testID="overlay-loader" />
          <DemoRow title="showLoader · progress" caption="5초 동안 0→100% 막대·백분율 뒤 hideLoader" onPress={handleShowProgressLoader} testID="overlay-loader-progress" />
        </Section>
      </ZSScreen>
    </>
  );
}

/** 전체 높이 시트 본문 — 검색어는 이 시트에 남고, 날짜 칸은 날짜 시트를 위에 겹친다 */
function StackedSearchForm() {
  const [query, setQuery] = useState('');
  return (
    <View style={styles.stackForm}>
      <ZSTextField label="검색어" value={query} onChangeText={setQuery} testID="overlay-sheet-stack-query" />
      <PeriodFields testID="overlay-sheet-stack-period" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: PAGE_CONTENT,
  stackForm: { gap: GAP.lg, paddingBottom: GAP.lg },
  row: { flexDirection: 'row', gap: GAP.md },
  rowButton: { flex: 1 },
});
