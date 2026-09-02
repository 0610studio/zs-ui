import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  ZSBlockButton,
  ZSChip,
  ZSContainer,
  ZSDropdown,
  ZSMessageBar,
  ZSSegmented,
  ZSSwitch,
  ZSTab,
  ZSText,
  ZSView,
  useOverlay,
  useStyleSheetCreate,
  type Theme,
  type ZSTabItem,
} from '@0610studio/zs-ui';

const LIB_VERSION: string = require('@0610studio/zs-ui/package.json').version;

const WEB_TAB_ITEMS: ZSTabItem[] = [
  { value: 'components', label: '컴포넌트' },
  { value: 'interaction', label: '상호작용' },
  { value: 'responsive', label: '반응형' },
];

const VIEWPORT_OPTIONS = ['모바일 · 390px', '태블릿 · 768px', '데스크톱 · 1440px'];
const CONTENT_MAX_WIDTH = 1120;

type DemoPanelProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  testID: string;
};

const createStyles = (palette: Theme) =>
  StyleSheet.create({
    page: {
      backgroundColor: palette.background.layer2,
    },
    content: {
      width: '100%',
      maxWidth: CONTENT_MAX_WIDTH,
      alignSelf: 'center',
      gap: 24,
      paddingHorizontal: 20,
      paddingTop: 28,
      paddingBottom: 64,
    },
    intro: {
      width: '100%',
      gap: 12,
      paddingVertical: 8,
    },
    eyebrow: {
      letterSpacing: 1.4,
      color: palette.mode === 'dark' ? palette.primary[30] : palette.primary[90],
    },
    introTitle: {
      maxWidth: 720,
    },
    introDescription: {
      maxWidth: 760,
      color: palette.mode === 'dark' ? palette.grey[80] : palette.grey[70],
    },
    statusRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 8,
    },
    statusBadge: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: palette.success[30],
      backgroundColor: palette.success[10],
      paddingHorizontal: 12,
      paddingVertical: 7,
    },
    statusText: {
      color: palette.success[90],
    },
    grid: {
      width: '100%',
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
    },
    column: {
      flexBasis: 340,
      flexGrow: 1,
      flexShrink: 1,
      minWidth: 0,
      gap: 16,
    },
    panel: {
      width: '100%',
      borderRadius: 18,
      borderWidth: 1,
      borderColor: palette.grey[20],
      padding: 20,
      gap: 16,
    },
    panelHeading: {
      gap: 5,
    },
    panelEyebrow: {
      letterSpacing: 1.2,
      color: palette.mode === 'dark' ? palette.primary[30] : palette.primary[90],
    },
    panelDescription: {
      color: palette.mode === 'dark' ? palette.grey[80] : palette.grey[70],
    },
    metaText: {
      color: palette.mode === 'dark' ? palette.grey[80] : palette.grey[70],
    },
    controlGroup: {
      width: '100%',
      gap: 12,
    },
    result: {
      minHeight: 48,
      justifyContent: 'center',
      borderRadius: 12,
      backgroundColor: palette.background.layer2,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    inlineControls: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 12,
    },
    switchRow: {
      flex: 1,
      minWidth: 180,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      borderRadius: 12,
      backgroundColor: palette.background.layer2,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    sheet: {
      width: '100%',
      paddingHorizontal: 20,
      paddingBottom: 12,
    },
    sheetOption: {
      minHeight: 48,
      justifyContent: 'center',
      borderBottomWidth: 1,
      borderBottomColor: palette.grey[20],
    },
    buttonRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
  });

function DemoPanel({ eyebrow, title, description, children, testID }: DemoPanelProps) {
  const styles = useStyleSheetCreate(createStyles);

  return (
    <ZSView color="base" elevationLevel={1} style={styles.panel} testID={testID}>
      <View style={styles.panelHeading}>
        <ZSText typo="caption.2" style={styles.panelEyebrow}>
          {eyebrow.toUpperCase()}
        </ZSText>
        <ZSText typo="title.3" accessibilityRole="header">
          {title}
        </ZSText>
        <ZSText typo="body.4" style={styles.panelDescription}>
          {description}
        </ZSText>
      </View>
      {children}
    </ZSView>
  );
}

