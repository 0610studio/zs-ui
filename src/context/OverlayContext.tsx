import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { BackHandler, Keyboard, Platform, StyleSheet, View, type HostInstance } from 'react-native';
import BottomSheet from '@expo/ui/community/bottom-sheet';
import { ScreenCoverContext } from './ScreenCoverContext';
import { BottomBarStoreContext, createBottomBarStore } from './BottomBarContext';
import { useTheme } from './ThemeContext';
import { OverlayContext } from '../model/useOverlay';
import { registerGlobalOverlay } from '../model/globalOverlay';
import type { OverlayContextProps, ShowAlertProps, ShowBottomSheetProps, ShowLoaderProps, ShowSnackbarProps } from '../model/types';
import { PortalProvider } from '../overlay/ZSPortal';
import AlertDialog from '../overlay/AlertDialog';
import AndroidBottomSheet from '../overlay/AndroidBottomSheet';
import IOSBottomSheet from '../overlay/IOSBottomSheet';
import { SheetBottom } from '../overlay/SheetBottom';
import { SheetContent } from '../overlay/SheetContent';
import { SheetHeader } from '../overlay/SheetHeader';
import SnackbarHost, { type SnackbarEntry, type SnackbarPosition } from '../overlay/SnackbarHost';
import Loader from '../overlay/Loader';
import { VeilScreen, VeilTargetContext } from '../overlay/veil';

export interface OverlayProviderProps {
  children: ReactNode;
  snackbarPosition?: SnackbarPosition;
  /** 바텀시트 최대 폭(pt·dp). 창이 더 넓으면 이 폭으로 가운데에 띄운다. 생략하면 플랫폼 기본 폭 */
  bottomSheetMaxWidth?: number;
}

const SHEET_PADDING = Platform.OS === 'android' ? 16 : 20;

const MAX_SNACKBARS = 3;

let nextAlertId = 0;
let nextSnackbarId = 0;
let nextSheetId = 0;

interface QueuedAlert {
  id: number;
  props: ShowAlertProps;
}

/** open: 떠 있음 · closing: 닫힘 전환 중 · pending: 아래 시트가 닫히길 기다림(닫히는 시트 위에 띄우지 않는다) */
type SheetState = 'open' | 'closing' | 'pending';

interface SheetEntry {
  id: number;
  props: ShowBottomSheetProps;
  state: SheetState;
}

/** 맨 위에 떠 있거나 뜰 시트 — 닫히는 중인 시트는 건너뛴다 */
const topSheetOf = (sheets: SheetEntry[]) => {
  for (let index = sheets.length - 1; index >= 0; index -= 1) {
    const sheet = sheets[index];
    if (sheet && sheet.state !== 'closing') return sheet;
  }
  return undefined;
};

// 닫히는 시트가 없으면 기다리던 시트를 띄운다
const settle = (sheets: SheetEntry[]) => (sheets.some((sheet) => sheet.state === 'closing') ? sheets : sheets.map((sheet) => (sheet.state === 'pending' ? { ...sheet, state: 'open' as const } : sheet)));

export function OverlayProvider({ children, snackbarPosition = 'top', bottomSheetMaxWidth }: OverlayProviderProps) {
  const { accessibilityLabels } = useTheme();
  const screenTarget = useRef<HostInstance>(null);
  const [alertQueue, setAlertQueue] = useState<QueuedAlert[]>([]);
  const currentAlert = alertQueue[0] ?? null;
  const [sheets, setSheets] = useState<SheetEntry[]>([]);
  const sheetsRef = useRef(sheets);
  const [loader, setLoader] = useState<ShowLoaderProps | null>(null);
  const [snackbars, setSnackbars] = useState<SnackbarEntry[]>([]);
  const [bottomBar] = useState(createBottomBarStore);

  const commitSheets = useCallback((next: SheetEntry[]) => {
    sheetsRef.current = next;
    setSheets(next);
  }, []);

  const showAlert = useCallback((props: ShowAlertProps) => {
    Keyboard.dismiss();
    setAlertQueue((queue) => [...queue, { id: nextAlertId++, props }]);
  }, []);

  const closeAlert = useCallback(() => setAlertQueue((queue) => queue.slice(1)), []);

  const showBottomSheet = useCallback(
    (props: ShowBottomSheetProps) => {
      Keyboard.dismiss();
      const current = sheetsRef.current;
      const state: SheetState = current.some((sheet) => sheet.state === 'closing') ? 'pending' : 'open';
      commitSheets([...current, { id: nextSheetId++, props, state }]);
    },
    [commitSheets],
  );

  const hideBottomSheet = useCallback(() => {
    const current = sheetsRef.current;
    const target = topSheetOf(current);
    if (!target) return;
    if (target.state === 'pending') {
      commitSheets(current.filter((sheet) => sheet !== target));
      target.props.options?.onClose?.();
      return;
    }
    commitSheets(current.map((sheet) => (sheet === target ? { ...sheet, state: 'closing' } : sheet)));
  }, [commitSheets]);

  const handleSheetClose = useCallback(
    (id: number) => {
      const current = sheetsRef.current;
      const index = current.findIndex((sheet) => sheet.id === id);
      if (index < 0) return;
      // 아래 시트가 닫히면 그 위에 떠 있던 시트도 함께 내려간다 — iOS 는 위 시트를 아래 시트가 띄운다
      const closed = current.filter((sheet, i) => i === index || (i > index && sheet.state !== 'pending'));
      commitSheets(settle(current.filter((sheet) => !closed.includes(sheet))));
      closed.reverse().forEach((sheet) => sheet.props.options?.onClose?.());
    },
    [commitSheets],
  );

  const showSnackbar = useCallback((props: ShowSnackbarProps) => {
    setSnackbars((items) => [...items, { ...props, id: nextSnackbarId++ }].slice(-MAX_SNACKBARS));
    return true;
  }, []);

  const hideSnackbar = useCallback((id: number) => setSnackbars((items) => items.filter((item) => item.id !== id)), []);

  const showLoader = useCallback((props?: ShowLoaderProps) => setLoader(props ?? {}), []);
  const hideLoader = useCallback(() => setLoader(null), []);

  const topSheet = topSheetOf(sheets);
  const sheetCovering = topSheet !== undefined;
  const topDismissible = topSheet?.props.options?.dismissible ?? true;
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    if (!sheetCovering && !loader) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!loader && topDismissible) hideBottomSheet();
      return true;
    });
    return () => subscription.remove();
  }, [sheetCovering, loader, topDismissible, hideBottomSheet]);

  const value = useMemo<OverlayContextProps>(
    () => ({ showAlert, showBottomSheet, hideBottomSheet, showSnackbar, showLoader, hideLoader }),
    [showAlert, showBottomSheet, hideBottomSheet, showSnackbar, showLoader, hideLoader],
  );

  const globalSlot = useRef(value);
  globalSlot.current = value;
  useEffect(() => registerGlobalOverlay(globalSlot), []);

  return (
    <OverlayContext.Provider value={value}>
      <VeilTargetContext.Provider value={screenTarget}>
        <PortalProvider>
          <VeilScreen target={screenTarget}>
            <ScreenCoverContext.Provider value={loader !== null || sheetCovering}>
              <BottomBarStoreContext.Provider value={bottomBar}>{children}</BottomBarStoreContext.Provider>
            </ScreenCoverContext.Provider>
          </VeilScreen>
          {sheets.map((sheet) => (sheet.state === 'pending' ? null : <SheetLayer key={sheet.id} sheet={sheet} maxWidth={bottomSheetMaxWidth} onClose={handleSheetClose} />))}
          {currentAlert ? <AlertDialog key={currentAlert.id} alert={currentAlert.props} onClose={closeAlert} /> : null}
          <SnackbarHost items={snackbars} onHide={hideSnackbar} position={snackbarPosition} bottomBar={bottomBar} />
          <Loader visible={loader !== null} accessibilityLabel={loader?.accessibilityLabel ?? accessibilityLabels.loading} progress={loader?.progress} />
        </PortalProvider>
      </VeilTargetContext.Provider>
    </OverlayContext.Provider>
  );
}

