import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { router, type Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ZSButton, ZSPressable, ZSText, useBarAxis, useDevicePosture, useTheme, useWindowLayout } from '@0610studio/zs-ui';
import { LabPage } from '../../src/ui/lab/FoldableLab';
import Section from '../../src/ui/kit/Section';

type Unit = { id: string; title: string; caption: string; href: Href };
const SCENARIOS: Unit[] = [
  { id: 'tabs-stack', title: '탭과 스크롤 끝', caption: '탭·Stack · 마지막 카드 · 횟수와 메모 유지', href: '/lab/tabs-stack' },
  { id: 'keyboard', title: '입력과 키보드', caption: '일반·비밀번호·숫자 입력 · 오류 안내 · 고정 버튼', href: '/lab/keyboard' },
  { id: 'overlay-placement', title: '시트와 알림', caption: '입력·긴 목록 · 시트 위 알림 · 닫힘 콜백', href: '/lab/overlay-placement' },
  { id: 'visual', title: 'QR과 튜토리얼 배치', caption: '카메라 없는 스캔창 · 긴 설명 · 작은 높이의 버튼', href: '/lab/visual' },
  { id: 'pane-layout', title: '목록과 상세 2단', caption: '접힘선 회피 · hide/stack · 선택 항목과 메모', href: '/lab/pane-layout' },
];
const DIAGNOSTICS: Unit[] = [
  { id: 'safe-area', title: 'Safe Area', caption: 'ZSScreen 영역별 자동 inset', href: '/lab/safe-area' },
  { id: 'readable-content', title: 'Readable Content', caption: 'maxContentWidth · 가독 폭 가운데 열', href: '/lab/readable-content' },
  { id: 'bar-axis', title: '바 방향', caption: '세로·가로 배치 전환 · iOS 세로 바 · Android 바·레일', href: '/lab/bar-axis' },
  { id: 'navigation-bar', title: '내비게이션 바', caption: 'Android 바 뒤 페이드 · 어두운 면 화면의 흰 버튼', href: '/lab/navigation-bar' },
  { id: 'top-bar', title: '상단 바', caption: 'ZSTopBar · 시계 옆 칸(iPhone Duo) · safeArea · 여백 색 표시', href: '/lab/top-bar' },
  { id: 'zs-tab-navigator', title: '탭 옵션과 아이콘', caption: '이미지·심볼 · 뱃지 · 검색 탭 · bottom accessory', href: '/lab/zs-tab-navigator' },
  { id: 'sidebar-tabs', title: 'iOS 사이드바 탭', caption: 'preferredPlacement · 사이드바 다시 열기', href: '/lab/sidebar-tabs' },
  { id: 'text-field-metrics', title: 'TextField Metrics', caption: '라벨 배치 · 글자 크기와 밀도별 측정', href: '/lab/text-field-metrics' },
  { id: 'arrangement', title: 'Arrangement (iOS 27.1)', caption: 'ArrangementView · RNHostView 2-pane PoC', href: '/lab/arrangement' },
];

export default function LabIndex() {
  return <LabPage title="2.0 Lab"><Overview /></LabPage>;
}

function Overview() {
  const layout = useWindowLayout();
  const { posture } = useDevicePosture();
  const insets = useSafeAreaInsets();
  const { fontScale } = useWindowDimensions();
  const [axis] = useBarAxis();
  const nextId = useRef(0);
  const [history, setHistory] = useState<{ id: number; time: string; value: string }[]>([]);
  const snapshot = `${Math.round(layout.width)}×${Math.round(layout.height)} · ${layout.widthClass}/${layout.heightClass} · ${posture} · ${axis} · inset ${[insets.top, insets.right, insets.bottom, insets.left].map(Math.round).join('/')} · 글자 ${fontScale.toFixed(2)}`;
  useEffect(() => {
    const entry = { id: nextId.current++, time: new Date().toLocaleTimeString(), value: snapshot };
    setHistory((previous) => previous[0]?.value === snapshot ? previous : [entry, ...previous].slice(0, 8));
  }, [snapshot]);

  return (
    <>
      <ZSText variant="h4" emphasized>폴드 · 듀오 검증</ZSText>
      <ZSText variant="body2" color="textSecondary">화면을 연 채로 접기·펴기·회전을 반복하세요. 입력과 선택값, 스크롤 끝, 키보드·시트의 버튼이 유지되는지 확인합니다.</ZSText>
      <LabCard unit={{ id: 'environment', title: '기기 측정·환경', caption: '버전 · 창 크기 · 크기 클래스 · 접힘선 · 힌지 · 테마', href: '/lab/environment' }} />
      <Section label="최근 크기 변경 · 최대 8개" gap={8}>
        <ZSText variant="caption" color="textSecondary" testID="foldable-history-count">{`기록 ${history.length}개`}</ZSText>
        {history.map((entry) => <ZSText key={entry.id} variant="caption" selectable>{`${entry.time}  ${entry.value}`}</ZSText>)}
        <ZSButton title="변경 기록 비우기" variant="text" onPress={() => setHistory([])} testID="foldable-history-clear" />
      </Section>
      <ZSText variant="subtitle1" emphasized>실사용 시나리오</ZSText>
      {SCENARIOS.map((unit) => <LabCard key={unit.id} unit={unit} />)}
      <ZSText variant="subtitle1" emphasized>API 상세 검증</ZSText>
      {DIAGNOSTICS.map((unit) => <LabCard key={unit.id} unit={unit} />)}
    </>
  );
}

function LabCard({ unit }: { unit: Unit }) {
  const { colors } = useTheme();
  return (
    <ZSPressable onPress={() => router.push(unit.href)} testID={`lab-${unit.id}-card`} accessibilityRole="button" accessibilityLabel={`${unit.title}: ${unit.caption}`} backgroundColor="surface2" style={styles.card}>
      <View style={styles.text}>
        <ZSText variant="subtitle1">{unit.title}</ZSText>
        <ZSText variant="label" color="textSecondary">{unit.caption}</ZSText>
      </View>
      <ZSText variant="h4" emphasized style={{ color: colors.borderStrong }}>›</ZSText>
    </ZSPressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 16 },
  text: { flex: 1, gap: 4 },
});
