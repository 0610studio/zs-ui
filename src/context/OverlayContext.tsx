import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { BackHandler, Keyboard, Platform, StyleSheet, View, type HostInstance } from 'react-native';
import BottomSheet from '@expo/ui/community/bottom-sheet';
import { ScreenCoverContext } from './ScreenCoverContext';
import { BottomBarStoreContext, createBottomBarStore } from './BottomBarContext';
import { useTheme } from './ThemeContext';
import { OverlayContext } from '../model/useOverlay';
import { setGlobalOverlayRef } from '../model/globalOverlay';
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
}

const SHEET_PADDING = Platform.OS === 'android' ? 16 : 20;

const MAX_SNACKBARS = 3;

let nextAlertId = 0;
let nextSnackbarId = 0;

interface QueuedAlert {
  id: number;
  props: ShowAlertProps;
}

export function OverlayProvider({ children, snackbarPosition = 'top' }: OverlayProviderProps) {
  const { colors, accessibilityLabels } = useTheme();
  const screenTarget = useRef<HostInstance>(null);
  const [alertQueue, setAlertQueue] = useState<QueuedAlert[]>([]);
  const currentAlert = alertQueue[0] ?? null;
  const [activeSheet, setSheet] = useState<{ id: number; props: ShowBottomSheetProps } | null>(null);
  const sheet = activeSheet?.props ?? null;
  const [sheetOpen, setSheetOpen] = useState(false);
  const [loader, setLoader] = useState<ShowLoaderProps | null>(null);
  const [snackbars, setSnackbars] = useState<SnackbarEntry[]>([]);
  const sheetCloseRef = useRef<(() => void) | undefined>(undefined);
  const sheetIdRef = useRef(0);
  const [bottomBar] = useState(createBottomBarStore);

  const showAlert = useCallback((props: ShowAlertProps) => {
    Keyboard.dismiss();
    setAlertQueue((queue) => [...queue, { id: nextAlertId++, props }]);
  }, []);

  const closeAlert = useCallback(() => setAlertQueue((queue) => queue.slice(1)), []);

  const showBottomSheet = useCallback((props: ShowBottomSheetProps) => {
    Keyboard.dismiss();
    const replaced = sheetCloseRef.current;
    sheetCloseRef.current = props.options?.onClose;
    setSheet({ id: ++sheetIdRef.current, props });
    setSheetOpen(true);
    replaced?.();
  }, []);

  const hideBottomSheet = useCallback(() => setSheetOpen(false), []);

  const handleSheetClose = useCallback((id: number) => {
    if (id !== sheetIdRef.current) return;
    sheetIdRef.current += 1;
    setSheetOpen(false);
    setSheet(null);
    const onClose = sheetCloseRef.current;
    sheetCloseRef.current = undefined;
    onClose?.();
  }, []);

  const showSnackbar = useCallback((props: ShowSnackbarProps) => {
    setSnackbars((items) => [...items, { ...props, id: nextSnackbarId++ }].slice(-MAX_SNACKBARS));
    return true;
  }, []);

  const hideSnackbar = useCallback((id: number) => setSnackbars((items) => items.filter((item) => item.id !== id)), []);

  const showLoader = useCallback((props?: ShowLoaderProps) => setLoader(props ?? {}), []);
  const hideLoader = useCallback(() => setLoader(null), []);

  const sheetDismissible = sheet?.options?.dismissible ?? true;
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    if (!sheetOpen && !loader) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!loader && sheetDismissible) setSheetOpen(false);
      return true;
    });
    return () => subscription.remove();
  }, [sheetOpen, loader, sheetDismissible]);

  const value = useMemo<OverlayContextProps>(
    () => ({ showAlert, showBottomSheet, hideBottomSheet, showSnackbar, showLoader, hideLoader }),
    [showAlert, showBottomSheet, hideBottomSheet, showSnackbar, showLoader, hideLoader],
  );

  useEffect(() => {
    setGlobalOverlayRef(value);
    return () => setGlobalOverlayRef(null);
  }, [value]);

  const snapPoints = sheet?.options?.snapPoints?.map((point) => (point === 'half' ? '50%' : point === 'full' ? '100%' : point));
  const padding = sheet?.options?.contentPadding ?? SHEET_PADDING;
  const contentPadding = { paddingHorizontal: padding };
  const fillsSheet = (snapPoints?.length ?? 0) > 0;
  // 헤더는 끌기 막이(SheetContent) 밖 — 손잡이처럼 시트를 끈다
  const sheetHeader =
    sheet && (sheet.header != null || sheet.headerRight != null) ? <SheetHeader header={sheet.header} headerRight={sheet.headerRight} paddingHorizontal={padding} /> : null;
  const sheetMain = !sheet ? null : sheet.bottomComponent ? (
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
  const sheetBody = sheetMain ? (
    <>
      {sheetHeader}
      {sheetMain}
    </>
  ) : null;
  // 시트는 별도 창이므로 앱 화면의 blur target을 공유하지 않습니다.
  const sheetContent = sheetBody ? <VeilTargetContext.Provider value={null}>{sheetBody}</VeilTargetContext.Provider> : null;

  return (
    <OverlayContext.Provider value={value}>
      <VeilTargetContext.Provider value={screenTarget}>
        <PortalProvider>
          <VeilScreen target={screenTarget}>
            <ScreenCoverContext.Provider value={loader !== null || sheetOpen}>
              <BottomBarStoreContext.Provider value={bottomBar}>{children}</BottomBarStoreContext.Provider>
            </ScreenCoverContext.Provider>
          </VeilScreen>
          {activeSheet && Platform.OS === 'android' ? (
            <AndroidBottomSheet
              key={activeSheet.id}
              open={sheetOpen}
              snapPoints={snapPoints}
              dismissible={sheetDismissible}
              containerColor={colors.surface2}
              onClose={() => handleSheetClose(activeSheet.id)}
            >
              {sheetContent}
            </AndroidBottomSheet>
          ) : null}
          {activeSheet && Platform.OS === 'ios' ? (
            <IOSBottomSheet key={activeSheet.id} open={sheetOpen} snapPoints={snapPoints} dismissible={sheetDismissible} onClose={() => handleSheetClose(activeSheet.id)}>
              {sheetContent}
            </IOSBottomSheet>
          ) : null}
          {activeSheet && Platform.OS !== 'android' && Platform.OS !== 'ios' ? (
            <BottomSheet key={activeSheet.id} index={sheetOpen ? 0 : -1} snapPoints={snapPoints} enablePanDownToClose={sheetDismissible} onClose={() => handleSheetClose(activeSheet.id)}>
              {sheetContent}
            </BottomSheet>
          ) : null}
          {currentAlert ? <AlertDialog key={currentAlert.id} alert={currentAlert.props} onClose={closeAlert} /> : null}
          <SnackbarHost items={snackbars} onHide={hideSnackbar} position={snackbarPosition} bottomBar={bottomBar} />
          <Loader visible={loader !== null} accessibilityLabel={loader?.accessibilityLabel ?? accessibilityLabels.loading} />
        </PortalProvider>
      </VeilTargetContext.Provider>
    </OverlayContext.Provider>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  body: { flex: 1, overflow: 'hidden' },
  bottomSlot: { paddingTop: 12, paddingBottom: 12 },
  bottomCover: { position: 'absolute', bottom: -118, left: 0, right: 0, height: 120 },
});
