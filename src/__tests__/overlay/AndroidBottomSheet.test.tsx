import React, { useContext } from 'react';
import { act, render, screen } from '@testing-library/react-native';
import { ScrollView, StyleSheet, Text } from 'react-native';
import AndroidBottomSheet from '../../overlay/AndroidBottomSheet';
import { mockSheetHide } from '../__mocks__/expo-ui-jetpack-compose';
import { getByHostType, nth, queryAllByHostType } from '../utils/hostQueries';
import { getTestTheme } from '../utils/theme';
import { createComposeColors } from '../../native/composeColors';

jest.mock('../../context/ThemeContext', () => require('../utils/theme').mockThemeModule());

type SheetProps = Partial<React.ComponentProps<typeof AndroidBottomSheet>>;

const sheets = () => queryAllByHostType('ModalBottomSheet');
const sheet = () => getByHostType('ModalBottomSheet');

function holdHide() {
  let finish: (failed?: boolean) => void = () => {};
  mockSheetHide.mockImplementationOnce(
    () => new Promise<void>((resolve, reject) => (finish = (failed) => (failed ? reject(new Error('hide')) : resolve()))),
  );
  return (failed?: boolean) => act(async () => finish(failed));
}

describe('AndroidBottomSheet (M3 ModalBottomSheet)', () => {
  let onClose: jest.Mock;
  const ui = (props: SheetProps = {}) => (
    <AndroidBottomSheet open dismissible onClose={onClose} {...props}>
      <Text>내용</Text>
    </AndroidBottomSheet>
  );
  const renderSheet = (props: SheetProps = {}) => render(ui(props));
  const update = (props: SheetProps) => screen.rerender(ui(props));

  beforeEach(() => {
    onClose = jest.fn();
    mockSheetHide.mockReset();
    mockSheetHide.mockImplementation(() => Promise.resolve());
  });

  it('닫힌 채 시작하면 아무것도 그리지 않는다', async () => {
    await renderSheet({ open: false });
    expect(sheets()).toHaveLength(0);
    expect(queryAllByHostType('Host')).toHaveLength(0);
  });

  it('앱 테마 Host 안에서 창 폭을 받아 그린다(터치는 시트 창이 받는다)', async () => {
    await renderSheet({ containerColor: '#eeeeee' });
    expect(getByHostType('Host').props).toMatchObject({ style: [{ position: 'absolute' }, { width: 390 }], pointerEvents: 'none' });
    expect(sheet().props).toMatchObject({
      containerColor: '#eeeeee',
      ...createComposeColors(getTestTheme().colors).bottomSheet,
      properties: { shouldDismissOnBackPress: true, shouldDismissOnClickOutside: true },
    });
    expect(screen.getByText('내용')).toBeTruthy();
  });

  it('dismissible=false 면 끌기·뒤로가기·바깥 탭으로 닫히지 않는다', async () => {
    await renderSheet({ dismissible: false });
    expect(sheet().props).toMatchObject({
      sheetGesturesEnabled: false,
      properties: { shouldDismissOnBackPress: false, shouldDismissOnClickOutside: false },
    });
  });

  describe('높이', () => {
    it('snapPoints 가 없으면 콘텐츠 높이에 맞추고 절반 단계를 건너뛴다', async () => {
      await renderSheet();
      expect(sheet().props.skipPartiallyExpanded).toBe(true);
      expect(getByHostType('RNHostView').props.matchContents).toEqual({ vertical: true });
    });

    it('빈 snapPoints 도 콘텐츠 높이다', async () => {
      await renderSheet({ snapPoints: [] });
      expect(getByHostType('RNHostView').props.matchContents).toEqual({ vertical: true });
    });

    it('단계가 있으면 높이를 창 높이 − 상태 표시줄·내비게이션 바로 정한다 — 전체 단계가 상태 표시줄 아래에서 멈춘다', async () => {
      const insets = jest.requireMock('react-native-safe-area-context').useSafeAreaInsets();
      Object.assign(insets, { top: 47, bottom: 34 });
      try {
        await renderSheet({ snapPoints: ['40%'] });
        expect(sheet().props.skipPartiallyExpanded).toBe(true);
        const host = getByHostType('RNHostView');
        expect(host.props.matchContents).toEqual({ vertical: true });
        expect(StyleSheet.flatten(nth(queryAllByHostType('View', host), 0).props.style)).toEqual({ height: 844 - 47 - 34 });
      } finally {
        Object.assign(insets, { top: 0, bottom: 0 });
      }
    });

    it('단계가 둘 이상이면 절반·전체 두 단계다', async () => {
      await renderSheet({ snapPoints: ['50%', '100%'] });
      expect(sheet().props.skipPartiallyExpanded).toBe(false);
    });
  });

  describe('끌기 — 손잡이로 끌고, 내용 위 끌기는 시트를 끌지 않는다(SheetContent)', () => {
    it('dismissible 이면 한 단계·두 단계 모두 끌기를 켠다(dismissible=false 면 끈다)', async () => {
      await renderSheet();
      expect(sheet().props).toMatchObject({ sheetGesturesEnabled: true, properties: { shouldDismissOnBackPress: true, shouldDismissOnClickOutside: true } });
      await update({ snapPoints: ['40%'] });
      expect(sheet().props.sheetGesturesEnabled).toBe(true);
      await update({ snapPoints: ['50%', '100%'] });
      expect(sheet().props.sheetGesturesEnabled).toBe(true);
      await update({ snapPoints: ['50%', '100%'], dismissible: false });
      expect(sheet().props.sheetGesturesEnabled).toBe(false);
    });

    it('Material3 손잡이(탭하면 닫힘)는 끄고 같은 모양의 손잡이를 내용 위에 그린다', async () => {
      await renderSheet();
      expect(sheet().props.showDragHandle).toBe(false);
      const handle = screen.getByTestId('zs-bottom-sheet-handle');
      expect(StyleSheet.flatten(handle.props.style)).toEqual({ height: 48, alignItems: 'center', justifyContent: 'center' });
      expect(StyleSheet.flatten(handle.props.children.props.style)).toEqual({ width: 32, height: 4, borderRadius: 2, backgroundColor: getTestTheme().colors.surface5 });
      expect(handle.props.onPress).toBeUndefined();
    });
  });

  it('시트 안 목록은 바깥 ScrollView 안으로 취급되지 않는다', async () => {
    let inner: unknown = 'unset';
    function Probe() {
      inner = useContext(ScrollView.Context);
      return null;
    }
    await render(
      <ScrollView.Context.Provider value={{ horizontal: false }}>
        <AndroidBottomSheet open dismissible onClose={onClose}>
          <Probe />
        </AndroidBottomSheet>
      </ScrollView.Context.Provider>,
    );
    expect(inner).toBeNull();
  });

  describe('닫기 — 시트마다 onClose 한 번', () => {
    it('사용자가 닫으면(onDismissRequest) 바로 걷고 onClose 를 한 번 부른다', async () => {
      await renderSheet();
      const dismiss = sheet().props.onDismissRequest;
      await act(() => dismiss());
      await act(() => dismiss());
      expect(sheets()).toHaveLength(0);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('open=false 면 hide() 로 내린 뒤 걷고 onClose 를 부른다', async () => {
      const finishHide = holdHide();
      await renderSheet();
      await update({ open: false });
      expect(mockSheetHide).toHaveBeenCalledTimes(1);
      expect(sheets()).toHaveLength(1);
      expect(onClose).not.toHaveBeenCalled();
      await finishHide();
      expect(sheets()).toHaveLength(0);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('hide() 가 실패해도 걷고 onClose 를 부른다', async () => {
      const finishHide = holdHide();
      await renderSheet();
      await update({ open: false });
      await finishHide(true);
      expect(sheets()).toHaveLength(0);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('hide() 중에 시트가 스스로 닫힘(onDismissRequest)을 보내도 onClose 는 한 번이다', async () => {
      const finishHide = holdHide();
      await renderSheet();
      const dismiss = sheet().props.onDismissRequest;
      await update({ open: false });
      await act(() => dismiss());
      expect(onClose).toHaveBeenCalledTimes(1);
      await finishHide();
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(sheets()).toHaveLength(0);
    });

    it('이미 닫힌 시트에 open=false 가 다시 와도 hide 하지 않는다', async () => {
      await renderSheet();
      await act(() => sheet().props.onDismissRequest());
      await update({ open: false });
      expect(mockSheetHide).not.toHaveBeenCalled();
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('닫힌 뒤 다시 열면 새 시트가 뜨고, 그 시트도 onClose 를 한 번 부른다', async () => {
      await renderSheet();
      await act(() => sheet().props.onDismissRequest());
      await update({ open: false });
      await update({ open: true });
      expect(sheets()).toHaveLength(1);
      await act(() => sheet().props.onDismissRequest());
      expect(onClose).toHaveBeenCalledTimes(2);
    });
  });

  describe('내려가는 중에 다시 열기', () => {
    it('새 시트로 바꾸고, 이전 시트의 늦은 hide 완료·닫힘 이벤트는 새 시트를 닫지 않는다', async () => {
      const finishHide = holdHide();
      await renderSheet();
      const oldDismiss = sheet().props.onDismissRequest;
      await update({ open: false });
      await update({ open: true });
      expect(sheets()).toHaveLength(1);

      await finishHide();
      await act(() => oldDismiss());
      expect(sheets()).toHaveLength(1);
      expect(onClose).not.toHaveBeenCalled();

      await act(() => sheet().props.onDismissRequest());
      expect(sheets()).toHaveLength(0);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('다시 연 시트를 프로그램으로 닫으면 그 시트의 hide 로 닫힌다', async () => {
      const finishFirst = holdHide();
      await renderSheet();
      await update({ open: false });
      await update({ open: true });
      await finishFirst();
      const finishSecond = holdHide();
      await update({ open: false });
      expect(mockSheetHide).toHaveBeenCalledTimes(2);
      await finishSecond();
      expect(sheets()).toHaveLength(0);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