/** 시트 하나 — 쌓인 순서대로 그려 뒤에 그린 시트가 위에 뜬다 */
function SheetLayer({ sheet: { id, props: sheet, state }, maxWidth, onClose }: { sheet: SheetEntry; maxWidth?: number; onClose: (id: number) => void }) {
  const { colors } = useTheme();
  const open = state === 'open';
  const dismissible = sheet.options?.dismissible ?? true;
  const snapPoints = sheet.options?.snapPoints?.map((point) => (point === 'half' ? '50%' : point === 'full' ? '100%' : point));
  const padding = sheet.options?.contentPadding ?? SHEET_PADDING;
  const contentPadding = { paddingHorizontal: padding };
  const fillsSheet = (snapPoints?.length ?? 0) > 0;
  const close = () => onClose(id);
  // 헤더는 끌기 막이(SheetContent) 밖 — 손잡이처럼 시트를 끈다
  const header = sheet.header != null || sheet.headerRight != null ? <SheetHeader header={sheet.header} headerRight={sheet.headerRight} paddingHorizontal={padding} /> : null;
  const main = sheet.bottomComponent ? (
    <SheetContent testID="zs-bottom-sheet" style={fillsSheet ? styles.fill : undefined}>
      <View style={[contentPadding, fillsSheet ? styles.body : null]}>{sheet.component}</View>
      <SheetBottom testID="zs-bottom-sheet-bottom" style={[contentPadding, styles.bottomSlot, Platform.OS === 'android' && { backgroundColor: colors.surface2 }]}>
        {sheet.bottomComponent}
        {Platform.OS === 'android' ? <View pointerEvents="none" style={[styles.bottomCover, { backgroundColor: colors.surface2 }]} /> : null}
      </SheetBottom>
    </SheetContent>
  ) : (
    <SheetContent testID="zs-bottom-sheet" style={contentPadding}>
      {sheet.component}
    </SheetContent>
  );
  // 시트는 별도 창이므로 앱 화면의 blur target을 공유하지 않습니다.
  const content = (
    <VeilTargetContext.Provider value={null}>
      {header}
      {main}
    </VeilTargetContext.Provider>
  );

  if (Platform.OS === 'android') {
    return (
      <AndroidBottomSheet open={open} snapPoints={snapPoints} dismissible={dismissible} containerColor={colors.surface2} maxWidth={maxWidth} onClose={close}>
        {content}
      </AndroidBottomSheet>
    );
  }
  if (Platform.OS === 'ios') {
    return (
      <IOSBottomSheet open={open} snapPoints={snapPoints} dismissible={dismissible} maxWidth={maxWidth} onClose={close}>
        {content}
      </IOSBottomSheet>
    );
  }
  return (
    <BottomSheet index={open ? 0 : -1} snapPoints={snapPoints} enablePanDownToClose={dismissible} onClose={close}>
      {content}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  body: { flex: 1, overflow: 'hidden' },
  bottomSlot: { paddingTop: 12, paddingBottom: 12 },
  bottomCover: { position: 'absolute', bottom: -118, left: 0, right: 0, height: 120 },
});
