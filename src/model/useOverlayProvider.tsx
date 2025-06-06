import { useCallback, useEffect, useMemo, useState } from 'react';
import { BackHandler, Keyboard, TextProps, TouchableOpacityProps } from 'react-native';
import { AlertContext, SnackbarContext, BottomSheetContext, PopOverContext, ModalityContext, LoaderContext, OverlayContext, AboveKeyboardContext } from './useOverlay';
import { AlertActions, BottomSheetOptions, HideOption, ModalityProps, OverlayProviderProps, PopOverMenuProps, ShowAboveKeyboardProps, ShowAlertProps, ShowBottomSheetProps, ShowSnackBarProps, SnackItem } from './types';
import AlertOverlay from '../overlay/AlertOverlay';
import SnackbarNotify from '../overlay/SnackbarNotify';
import BottomSheetOverlay from '../overlay/BottomSheetOverlay';
import LoadingNotify from '../overlay/LoadingNotify';
import PopOverMenu from '../overlay/PopOver/PopOverMenu';
import Modality from '../overlay/Modality';
import AboveKeyboard from '../overlay/AboveKeyboard';

export function OverlayProvider({
  customSnackbar,
  maxSnackbarCount = 3,
  loaderComponent,
  children
}: OverlayProviderProps) {
  // Alert
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
  const [primaryButtonTextStyle, setPrimaryButtonTextStyle] = useState<TextProps['style']>();
  const [singleButtonTextStyle, setSingleButtonTextStyle] = useState<TextProps['style']>();

  // Snackbar
  const [snackItemStack, setSnackItemStack] = useState<SnackItem[]>([]);

  // BottomSheet
  const [bottomSheetVisible, setBottomSheetVisible] = useState<boolean>(false);
  const [bottomSheetComponent, setBottomSheetComponent] = useState<React.ReactNode>(null);
  const [bottomSheetHeader, setBottomSheetHeader] = useState<React.ReactNode>(null);
  const [bottomSheetOptions, setBottomSheetOptions] = useState<BottomSheetOptions>();
  const [bottomSheetHeight, setBottomSheetHeight] = useState<number>(300);

  // Loading
  const [loaderVisible, setLoaderVisible] = useState<boolean>(false);

  // PopOver
  const [popOverVisible, setPopOverVisible] = useState<boolean>(false);
  const [popOverLocation, setPopOverLocation] = useState<{ px: PopOverMenuProps['px'], py: PopOverMenuProps['py'] }>({ px: 0, py: 0 });
  const [popOverComponent, setPopOverComponent] = useState<React.ReactNode>(false);

  // Modality
  const [modalityVisible, setModalityVisible] = useState<boolean>(false);
  const [modalityComponent, setModalityComponent] = useState<React.ReactNode>(false);

  // AboveKeyboard
  const [aboveKeyboardVisible, setAboveKeyboardVisible] = useState<boolean>(false);
  const [aboveKeyboardRender, setAboveKeyboardRender] = useState<() => React.ReactNode>(() => null);
  const [aboveKeyboardMarginBottom, setAboveKeyboardMarginBottom] = useState<number>(0);

  // ---

  const showAboveKeyboard = ({
    render,
    marginBottom
  }: ShowAboveKeyboardProps) => {
    setAboveKeyboardRender(() => render);
    setAboveKeyboardMarginBottom(marginBottom || 0);
    setAboveKeyboardVisible(true);
  }

  const showAlert = ({
    title,
    informative,
    actions,
    isBackgroundTouchClose = true,
    titleStyle,
    informativeStyle,
    secondaryButtonStyle,
    primaryButtonStyle,
    secondaryButtonTextStyle,
    primaryButtonTextStyle,
    singleButtonTextStyle,
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
    setPrimaryButtonTextStyle(primaryButtonTextStyle);
    setSingleButtonTextStyle(singleButtonTextStyle);
  };

  const showBottomSheet = ({
    headerComponent,
    component,
    options,
  }: ShowBottomSheetProps) => {
    Keyboard.dismiss();
    setBottomSheetComponent(component);
    setBottomSheetHeader(headerComponent);
    setBottomSheetOptions(options);
    setBottomSheetHeight(options?.height || 300);
    setBottomSheetVisible(true);
  };

  const showLoader = () => {
    setLoaderVisible(true);
  };

  const showPopOverMenu = ({
    px,
    py,
    component
  }: PopOverMenuProps) => {
    Keyboard.dismiss();
    setPopOverLocation({ px, py });
    setPopOverComponent(component);
    setPopOverVisible(true);
  }

  const showModality = ({
    component
  }: ModalityProps) => {
    Keyboard.dismiss();
    setModalityComponent(component);
    setModalityVisible(true);
  }

  const showSnackBar = ({
    message,
    type = 'success',
    index = Date.now(),
    snackbarDuration = 3500
  }: ShowSnackBarProps) => {
    setSnackItemStack((prev) => {
      const newStack = [...prev, { message, type, index: index, snackbarDuration: snackbarDuration }];
      return newStack.length > maxSnackbarCount ? newStack.slice(1) : newStack;
    });
  };

  const hideSnackBar = (index: number) => {
    setSnackItemStack((prev) => prev.filter((item) => item.index !== index));
  };

  const hideOverlay = useCallback((option: HideOption) => {
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
        setBottomSheetVisible(false);
        break;
      case 'loader':
        setLoaderVisible(false);
        break;
      case 'popOver':
        setPopOverVisible(false);
        break;
      case 'aboveKeyboard':
        setAboveKeyboardVisible(false);
        break;
      case 'all':
        setModalityVisible(false);
        setAlertVisible(false);
        setSnackItemStack([]);
        setLoaderVisible(false);
        setPopOverVisible(false);
        setBottomSheetVisible(false);
        setAboveKeyboardVisible(false);
        break;
      default:
        break;
    };
  }, []);

  // 안드로이드 뒤로가기 버튼 제어
  const backPressHandler = useCallback(() => {
    if (loaderVisible) {
      return true;
    }
    if (alertVisible || modalityVisible || popOverVisible || bottomSheetVisible) {
      hideOverlay('all');
      return true;
    }
    return false;
  }, [alertVisible, loaderVisible, modalityVisible, popOverVisible]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backPressHandler);
    return () => backHandler.remove();
  }, [backPressHandler]);

  // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  const overlayContextValue = useMemo(() => ({
    hideOverlay,
    showAlert,
    showSnackBar,
    showBottomSheet,
    showPopOverMenu,
    showModality,
    showLoader,
    showAboveKeyboard,
  }), [
    hideOverlay,
    showAlert,
    showSnackBar,
    showBottomSheet,
    showPopOverMenu,
    showModality,
    showLoader,
    showAboveKeyboard,
  ]);

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
    setBottomSheetVisible,
    height: bottomSheetHeight,
    setHeight: setBottomSheetHeight,
  }), [
    bottomSheetVisible,
    setBottomSheetVisible,
    bottomSheetHeight,
    setBottomSheetHeight,
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

  const aboveKeyboardContextValue = useMemo(() => ({
    aboveKeyboardVisible,
    setAboveKeyboardVisible,
    marginBottom: aboveKeyboardMarginBottom,
  }), [
    aboveKeyboardVisible,
    setAboveKeyboardVisible,
    aboveKeyboardMarginBottom,
  ]);

  return (
    <OverlayContext.Provider value={overlayContextValue}>
      <AlertContext.Provider value={alertContextValue}>
        <SnackbarContext.Provider value={snackbarContextValue}>
          <BottomSheetContext.Provider value={bottomSheetContextValue}>
            <PopOverContext.Provider value={popOverContextValue}>
              <ModalityContext.Provider value={modalityContextValue}>
                <LoaderContext.Provider value={loaderContextValue}>
                  <AboveKeyboardContext.Provider value={aboveKeyboardContextValue}>
                    {children}

                    <Modality modalityComponent={modalityComponent} />

                    <BottomSheetOverlay
                      headerComponent={bottomSheetHeader}
                      component={bottomSheetComponent}
                      options={bottomSheetOptions}
                    />

                    <PopOverMenu
                      px={popOverLocation?.px}
                      py={popOverLocation?.py}
                      component={popOverComponent}
                    />

                    <AlertOverlay
                      title={title}
                      informative={informative}
                      actions={actions || {} as AlertActions}
                      isBackgroundTouchClose={isBackgroundTouchClose}
                      titleStyle={titleStyle}
                      informativeStyle={informativeStyle}
                      secondaryButtonStyle={secondaryButtonStyle}
                      primaryButtonStyle={primaryButtonStyle}
                      secondaryButtonTextStyle={secondaryButtonTextStyle}
                      primaryButtonTextStyle={primaryButtonTextStyle}
                      singleButtonTextStyle={singleButtonTextStyle}
                    />

                    <AboveKeyboard
                      render={aboveKeyboardRender}
                    />

                    <SnackbarNotify
                      customSnackbar={customSnackbar}
                    />

                    <LoadingNotify
                      loaderComponent={loaderComponent}
                    />
                  </AboveKeyboardContext.Provider>
                </LoaderContext.Provider>
              </ModalityContext.Provider>
            </PopOverContext.Provider>
          </BottomSheetContext.Provider>
        </SnackbarContext.Provider>
      </AlertContext.Provider>
    </OverlayContext.Provider>
  );
}
