import { useContext, useLayoutEffect } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Alert, BackHandler, Platform, StyleSheet, Text } from 'react-native';
import type { OverlayContextProps } from '../../model/types';
import { mockSheetHide } from '../__mocks__/expo-ui-jetpack-compose';
import { DURATION } from '../../theme/motion';
import { getTestTheme } from '../utils/theme';
import { getByHostType, queryAllByHostType } from '../utils/hostQueries';

jest.mock('../../context/ThemeContext', () => require('../utils/theme').mockThemeModule());

(Platform as { OS: string }).OS = 'android';
const { OverlayProvider }: typeof import('../../context/OverlayContext') = require('../../context/OverlayContext');
const { useOverlay }: typeof import('../../model/useOverlay') = require('../../model/useOverlay');
const { VeilTargetContext }: typeof import('../../overlay/veil') = require('../../overlay/veil');
const { ZSPortal }: typeof import('../../overlay/ZSPortal') = require('../../overlay/ZSPortal');

const pressBack = () => (BackHandler as unknown as { mockPressBack: () => boolean }).mockPressBack();

let overlay: OverlayContextProps;
function Capture() {
  overlay = useOverlay();
  return null;
}

const renderProvider = () =>
  render(
    <OverlayProvider>
      <Capture />
    </OverlayProvider>,
  );

const dialogs = () => queryAllByHostType('Modal');
const sheet = () => getByHostType('ModalBottomSheet');

