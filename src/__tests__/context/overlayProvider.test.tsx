import { useEffect, useState } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Alert, BackHandler, Keyboard, StyleSheet, Text, TextInput } from 'react-native';
import { OverlayProvider } from '../../context/OverlayContext';
import { useScreenCovered } from '../../context/ScreenCoverContext';
import { GlobalOverlay } from '../../model/globalOverlay';
import { useOverlay } from '../../model/useOverlay';
import type { OverlayContextProps } from '../../model/types';
import { ZSPortal } from '../../overlay/ZSPortal';
import { SNACKBAR_DURATION } from '../../overlay/SnackbarHost';
import { DURATION } from '../../theme/motion';
import { getByHostType, queryAllByHostType } from '../utils/hostQueries';
import { setTestTheme } from '../utils/theme';

jest.mock('../../context/ThemeContext', () => require('../utils/theme').mockThemeModule());

const pressBack = () => (BackHandler as unknown as { mockPressBack: () => boolean }).mockPressBack();
const alert = Alert.alert as jest.Mock;

let overlay: OverlayContextProps;
let covered = false;

function Capture() {
  overlay = useOverlay();
  covered = useScreenCovered();
  return <Text>화면</Text>;
}

const renderProvider = () =>
  render(
    <OverlayProvider>
      <Capture />
    </OverlayProvider>,
  );

const sheet = () => getByHostType('BottomSheet');
const sheets = () => queryAllByHostType('BottomSheet');