export default function WebExampleScreen() {
  const styles = useStyleSheetCreate(createStyles);
  const { showAlert, showBottomSheet, hideOverlay } = useOverlay();
  const [activeTab, setActiveTab] = useState('components');
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [isChipSelected, setIsChipSelected] = useState(false);
  const [isSwitchActive, setIsSwitchActive] = useState(true);
  const [selectedViewport, setSelectedViewport] = useState(VIEWPORT_OPTIONS[0]);
  const [isNoticeVisible, setIsNoticeVisible] = useState(true);

  const openViewportSelector = () => {
    showBottomSheet({
      options: { height: 'auto' },
      headerComponent: (
        <ZSText typo="title.4" style={{ textAlign: 'center', paddingBottom: 12 }}>
          기준 화면 선택
        </ZSText>
      ),
      component: (
        <View style={styles.sheet}>
          {VIEWPORT_OPTIONS.map((option, optionIndex) => (
            <Pressable
              key={option}
              testID={`web-viewport-option-${optionIndex}`}
              accessibilityRole="button"
              accessibilityLabel={option}
              style={styles.sheetOption}
              onPress={() => {
                setSelectedViewport(option);
                hideOverlay('bottomSheet');
              }}
            >
              <ZSText typo="body.2">{option}</ZSText>
            </Pressable>
          ))}
        </View>
      ),
    });
  };

  return (
    <ZSContainer style={styles.page} testID="web-example-page">
      <View style={styles.content} testID="web-example-content">
        <View style={styles.intro}>
          <ZSText typo="caption.1" style={styles.eyebrow}>
            LOCAL WEB PLAYGROUND
          </ZSText>
          <ZSText typo="heading.2" style={styles.introTitle} accessibilityRole="header">
            배포 전에 웹 동작을 직접 확인하세요
          </ZSText>
          <ZSText typo="body.2" style={styles.introDescription}>
            이 화면은 npm 배포본이 아니라 현재 저장소의 zs-ui 소스를 직접 사용합니다. 모바일과 데스크톱 레이아웃, 테마 전환, 선택 상태와 오버레이를 한곳에서 검증합니다.
          </ZSText>
          <View style={styles.statusRow}>
            <View style={styles.statusBadge}>
              <ZSText typo="label.4" style={styles.statusText}>LOCAL SOURCE</ZSText>
            </View>
            <ZSText typo="caption.1" style={styles.metaText}>{`Expo Web · React Native Web · ${LIB_VERSION}`}</ZSText>
          </View>
        </View>

        <View style={styles.grid} testID="web-example-grid">
          <View style={styles.column} testID="web-example-column-primary">
            <DemoPanel
              eyebrow="Navigation"
              title="탭 상태"
              description="동일한 선택 API가 웹 클릭과 키보드 포커스에서도 유지되는지 확인합니다."
              testID="web-panel-tabs"
            >
              <View style={styles.controlGroup}>
                <ZSTab items={WEB_TAB_ITEMS} value={activeTab} onChange={setActiveTab} testID="web-tabs" />
                <View style={styles.result}>
                  <ZSText typo="body.3" testID="web-tab-result">선택된 탭: {activeTab}</ZSText>
                </View>
              </View>
            </DemoPanel>

            <DemoPanel
              eyebrow="Feedback"
              title="상태 메시지"
              description="긴 문장, 액션, 닫기 상태가 좁은 화면에서 넘치지 않는지 확인합니다."
              testID="web-panel-message"
            >
              <View style={styles.controlGroup}>
                <ZSMessageBar
                  intent="information"
                  title="웹 레이아웃 검증 중"
                  message="현재 저장소 소스로 렌더링된 화면입니다. 배포 전 상호작용과 반응형 레이아웃을 확인할 수 있습니다."
                  actionLabel="확인 완료"
                  showClose
                  visible={isNoticeVisible}
                  onAction={() => setIsNoticeVisible(false)}
                  onClose={() => setIsNoticeVisible(false)}
                />
                {!isNoticeVisible && (
                  <ZSBlockButton
                    title="메시지 다시 열기"
                    typo="label.3"
                    variant="stroke"
                    onPress={() => setIsNoticeVisible(true)}
                    testID="web-message-reset"
                    accessibilityRole="button"
                  />
                )}
              </View>
            </DemoPanel>
          </View>

          <View style={styles.column} testID="web-example-column-secondary">
            <DemoPanel
              eyebrow="Selection"
              title="선택 컴포넌트"
              description="세그먼트, 칩, 스위치의 제어 상태와 시각 피드백을 함께 검증합니다."
              testID="web-panel-selection"
            >
              <View style={styles.controlGroup}>
                <ZSSegmented
                  options={['기본', '상호작용', '레이아웃']}
                  selectedIndex={segmentIndex}
                  onChange={setSegmentIndex}
                  testID="web-segmented"
                />
                <View style={styles.inlineControls}>
                  <ZSChip
                    label="웹 호환"
                    selected={isChipSelected}
                    onChange={setIsChipSelected}
                    checkIcon
                    testID="web-chip"
                  />
                  <View style={styles.switchRow}>
                    <ZSText typo="body.3">애니메이션</ZSText>
                    <ZSSwitch
                      isActive={isSwitchActive}
                      onToggle={() => setIsSwitchActive(current => !current)}
                      testID="web-switch"
                      accessibilityLabel="애니메이션 사용"
                    />
                  </View>
                </View>
                <View style={styles.result}>
                  <ZSText typo="body.3" testID="web-selection-result">
                    세그먼트 {segmentIndex + 1} · 칩 {isChipSelected ? '선택' : '해제'} · 스위치 {isSwitchActive ? '켜짐' : '꺼짐'}
                  </ZSText>
                </View>
              </View>
            </DemoPanel>

            <DemoPanel
              eyebrow="Overlay"
              title="웹 오버레이"
              description="선택 시트와 확인 Alert가 브라우저에서도 정상적으로 열리고 닫히는지 확인합니다."
              testID="web-panel-overlay"
            >
              <View style={styles.controlGroup}>
                <ZSDropdown
                  label="기준 화면"
                  value={selectedViewport}
                  onPress={openViewportSelector}
                  textInputProps={{ accessibilityLabel: '기준 화면' }}
                />
                <View style={styles.buttonRow}>
                  <ZSBlockButton
                    title="확인 Alert 열기"
                    typo="label.3"
                    onPress={() =>
                      showAlert({
                        title: '웹 동작 확인',
                        informative: 'Alert가 로컬 웹 빌드에서 정상적으로 열렸습니다.',
                        actions: {
                          primary: { label: '확인' },
                          secondary: { label: '취소' },
                        },
                      })
                    }
                    testID="web-alert-trigger"
                    accessibilityRole="button"
                  />
                </View>
                <View style={styles.result}>
                  <ZSText typo="body.3" testID="web-viewport-result">선택 화면: {selectedViewport}</ZSText>
                </View>
              </View>
            </DemoPanel>
          </View>
        </View>
      </View>
    </ZSContainer>
  );
}