describe('OverlayProvider (Android)', () => {
  const { colors } = getTestTheme();

  afterAll(() => {
    (Platform as { OS: string }).OS = 'ios';
  });

  it('bottomSheetMaxWidth 를 시트 폭으로 넘긴다', async () => {
    await render(
      <OverlayProvider bottomSheetMaxWidth={500}>
        <Capture />
      </OverlayProvider>,
    );
    await act(() => overlay.showBottomSheet({ component: <Text>시트</Text> }));
    expect(sheet().props.modifiers).toEqual([{ $type: 'width', args: [500] }]);
  });

  it('아무것도 없을 때는 back 을 가로채지 않는다', async () => {
    await renderProvider();
    expect(dialogs()).toHaveLength(0);
    expect(pressBack()).toBe(false);
  });

  describe('showAlert — iOS 와 같은 zs-ui 대화상자', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('Compose 다이얼로그가 아니라 같은 대화상자를 띄우고, 버튼을 누르면 닫힌 뒤 onPress 를 부른다', async () => {
      const onConfirm = jest.fn();
      await renderProvider();
      await act(() => overlay.showAlert({ title: '저장할까요?', confirm: { label: '저장', onPress: onConfirm } }));
      expect(Alert.alert).not.toHaveBeenCalled();
      expect(queryAllByHostType('AlertDialog')).toHaveLength(0);
      expect(screen.getByTestId('zs-alert')).toBeTruthy();
      await fireEvent.press(screen.getByTestId('zs-alert-confirm'));
      await act(() => jest.advanceTimersByTime(DURATION.fast));
      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(dialogs()).toHaveLength(0);
    });

    it('back 은 대화상자 창(onRequestClose)이 받는다 — provider 는 가로채지 않는다', async () => {
      await renderProvider();
      await act(() => overlay.showAlert({ title: '안내', confirm: { label: '확인' } }));
      expect(pressBack()).toBe(false);
      expect(getByHostType('Modal').props.onRequestClose).toEqual(expect.any(Function));
    });

    it('시트 위 대화상자를 back 으로 닫으면 시트는 남고, 다음 back 이 시트를 닫는다', async () => {
      const onCancel = jest.fn();
      await renderProvider();
      await act(() => overlay.showBottomSheet({ component: <Text>시트</Text> }));
      await act(() => overlay.showAlert({ title: '닫을까요?', confirm: { label: '닫기' }, cancel: { label: '취소', onPress: onCancel } }));
      await act(() => getByHostType('Modal').props.onRequestClose());
      await act(() => jest.advanceTimersByTime(DURATION.fast));
      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(dialogs()).toHaveLength(0);
      expect(queryAllByHostType('ModalBottomSheet')).toHaveLength(1);
      let consumed = false;
      await act(() => {
        consumed = pressBack();
      });
      expect(consumed).toBe(true);
    });
  });

  describe('showBottomSheet — M3 ModalBottomSheet', () => {
    const sheets = () => queryAllByHostType('ModalBottomSheet');
    const settle = () => act(async () => {});

    it('시트가 열린 채 다시 부르면 새 시트를 위에 겹치고, back 은 맨 위 시트만 닫는다', async () => {
      const first = jest.fn();
      const second = jest.fn();
      await renderProvider();
      await act(() => overlay.showBottomSheet({ component: <Text>검색</Text>, options: { snapPoints: ['full'], onClose: first } }));
      await act(() => overlay.showBottomSheet({ component: <Text>날짜</Text>, options: { onClose: second } }));
      expect(sheets()).toHaveLength(2);
      expect(screen.getByText('검색')).toBeTruthy();
      expect(screen.getByText('날짜')).toBeTruthy();
      mockSheetHide.mockClear();
      await act(() => {
        expect(pressBack()).toBe(true);
      });
      expect(mockSheetHide).toHaveBeenCalledTimes(1);
      await settle();
      expect(sheets()).toHaveLength(1);
      expect(screen.getByText('검색')).toBeTruthy();
      expect(second).toHaveBeenCalledTimes(1);
      expect(first).not.toHaveBeenCalled();
    });

    it('위 시트의 바깥 탭(onDismissRequest)은 그 시트만 닫고, 닫힌 시트의 늦은 이벤트는 무시한다', async () => {
      const first = jest.fn();
      const second = jest.fn();
      await renderProvider();
      await act(() => overlay.showBottomSheet({ component: <Text>검색</Text>, options: { onClose: first } }));
      await act(() => overlay.showBottomSheet({ component: <Text>날짜</Text>, options: { onClose: second } }));
      const upperDismiss = sheets()[1]!.props.onDismissRequest;
      await act(() => upperDismiss());
      await act(() => upperDismiss());
      expect(sheets()).toHaveLength(1);
      expect(second).toHaveBeenCalledTimes(1);
      expect(first).not.toHaveBeenCalled();
      await act(() => sheet().props.onDismissRequest());
      expect(first).toHaveBeenCalledTimes(1);
      expect(sheets()).toHaveLength(0);
    });

    it('커뮤니티 시트 대신 surface2 ModalBottomSheet 에 M3 콘텐츠 여백(16)을 둔다', async () => {
      await renderProvider();
      await act(() => overlay.showBottomSheet({ component: <Text>시트</Text> }));
      expect(queryAllByHostType('BottomSheet')).toHaveLength(0);
      expect(sheet().props).toMatchObject({ containerColor: colors.surface2, sheetGesturesEnabled: true, skipPartiallyExpanded: true });
      expect(StyleSheet.flatten(screen.getByTestId('zs-bottom-sheet').props.style)).toEqual({ paddingHorizontal: 16 });
      expect(screen.getByText('시트')).toBeTruthy();
      expect(screen.getByTestId('zs-bottom-sheet').type).toBe('ZSSheetContentView');
    });

    it('헤더 줄은 손잡이 바로 아래, 끌기 막이(ZSSheetContentView) 앞에 M3 여백(16)으로 둔다 — 헤더에서 끌어도 시트가 움직인다', async () => {
      await renderProvider();
      await act(() => overlay.showBottomSheet({ header: '정렬', headerRight: <Text>닫기</Text>, component: <Text>시트</Text>, options: { snapPoints: ['half', 'full'] } }));
      const ancestors = (node: { parent: unknown }) => {
        const chain: unknown[] = [];
        for (let cur = node.parent as { parent: unknown } | null; cur; cur = cur.parent as typeof cur) chain.push(cur);
        return chain;
      };
      const header = screen.getByTestId('zs-bottom-sheet-header');
      const handleColumn = screen.getByTestId('zs-bottom-sheet-handle').parent;
      expect(ancestors(header)).toContain(handleColumn);
      expect(ancestors(header)).not.toContain(screen.getByTestId('zs-bottom-sheet'));
      expect(StyleSheet.flatten(screen.getByTestId('zs-bottom-sheet-header').props.style)).toMatchObject({ paddingHorizontal: 16 });
      expect(screen.getByText('닫기')).toBeTruthy();
    });

    it('bottomComponent 는 M3 여백(16)으로 시트 아래에 고정한다', async () => {
      await renderProvider();
      await act(() => overlay.showBottomSheet({ component: <Text>시트</Text>, bottomComponent: <Text>저장</Text>, options: { snapPoints: ['half', 'full'] } }));
      expect(StyleSheet.flatten(screen.getByTestId('zs-bottom-sheet').props.style)).toEqual({ flex: 1 });
      const bottom = screen.getByTestId('zs-bottom-sheet-bottom');
      expect(bottom.type).toBe('ZSSheetBottomView');
      expect(StyleSheet.flatten(bottom.props.style)).toEqual({ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, backgroundColor: colors.surface2 });
      const cover = bottom.props.children[1];
      expect(StyleSheet.flatten(cover.props.style)).toMatchObject({ position: 'absolute', bottom: -118, height: 120, backgroundColor: colors.surface2 });
      expect(screen.getByText('저장')).toBeTruthy();
    });

    it("'half'·'full' 두 단계면 절반 단계를 쓴다", async () => {
      await renderProvider();
      await act(() => overlay.showBottomSheet({ component: <Text>시트</Text>, options: { snapPoints: ['half', 'full'] } }));
      expect(sheet().props.skipPartiallyExpanded).toBe(false);
    });

    it('back 은 닫을 수 있는 시트를 내린 뒤 걷고 onClose 를 한 번 부른다', async () => {
      const onClose = jest.fn();
      await renderProvider();
      await act(() => overlay.showBottomSheet({ component: <Text>시트</Text>, options: { onClose } }));
      mockSheetHide.mockClear();
      await act(() => {
        expect(pressBack()).toBe(true);
      });
      expect(mockSheetHide).toHaveBeenCalledTimes(1);
      await settle();
      expect(sheets()).toHaveLength(0);
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(pressBack()).toBe(false);
    });

    it('사용자가 끌어내리거나 바깥을 누르면(onDismissRequest) 걷고 onClose 를 한 번 부른다', async () => {
      const onClose = jest.fn();
      await renderProvider();
      await act(() => overlay.showBottomSheet({ component: <Text>시트</Text>, options: { onClose } }));
      await act(() => sheet().props.onDismissRequest());
      expect(sheets()).toHaveLength(0);
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(pressBack()).toBe(false);
    });

    it('dismissible=false 면 back 을 소비만 하고 시트는 남는다(끌기·바깥 탭도 막는다)', async () => {
      await renderProvider();
      await act(() => overlay.showBottomSheet({ component: <Text>필수</Text>, options: { dismissible: false } }));
      expect(sheet().props).toMatchObject({ sheetGesturesEnabled: false, properties: { shouldDismissOnBackPress: false, shouldDismissOnClickOutside: false } });
      await act(() => {
        expect(pressBack()).toBe(true);
      });
      await settle();
      expect(sheets()).toHaveLength(1);
    });

  });

  it('진행 표시 중에는 back 을 소비하고 아무것도 닫지 않는다', async () => {
    await renderProvider();
    await act(() => overlay.showBottomSheet({ component: <Text>시트</Text> }));
    await act(() => overlay.showLoader());
    await act(() => {
      expect(pressBack()).toBe(true);
    });
    await act(async () => {});
    expect(screen.getByTestId('zs-loader')).toBeTruthy();
    expect(queryAllByHostType('ModalBottomSheet')).toHaveLength(1);
    await act(() => overlay.hideLoader());
    await act(() => overlay.hideBottomSheet());
    await act(async () => {});
    expect(pressBack()).toBe(false);
  });

  describe('흐림 막 대상 — 앱 화면을 BlurTargetView 로 감싼다', () => {
    let seen: [string, unknown][] = [];
    function TargetProbe({ label }: { label: string }) {
      seen.push([label, useContext(VeilTargetContext)]);
      return null;
    }
    beforeEach(() => {
      seen = [];
    });

    it('앱 화면(children)은 flex 1 BlurTargetView 안에 그리고, 그 안 막에는 대상을 주지 않는다', async () => {
      await render(
        <OverlayProvider>
          <Text>화면</Text>
          <TargetProbe label="screen" />
        </OverlayProvider>,
      );
      const target = getByHostType('BlurTargetView');
      expect(StyleSheet.flatten(target.props.style)).toEqual({ flex: 1 });
      expect(target.queryAll((node) => node.props.children === '화면')).toHaveLength(1);
      expect(seen).toEqual([['screen', null]]);
    });

    it('화면 밖 포털 층의 막은 앱 화면 대상을 받는다', async () => {
      await render(
        <OverlayProvider>
          <ZSPortal>
            <TargetProbe label="portal" />
          </ZSPortal>
        </OverlayProvider>,
      );
      await act(async () => {});
      const [, target] = seen.find(([label]) => label === 'portal')!;
      expect(target).toBe(getByHostType('BlurTargetView').props.forwardedRef);
    });

    it('시트 안 막에는 대상을 주지 않는다 — 시트는 따로 뜬 창이다', async () => {
      await renderProvider();
      await act(() => overlay.showBottomSheet({ component: <TargetProbe label="sheet" /> }));
      expect(seen.filter(([label]) => label === 'sheet').every(([, target]) => target === null)).toBe(true);
      expect(seen.some(([label]) => label === 'sheet')).toBe(true);
    });

    it('스낵바는 앱 화면을 흐리는 막(dimezis) 위에 뜬다', async () => {
      await renderProvider();
      await act(() => overlay.showSnackbar({ message: '흐림 위' }));
      const blur = getByHostType('BlurView');
      expect(blur.props).toMatchObject({ blurMethod: 'dimezisBlurViewSdk31Plus' });
      expect(blur.props.blurTarget).toBe(getByHostType('BlurTargetView').props.forwardedRef);
    });
  });

  describe('showSnackbar — iOS 와 같은 스낵바', () => {
    it('Compose 스낵바가 아니라 같은 JS 스낵바를 띄우고 true 를 돌려준다', async () => {
      await renderProvider();
      let shown = false;
      await act(() => {
        shown = overlay.showSnackbar({ message: '저장됨', type: 'success' });
      });
      expect(shown).toBe(true);
      expect(screen.getByTestId('zs-snackbar-host')).toBeTruthy();
      expect(screen.getByText('저장됨')).toBeTruthy();
      expect(queryAllByHostType('SnackbarHost')).toHaveLength(0);
    });

    it('자식이 마운트되자마자 불러도 뜬다 — 기다릴 네이티브 호스트가 없다', async () => {
      function EarlyCaller() {
        const { showSnackbar } = useOverlay();
        useLayoutEffect(() => {
          showSnackbar({ message: '바로 뜬다' });
        }, [showSnackbar]);
        return null;
      }
      await render(
        <OverlayProvider>
          <EarlyCaller />
        </OverlayProvider>,
      );
      expect(screen.getByText('바로 뜬다')).toBeTruthy();
    });
  });
});