describe('OverlayProvider (iOS)', () => {
  beforeEach(() => {
    alert.mockClear();
  });

  afterEach(() => jest.restoreAllMocks());

  it('children 을 그리고 화면은 덮이지 않은 상태로 시작한다', async () => {
    await renderProvider();
    expect(screen.getByText('화면')).toBeTruthy();
    expect(covered).toBe(false);
    expect(sheets()).toHaveLength(0);
    expect(screen.queryByTestId('zs-loader')).toBeNull();
    expect(screen.queryByTestId('zs-snackbar-host')).toBeNull();
  });

  describe('showAlert — zs-ui 대화상자(두 플랫폼 같은 구현)', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    const pressAndClose = async (testID: string) => {
      await fireEvent.press(screen.getByTestId(testID));
      await act(() => jest.advanceTimersByTime(DURATION.fast));
    };
    const dialogs = () => screen.queryAllByTestId('zs-alert');

    it('키보드를 내리고 시스템 Alert 대신 zs-ui 대화상자를 띄운다', async () => {
      const dismiss = jest.spyOn(Keyboard, 'dismiss');
      await renderProvider();
      await act(() => overlay.showAlert({ title: '저장됨', message: '목록에서 확인하세요', confirm: { label: '확인' } }));
      expect(dismiss).toHaveBeenCalled();
      expect(alert).not.toHaveBeenCalled();
      expect(screen.getByTestId('zs-alert')).toBeTruthy();
      expect(screen.getByText('목록에서 확인하세요')).toBeTruthy();
    });

    it('연달아 오면 차례로 띄운다 — 앞 대화상자가 닫힌 뒤 그 버튼 onPress, 그다음 대화상자', async () => {
      const first = jest.fn();
      const second = jest.fn();
      await renderProvider();
      await act(() => {
        overlay.showAlert({ title: '첫째', confirm: { label: '확인', onPress: first } });
        overlay.showAlert({ title: '둘째', confirm: { label: '확인', onPress: second } });
      });
      expect(dialogs()).toHaveLength(1);
      expect(screen.getByText('첫째')).toBeTruthy();
      await pressAndClose('zs-alert-confirm');
      expect(first).toHaveBeenCalledTimes(1);
      expect(screen.queryByText('첫째')).toBeNull();
      expect(screen.getByText('둘째')).toBeTruthy();
      await pressAndClose('zs-alert-confirm');
      expect(second).toHaveBeenCalledTimes(1);
      expect(dialogs()).toHaveLength(0);
    });

    it('버튼 onPress 에서 다른 오버레이를 띄워도 된다', async () => {
      await renderProvider();
      await act(() => overlay.showAlert({ title: '저장할까요?', confirm: { label: '저장', onPress: () => overlay.showSnackbar({ message: '저장했습니다' }) } }));
      await pressAndClose('zs-alert-confirm');
      expect(dialogs()).toHaveLength(0);
      expect(screen.getByText('저장했습니다')).toBeTruthy();
    });
  });

  describe('showBottomSheet', () => {
    it('시스템 시트를 첫 단계로 열고 콘텐츠를 iOS 여백(20)으로 감싼다', async () => {
      await renderProvider();
      await act(() => overlay.showBottomSheet({ component: <Text>시트 내용</Text> }));
      expect(sheet().props).toMatchObject({ index: 0, snapPoints: undefined, enablePanDownToClose: true });
      expect(sheet().props).not.toHaveProperty('backgroundStyle');
      expect(queryAllByHostType('ModalBottomSheet')).toHaveLength(0);
      expect(screen.getByText('시트 내용')).toBeTruthy();
      expect(StyleSheet.flatten(screen.getByTestId('zs-bottom-sheet').props.style)).toEqual({ paddingHorizontal: 20 });
      expect(covered).toBe(true);
    });

    it('내용은 네이티브 ZSSheetContentView 로 감싼다 — 내용 위 끌기로 시트가 늘어나거나 내려가지 않는다(손잡이 끌기는 그대로)', async () => {
      await renderProvider();
      await act(() => overlay.showBottomSheet({ component: <Text>시트 내용</Text>, bottomComponent: <Text>아래</Text> }));
      expect(screen.getByTestId('zs-bottom-sheet').type).toBe('ZSSheetContentView');
      expect(sheet().props.enablePanDownToClose).toBe(true);
    });

    it("'half'·'full'·비율 snapPoints 를 시트 단계로 바꾸고 contentPadding 을 쓴다", async () => {
      await renderProvider();
      await act(() => overlay.showBottomSheet({ component: <Text>시트</Text>, options: { snapPoints: ['half', 'full', '40%'], contentPadding: 0 } }));
      expect(sheet().props.snapPoints).toEqual(['50%', '100%', '40%']);
      expect(StyleSheet.flatten(screen.getByTestId('zs-bottom-sheet').props.style)).toEqual({ paddingHorizontal: 0 });
    });

    describe('header·headerRight — 손잡이 아래 끌 수 있는 헤더 줄', () => {
      const isInside = (node: { parent: unknown } | null, testID: string) => {
        for (let cur = node as { parent: unknown; props?: { testID?: string } } | null; cur; cur = cur.parent as typeof cur) if (cur.props?.testID === testID) return true;
        return false;
      };

      it('문자열 헤더는 제목(h4)으로, 줄 전체가 머리글이고 끌기 막이(ZSSheetContentView) 밖에 있다 — 손잡이처럼 시트를 끈다', async () => {
        await renderProvider();
        await act(() => overlay.showBottomSheet({ header: '정렬 기준', component: <Text>본문</Text> }));
        const row = screen.getByTestId('zs-bottom-sheet-header');
        expect(isInside(row, 'zs-bottom-sheet')).toBe(false);
        expect(StyleSheet.flatten(row.props.style)).toMatchObject({ flexDirection: 'row', minHeight: 48, paddingHorizontal: 20 });
        const title = screen.getByRole('header', { name: '정렬 기준' });
        expect(title.props.accessible).toBe(true);
        expect(screen.getByText('정렬 기준').props.accessible).toBe(false);
        expect(isInside(screen.getByText('본문'), 'zs-bottom-sheet')).toBe(true);
      });

      it('headerRight 는 헤더 오른쪽에 그리고 탭은 그 버튼이 받는다', async () => {
        const onPress = jest.fn();
        await renderProvider();
        await act(() =>
          overlay.showBottomSheet({
            header: '프로필',
            headerRight: (
              <Text onPress={onPress} testID="right">
                닫기
              </Text>
            ),
            component: <Text>본문</Text>,
            options: { contentPadding: 0 },
          }),
        );
        expect(isInside(screen.getByTestId('right'), 'zs-bottom-sheet-header-right')).toBe(true);
        expect(StyleSheet.flatten(screen.getByTestId('zs-bottom-sheet-header').props.style)).toMatchObject({ paddingHorizontal: 0 });
        await fireEvent.press(screen.getByTestId('right'));
        expect(onPress).toHaveBeenCalledTimes(1);
      });

      it('노드 헤더는 그대로 그리고 머리글 역할을 덧씌우지 않는다', async () => {
        await renderProvider();
        await act(() => overlay.showBottomSheet({ header: <Text>직접 그린 헤더</Text>, component: <Text>본문</Text> }));
        expect(screen.getByText('직접 그린 헤더')).toBeTruthy();
        expect(screen.queryByRole('header')).toBeNull();
      });

      it('header·headerRight 가 없으면 헤더 줄을 그리지 않는다', async () => {
        await renderProvider();
        await act(() => overlay.showBottomSheet({ component: <Text>본문</Text> }));
        expect(screen.queryByTestId('zs-bottom-sheet-header')).toBeNull();
      });
    });

    describe('bottomComponent — 시트 아래 고정 영역', () => {
      const bodyOf = () => screen.getByText('본문').parent!;
      const styleOf = (node: { props: { style?: unknown } }) => StyleSheet.flatten(node.props.style as never) ?? {};

      it('콘텐츠 높이 시트는 본문 바로 아래에 두고 좌우는 시트 여백을 따른다', async () => {
        await renderProvider();
        await act(() => overlay.showBottomSheet({ component: <Text>본문</Text>, bottomComponent: <Text>저장</Text> }));
        const container = screen.getByTestId('zs-bottom-sheet');
        const bottom = screen.getByTestId('zs-bottom-sheet-bottom');
        expect(styleOf(container)).toEqual({});
        expect(styleOf(bottom)).toEqual({ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 });
        expect(container.props.children[1].props.testID).toBe('zs-bottom-sheet-bottom');
        expect(screen.getByText('저장')).toBeTruthy();
      });

      it('높이 단계 시트는 본문이 남은 높이를 채우고(넘치면 자른다) 하단 영역은 시트 바닥에 붙는다', async () => {
        await renderProvider();
        await act(() =>
          overlay.showBottomSheet({ component: <Text>본문</Text>, bottomComponent: <Text>저장</Text>, options: { snapPoints: ['half'], contentPadding: 0 } }),
        );
        expect(styleOf(screen.getByTestId('zs-bottom-sheet'))).toEqual({ flex: 1 });
        expect(styleOf(screen.getByTestId('zs-bottom-sheet-bottom'))).toMatchObject({ paddingHorizontal: 0 });
        expect(styleOf(bodyOf())).toEqual({ paddingHorizontal: 0, flex: 1, overflow: 'hidden' });
      });

      it('없으면 이전처럼 본문만 감싼다', async () => {
        await renderProvider();
        await act(() => overlay.showBottomSheet({ component: <Text>본문</Text> }));
        expect(screen.queryByTestId('zs-bottom-sheet-bottom')).toBeNull();
      });
    });

    it('dismissible=false 면 끌어서 닫을 수 없다', async () => {
      await renderProvider();
      await act(() => overlay.showBottomSheet({ component: <Text>필수</Text>, options: { dismissible: false } }));
      expect(sheet().props.enablePanDownToClose).toBe(false);
    });

    it('사용자가 닫으면(onClose) 닫힌 상태가 되고 onClose 를 한 번 부른다', async () => {
      const onClose = jest.fn();
      await renderProvider();
      await act(() => overlay.showBottomSheet({ component: <Text>시트</Text>, options: { onClose } }));
      const close = sheet().props.onClose;
      await act(() => close());
      expect(sheets()).toHaveLength(0);
      expect(covered).toBe(false);
      expect(onClose).toHaveBeenCalledTimes(1);
      await act(() => close());
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('hideBottomSheet 는 시트를 닫고, 닫힘이 끝나면 onClose 를 한 번 부른다', async () => {
      const onClose = jest.fn();
      await renderProvider();
      await act(() => overlay.showBottomSheet({ component: <Text>시트</Text>, options: { onClose } }));
      await act(() => overlay.hideBottomSheet());
      expect(sheet().props.index).toBe(-1);
      expect(onClose).not.toHaveBeenCalled();
      await act(() => sheet().props.onClose());
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    describe('겹치기 — 시트가 열린 채 다시 부르면 위에 띄운다', () => {
      function Draft() {
        const [value, setValue] = useState('');
        return <TextInput testID="draft" value={value} onChangeText={setValue} />;
      }
      const indexes = () => sheets().map((node) => node.props.index);

      it('새 시트를 위에 띄우고 아래 시트와 그 입력은 남긴다 — 위 시트가 닫히면 아래 시트로 돌아온다', async () => {
        const first = jest.fn();
        const second = jest.fn();
        await renderProvider();
        await act(() => overlay.showBottomSheet({ component: <Draft />, options: { snapPoints: ['full'], onClose: first } }));
        await fireEvent.changeText(screen.getByTestId('draft'), '산책 기록');
        await act(() => overlay.showBottomSheet({ component: <Text>날짜</Text>, options: { onClose: second } }));
        expect(indexes()).toEqual([0, 0]);
        expect(screen.getByText('날짜')).toBeTruthy();
        expect(first).not.toHaveBeenCalled();
        await act(() => sheets()[1]!.props.onClose());
        expect(second).toHaveBeenCalledTimes(1);
        expect(first).not.toHaveBeenCalled();
        expect(sheets()).toHaveLength(1);
        expect(screen.getByTestId('draft').props.value).toBe('산책 기록');
        expect(covered).toBe(true);
      });

      it('hideBottomSheet 는 맨 위 시트만 닫는다', async () => {
        await renderProvider();
        await act(() => overlay.showBottomSheet({ component: <Text>검색</Text> }));
        await act(() => overlay.showBottomSheet({ component: <Text>날짜</Text> }));
        await act(() => overlay.hideBottomSheet());
        expect(indexes()).toEqual([0, -1]);
        await act(() => sheets()[1]!.props.onClose());
        expect(indexes()).toEqual([0]);
        await act(() => overlay.hideBottomSheet());
        expect(indexes()).toEqual([-1]);
      });

      it('바꾸려면 hideBottomSheet 다음 showBottomSheet — 앞 시트가 다 닫힌 뒤 새 시트가 뜬다', async () => {
        const first = jest.fn();
        await renderProvider();
        await act(() => overlay.showBottomSheet({ component: <Text>첫 시트</Text>, options: { onClose: first } }));
        await act(() => {
          overlay.hideBottomSheet();
          overlay.showBottomSheet({ component: <Text>다음 시트</Text> });
        });
        expect(indexes()).toEqual([-1]);
        expect(screen.queryByText('다음 시트')).toBeNull();
        expect(covered).toBe(true);
        await act(() => sheet().props.onClose());
        expect(first).toHaveBeenCalledTimes(1);
        expect(indexes()).toEqual([0]);
        expect(screen.getByText('다음 시트')).toBeTruthy();
      });

      it('기다리던 시트를 hideBottomSheet 로 거두면 띄우지 않고 onClose 를 한 번 부른다', async () => {
        const waiting = jest.fn();
        await renderProvider();
        await act(() => overlay.showBottomSheet({ component: <Text>첫 시트</Text> }));
        await act(() => {
          overlay.hideBottomSheet();
          overlay.showBottomSheet({ component: <Text>다음 시트</Text>, options: { onClose: waiting } });
          overlay.hideBottomSheet();
        });
        expect(waiting).toHaveBeenCalledTimes(1);
        await act(() => sheet().props.onClose());
        expect(sheets()).toHaveLength(0);
        expect(waiting).toHaveBeenCalledTimes(1);
        expect(covered).toBe(false);
      });

      it('아래 시트가 먼저 닫히면 위 시트도 함께 거두고 onClose 를 위에서부터 부른다', async () => {
        const order: string[] = [];
        await renderProvider();
        await act(() => overlay.showBottomSheet({ component: <Text>검색</Text>, options: { onClose: () => order.push('검색') } }));
        await act(() => overlay.showBottomSheet({ component: <Text>날짜</Text>, options: { onClose: () => order.push('날짜') } }));
        const lowerClose = sheets()[0]!.props.onClose;
        const upperClose = sheets()[1]!.props.onClose;
        await act(() => lowerClose());
        expect(sheets()).toHaveLength(0);
        expect(order).toEqual(['날짜', '검색']);
        await act(() => upperClose());
        expect(order).toEqual(['날짜', '검색']);
      });

      it('시트를 띄운 화면(모달·formSheet)이 닫혀 시트가 떨어지면(onDetach) 그 시트를 거두고 onClose 를 부른다', async () => {
        const onClose = jest.fn();
        await renderProvider();
        await act(() => overlay.showBottomSheet({ component: <Text>시트</Text>, options: { onClose } }));
        await act(() => getByHostType('ZSPresentationAnchorView').props.onDetach());
        expect(sheets()).toHaveLength(0);
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(covered).toBe(false);
      });
    });

    it('시스템 시트는 맨 위 화면에 붙이는 ZSPresentationAnchorView 안에 둔다', async () => {
      await renderProvider();
      await act(() => overlay.showBottomSheet({ component: <Text>시트</Text> }));
      const anchor = getByHostType('ZSPresentationAnchorView');
      expect(StyleSheet.flatten(anchor.props.style)).toEqual({ position: 'absolute', width: 0, height: 0 });
      expect(anchor.props.pointerEvents).toBeUndefined();
      expect(sheet().parent).toBe(anchor);
    });

    it('닫힌 시트의 늦은 닫힘 이벤트가 새 시트를 닫지 않는다', async () => {
      const first = jest.fn();
      const second = jest.fn();
      await renderProvider();
      await act(() => overlay.showBottomSheet({ component: <Text>첫 시트</Text>, options: { onClose: first } }));
      const staleClose = sheet().props.onClose;
      await act(() => staleClose());
      await act(() => overlay.showBottomSheet({ component: <Text>둘째 시트</Text>, options: { onClose: second } }));
      await act(() => staleClose());
      expect(sheet().props.index).toBe(0);
      expect(first).toHaveBeenCalledTimes(1);
      expect(second).not.toHaveBeenCalled();
    });

    it('같은 props로 다시 띄운 시트도 이전 닫힘 이벤트와 구분한다', async () => {
      const onClose = jest.fn();
      const props = { component: <Text>재사용 시트</Text>, options: { onClose } };
      await renderProvider();
      await act(() => overlay.showBottomSheet(props));
      const staleClose = sheet().props.onClose;
      await act(() => staleClose());
      await act(() => overlay.showBottomSheet(props));
      await act(() => staleClose());
      expect(sheet().props.index).toBe(0);
      expect(onClose).toHaveBeenCalledTimes(1);
      await act(() => sheet().props.onClose());
      expect(onClose).toHaveBeenCalledTimes(2);
    });

    it('닫힘이 끝나면 본문의 구독과 네이티브 시트를 해제한다', async () => {
      const dispose = jest.fn();
      function Body() {
        useEffect(() => dispose, []);
        return <Text>구독 중</Text>;
      }
      await renderProvider();
      await act(() => overlay.showBottomSheet({ component: <Body /> }));
      await act(() => overlay.hideBottomSheet());
      expect(dispose).not.toHaveBeenCalled();
      await act(() => sheet().props.onClose());
      expect(dispose).toHaveBeenCalledTimes(1);
      expect(sheets()).toHaveLength(0);
    });

    it('onClose에서 곧바로 연 새 시트를 유지한다', async () => {
      await renderProvider();
      await act(() => overlay.showBottomSheet({
        component: <Text>첫 시트</Text>,
        options: { onClose: () => overlay.showBottomSheet({ component: <Text>다음 시트</Text> }) },
      }));
      const close = sheet().props.onClose;
      await act(() => close());
      await act(() => close());
      expect(screen.getByText('다음 시트')).toBeTruthy();
      expect(sheet().props.index).toBe(0);
      expect(covered).toBe(true);
    });

    it('iOS 는 시트가 열려 있어도 back 을 가로채지 않는다', async () => {
      await renderProvider();
      await act(() => overlay.showBottomSheet({ component: <Text>시트</Text>, options: { dismissible: false } }));
      expect(pressBack()).toBe(false);
    });
  });

  describe('showSnackbar — 스낵바(두 플랫폼 같은 구현, 기본 위)', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('띄우고 true 를 돌려준다 — 자리는 기본 위(상단 바 아래)', async () => {
      await renderProvider();
      let shown = false;
      await act(() => {
        shown = overlay.showSnackbar({ message: '저장됨' });
      });
      expect(shown).toBe(true);
      expect(screen.getByTestId('zs-snackbar-host')).toBeTruthy();
      expect(screen.getByText('저장됨')).toBeTruthy();
    });

    it('최대 3개까지 쌓고 넘치면 가장 오래된 것부터 닫는다', async () => {
      await renderProvider();
      await act(() => {
        ['하나', '둘', '셋', '넷'].forEach((message) => overlay.showSnackbar({ message }));
      });
      expect(screen.queryByText('하나')).toBeNull();
      expect(['둘', '셋', '넷'].map((message) => screen.getByText(message))).toHaveLength(3);
    });

    it('시간이 지나면 닫히고 남은 것이 없으면 호스트도 사라진다', async () => {
      await renderProvider();
      await act(() => overlay.showSnackbar({ message: '저장됨' }));
      await act(() => jest.advanceTimersByTime(SNACKBAR_DURATION.short));
      expect(screen.queryByText('저장됨')).toBeNull();
      await act(() => jest.advanceTimersByTime(0));
      expect(screen.queryByTestId('zs-snackbar-host')).toBeNull();
    });

    it('문구를 누르면 그 스낵바만 닫는다', async () => {
      await renderProvider();
      await act(() => {
        overlay.showSnackbar({ message: '첫째' });
        overlay.showSnackbar({ message: '둘째' });
      });
      await fireEvent.press(screen.getByText('첫째'));
      expect(screen.queryByText('첫째')).toBeNull();
      expect(screen.getByText('둘째')).toBeTruthy();
    });

    it('동작을 누르면 닫고 onPress 를 부른다 — 동작이 있으면 시간이 지나도 남는다', async () => {
      const onPress = jest.fn();
      await renderProvider();
      await act(() => overlay.showSnackbar({ message: '보관했습니다', action: { label: '실행 취소', onPress } }));
      await act(() => jest.advanceTimersByTime(SNACKBAR_DURATION.long));
      await fireEvent.press(screen.getByText('실행 취소'));
      expect(onPress).toHaveBeenCalledTimes(1);
      expect(screen.queryByText('보관했습니다')).toBeNull();
    });

    it('GlobalOverlay 로 불러도 같은 스낵바가 뜬다', async () => {
      await renderProvider();
      await act(() => {
        expect(GlobalOverlay.showSnackbar({ message: '밖에서' })).toBe(true);
      });
      expect(screen.getByText('밖에서')).toBeTruthy();
    });
  });

  describe('showLoader', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('기본 문구로 진행 표시를 띄워 화면을 덮고 hideLoader 로 거둔다 — 사라지는 전환이 끝난 뒤 거둔다', async () => {
      await renderProvider();
      await act(() => overlay.showLoader());
      expect(screen.getByTestId('zs-loader').props.accessibilityLabel).toBe('Loading');
      expect(covered).toBe(true);
      await act(() => overlay.hideLoader());
      expect(covered).toBe(false);
      expect(screen.getByTestId('zs-loader')).toBeTruthy();
      await act(() => jest.advanceTimersByTime(DURATION.fast));
      expect(screen.queryByTestId('zs-loader')).toBeNull();
    });

    it('스크린 리더 문구를 바꿀 수 있다', async () => {
      await renderProvider();
      await act(() => overlay.showLoader({ accessibilityLabel: '결제 중' }));
      expect(screen.getByTestId('zs-loader').props.accessibilityLabel).toBe('결제 중');
    });

    it('progress 를 주면 진행률을 보이고, 다시 호출해 값을 바꾸거나 빼면 거둔다', async () => {
      await renderProvider();
      await act(() => overlay.showLoader());
      expect(screen.queryByTestId('zs-loader-percent')).toBeNull();
      await act(() => overlay.showLoader({ progress: 0.3 }));
      expect(screen.getByTestId('zs-loader-percent').props.children).toBe('30%');
      await act(() => overlay.showLoader({ progress: 0.8 }));
      expect(screen.getByTestId('zs-loader-percent').props.children).toBe('80%');
      await act(() => overlay.showLoader());
      expect(screen.queryByTestId('zs-loader-percent')).toBeNull();
    });

    it('기본 문구는 ThemeProvider accessibilityLabels.loading 을 따른다', async () => {
      setTestTheme({ accessibilityLabels: { loading: '불러오는 중' } });
      await renderProvider();
      await act(() => overlay.showLoader());
      expect(screen.getByTestId('zs-loader').props.accessibilityLabel).toBe('불러오는 중');
      setTestTheme();
    });
  });

  it('GlobalOverlay 가 Provider 의 함수로 이어지고, 언마운트하면 끊긴다', async () => {
    jest.useFakeTimers();
    await renderProvider();
    await act(() => GlobalOverlay.showLoader());
    expect(screen.getByTestId('zs-loader')).toBeTruthy();
    await act(() => GlobalOverlay.hideLoader());
    await act(() => jest.advanceTimersByTime(DURATION.fast));
    jest.useRealTimers();
    expect(screen.queryByTestId('zs-loader')).toBeNull();
    await act(() => screen.unmount());
    expect(() => GlobalOverlay.hideLoader()).toThrow('OverlayProvider');
  });

  it('iOS 는 앱 화면을 감싸지 않는다 — 막(UIVisualEffectView)이 뒤를 바로 흐린다', async () => {
    await renderProvider();
    expect(queryAllByHostType('BlurTargetView')).toHaveLength(0);
    expect(screen.getByText('화면')).toBeTruthy();
  });

  it('ZSPortal 을 받을 PortalProvider 를 둔다', async () => {
    await render(
      <OverlayProvider>
        <ZSPortal>
          <Text>포털</Text>
        </ZSPortal>
      </OverlayProvider>,
    );
    expect(screen.getByText('포털')).toBeTruthy();
  });
});
