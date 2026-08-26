import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Keyboard, TextProps, TouchableOpacityProps, useWindowDimensions } from 'react-native';
import { BackHandlerProvider } from './BackHandlerContext';
import { AlertContext, SnackbarContext, BottomSheetContext, PopOverContext, ModalityContext, LoaderContext, OverlayContext } from '../model/useOverlay';
import { AlertActions, BottomSheetHeight, BottomSheetOptions, HideOption, ModalityProps, OverlayProviderProps, PopOverMenuProps, ShowAlertProps, ShowBottomSheetProps, ShowSnackBarProps, SnackItem } from '../model/types';
import AlertOverlay from '../overlay/AlertOverlay';
import SnackbarNotify from '../overlay/SnackbarNotify';
import BottomSheetOverlay from '../overlay/BottomSheetOverlay';
import LoadingNotify from '../overlay/LoadingNotify';
import PopOverMenu from '../overlay/PopOver/PopOverMenu';
import Modality from '../overlay/Modality';
import { PortalProvider } from '../overlay/ZSPortal';
import { setGlobalOverlayRef } from '../model/globalOverlay';

const MemoizedAlertOverlay = memo(AlertOverlay);
const MemoizedSnackbarNotify = memo(SnackbarNotify);
const MemoizedBottomSheetOverlay = memo(BottomSheetOverlay);
const MemoizedLoadingNotify = memo(LoadingNotify);
const MemoizedPopOverMenu = memo(PopOverMenu);
const MemoizedModality = memo(Modality);
const EMPTY_ALERT_ACTIONS = {} as AlertActions;

export function OverlayProvider({
  customSnackbar,
  maxSnackbarCount = 3,
  loaderComponent,
  children
}: OverlayProviderProps) {
  const { height: defaultBottomSheetMaxHeight } = useWindowDimensions();

  const [title, setTitle] = useState<string>('');
  const [informative, setInformative] = useState<string>('');
  const [alertVisible, setAlertVisible] = useState<boolean>(false);
  const [actions, setActions] = useState<AlertActions>();
  const [isBackgroundTouchClose, setIsBackgroundTouchClose] = useState<boolean>(true);
  const [titleStyle, setTitleStyle] = useState<TextProps['style']>();
  const [informativeStyle, setInformativeStyle] = useState<TextProps['style']>();
  const [secondaryButtonStyle, setSecondaryButtonStyle] = useState<TouchableOpacityProps['style']>();
  const [primaryButtonStyle, setPrimaryButtonStyle] = useState<TouchableOpacityProps['style']>();
  const [secondaryButtonTextStyle, setSecondaryButtonTextStyle] = useState<TextProps['style']>();

  const [snackItemStack, setSnackItemStack] = useState<SnackItem[]>([]);

  const [bottomSheetVisible, setBottomSheetVisible] = useState<boolean>(false);
  const [bottomSheetComponent, setBottomSheetComponent] = useState<ReactNode>(null);
  const [bottomSheetHeader, setBottomSheetHeader] = useState<ReactNode>(null);
  const [bottomSheetOptions, setBottomSheetOptions] = useState<BottomSheetOptions>();
  const [bottomSheetHeight, setBottomSheetHeight] = useState<BottomSheetHeight>(300);
  const [bottomSheetMaxHeight, setBottomSheetMaxHeight] = useState<number>(defaultBottomSheetMaxHeight);

  const [loaderVisible, setLoaderVisible] = useState<boolean>(false);

  const [popOverVisible, setPopOverVisible] = useState<boolean>(false);
  const [popOverLocation, setPopOverLocation] = useState<{ px: PopOverMenuProps['px'], py: PopOverMenuProps['py'] }>({ px: 0, py: 0 });
  const [popOverComponent, setPopOverComponent] = useState<ReactNode>(false);

  const [modalityVisible, setModalityVisible] = useState<boolean>(false);
  const [modalityComponent, setModalityComponent] = useState<ReactNode>(false);
  const [modalityFoldableSingleScreen, setModalityFoldableSingleScreen] = useState<boolean>(false);

  const showAlert = useCallback(({
    title,
    informative,
    actions,
    isBackgroundTouchClose = true,
    titleStyle,
    informativeStyle,
    secondaryButtonStyle,
    primaryButtonStyle,
    secondaryButtonTextStyle,
  }: ShowAlertProps) => {
    Keyboard.dismiss();
    setTitle(title || '');
    setInformative(informative || '');
    setActions(actions || {} as AlertActions);
    setIsBackgroundTouchClose(isBackgroundTouchClose);
    setAlertVisible(true);

    setTitleStyle(titleStyle);
    setInformativeStyle(informativeStyle);
    setSecondaryButtonStyle(secondaryButtonStyle);
    setPrimaryButtonStyle(primaryButtonStyle);
    setSecondaryButtonTextStyle(secondaryButtonTextStyle);
  }, []);

  // onClose는 어떤 경로(버튼·배경·드래그·백버튼)로 닫히든 한 번만 발화하도록 ref로 보관한다.
  const bottomSheetCloseRef = useRef<(() => void) | undefined>(undefined);

  const showBottomSheet = useCallback(({
    headerComponent,
    component,
    options,
  }: ShowBottomSheetProps) => {
    Keyboard.dismiss();
    bottomSheetCloseRef.current = options?.onClose;
    setBottomSheetComponent(component);
    setBottomSheetHeader(headerComponent);
    setBottomSheetOptions(options);
    setBottomSheetHeight(options?.height ?? 300);
    setBottomSheetMaxHeight(options?.maxHeight ?? defaultBottomSheetMaxHeight);
    setBottomSheetVisible(true);
  }, [defaultBottomSheetMaxHeight]);

  const dismissBottomSheet = useCallback(() => {
    const onClose = bottomSheetCloseRef.current;
    bottomSheetCloseRef.current = undefined;
    setBottomSheetVisible(false);
    onClose?.();
  }, []);

  // 컨텍스트로 내려주는 setter — 닫힘은 전부 dismissBottomSheet를 타서 onClose가 1회 발화된다.
  const setBottomSheetVisibleGuarded = useCallback((visible: boolean) => {
    if (visible) {
      setBottomSheetVisible(true);
      return;
    }
    dismissBottomSheet();
  }, [dismissBottomSheet]);

  const showLoader = useCallback(() => {
    setLoaderVisible(true);
  }, []);

  const showPopOverMenu = useCallback(({
    px,
    py,
    component
  }: PopOverMenuProps) => {
    Keyboard.dismiss();
    setPopOverLocation({ px, py });
    setPopOverComponent(component);
    setPopOverVisible(true);
  }, []);

  const showModality = useCallback(({
    component,
    foldableSingleScreen
  }: ModalityProps) => {
    Keyboard.dismiss();
    setModalityComponent(component);
    setModalityVisible(true);
    setModalityFoldableSingleScreen(foldableSingleScreen || false);
  }, []);

  const showSnackBar = useCallback(({
    message,
    type = 'success',
    index = Date.now(),
    snackbarDuration = 3500
  }: ShowSnackBarProps) => {
    setSnackItemStack((prev) => {
      const newStack = [...prev, { message, type, index: index, snackbarDuration: snackbarDuration }];
      return newStack.length > maxSnackbarCount ? newStack.slice(1) : newStack;
    });
  }, [maxSnackbarCount]);

  const hideSnackBar = useCallback((index: number) => {
    setSnackItemStack((prev) => prev.filter((item) => item.index !== index));
  }, []);

  const hideOverlay = useCallback((option: HideOption = 'all') => {
    Keyboard.dismiss();
    switch (option) {
      case 'alert':
        setAlertVisible(false);
        break;
      case 'modal':
        setModalityVisible(false);
        break;
      case 'snack':
        setSnackItemStack([]);
        break;
      case 'bottomSheet':
        dismissBottomSheet();
        break;
      case 'loader':
        setLoaderVisible(false);
        break;
      case 'popOver':
        setPopOverVisible(false);
        break;
      case 'all':
        setModalityVisible(false);
        setAlertVisible(false);
        setSnackItemStack([]);
        setLoaderVisible(false);
        setPopOverVisible(false);
        dismissBottomSheet();
        break;
      default:
        break;
    };
  }, [dismissBottomSheet]);

  // 뒤로가기는 각 오버레이 컴포넌트가 BackHandlerContext에 우선순위로 등록한다
  // (LOADER 30 > OVERLAY 20 > SHEET 10) — back 한 번에 최상위 오버레이 하나만 닫힌다.

  const overlayContextValue = useMemo(() => ({
    hideOverlay,
    showAlert,
    showSnackBar,
    showBottomSheet,
    showPopOverMenu,
    showModality,
    showLoader,
  }), [hideOverlay, showAlert, showSnackBar, showBottomSheet, showPopOverMenu, showModality, showLoader]);

  useEffect(() => {
    setGlobalOverlayRef(overlayContextValue);

    return () => {
      setGlobalOverlayRef(null);
    };
  }, [overlayContextValue]);

  const alertContextValue = useMemo(() => ({
    alertVisible,
    setAlertVisible,
  }), [
    alertVisible,
    setAlertVisible,
  ]);

  const snackbarContextValue = useMemo(() => ({
    snackItemStack,
    hideSnackBar,
  }), [
    snackItemStack,
    hideSnackBar,
  ]);

  const bottomSheetContextValue = useMemo(() => ({
    bottomSheetVisible,
    setBottomSheetVisible: setBottomSheetVisibleGuarded,
    height: bottomSheetHeight,
    setHeight: setBottomSheetHeight,
    maxHeight: bottomSheetMaxHeight,
  }), [
    bottomSheetVisible,
    setBottomSheetVisibleGuarded,
    bottomSheetHeight,
    setBottomSheetHeight,
    bottomSheetMaxHeight,
  ]);

  const popOverContextValue = useMemo(() => ({
    popOverVisible,
    setPopOverVisible,
  }), [
    popOverVisible,
    setPopOverVisible,
  ]);

  const modalityContextValue = useMemo(() => ({
    modalityVisible,
    setModalityVisible,
  }), [
    modalityVisible,
    setModalityVisible,
  ]);

  const loaderContextValue = useMemo(() => ({
    loaderVisible,
    setLoaderVisible,
  }), [
    loaderVisible,
    setLoaderVisible,
  ]);

  return (
    <OverlayContext.Provider value={overlayContextValue}>
      <BackHandlerProvider>
      <AlertContext.Provider value={alertContextValue}>
        <SnackbarContext.Provider value={snackbarContextValue}>
          <BottomSheetContext.Provider value={bottomSheetContextValue}>
            <PopOverContext.Provider value={popOverContextValue}>
              <ModalityContext.Provider value={modalityContextValue}>
                <LoaderContext.Provider value={loaderContextValue}>
                  <PortalProvider>
                    {children}

                    <MemoizedModality modalityComponent={modalityComponent} foldableSingleScreen={modalityFoldableSingleScreen} />

                    <MemoizedBottomSheetOverlay
                      headerComponent={bottomSheetHeader}
                      component={bottomSheetComponent}
                      options={bottomSheetOptions}
                    />

                    <MemoizedPopOverMenu
                      px={popOverLocation?.px}
                      py={popOverLocation?.py}
                      component={popOverComponent}
                    />

                    <MemoizedAlertOverlay
                      title={title}
                      informative={informative}
                      actions={actions || EMPTY_ALERT_ACTIONS}
                      isBackgroundTouchClose={isBackgroundTouchClose}
                      titleStyle={titleStyle}
                      informativeStyle={informativeStyle}
                      secondaryButtonStyle={secondaryButtonStyle}
                      primaryButtonStyle={primaryButtonStyle}
                      secondaryButtonTextStyle={secondaryButtonTextStyle}
                    />

                    <MemoizedSnackbarNotify
                      customSnackbar={customSnackbar}
                    />

                    <MemoizedLoadingNotify
                      loaderComponent={loaderComponent}
                    />
                  </PortalProvider>
                </LoaderContext.Provider>
              </ModalityContext.Provider>
            </PopOverContext.Provider>
          </BottomSheetContext.Provider>
        </SnackbarContext.Provider>
      </AlertContext.Provider>
      </BackHandlerProvider>
    </OverlayContext.Provider>
  );
}
