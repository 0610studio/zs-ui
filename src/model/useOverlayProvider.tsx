import { useCallback, useEffect, useMemo, useState } from 'react';
import { BackHandler, Keyboard, TextProps, TouchableOpacityProps } from 'react-native';
import OverlayContext from './useOverlay';
import { AlertActions, BottomSheetOptions, HideOption, ModalityProps, OverlayProviderProps, PopOverMenuProps, ShowAlertProps, ShowBottomSheetProps, ShowSnackBarProps, SnackItem } from './types';
import AlertOverlay from '../overlay/AlertOverlay';
import SnackbarNotify from '../overlay/SnackbarNotify';
import BottomSheetOverlay from '../overlay/BottomSheetOverlay';
import LoadingNotify from '../overlay/LoadingNotify';
import PopOverMenu from '../overlay/PopOver/PopOverMenu';
import Modality from '../overlay/Modality';

export function OverlayProvider({
  customSnackbar,
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

  // Loading
  const [loaderVisible, setLoaderVisible] = useState<boolean>(false);

  // PopOver
  const [popOverVisible, setPopOverVisible] = useState<boolean>(false);
  const [popOverLocation, setPopOverLocation] = useState<{ px: PopOverMenuProps['px'], py: PopOverMenuProps['py'] }>({ px: 0, py: 0 });
  const [popOverComponent, setPopOverComponent] = useState<React.ReactNode>(false);

  // Modality
  const [modalityVisible, setModalityVisible] = useState<boolean>(false);
  const [modalityComponent, setModalityComponent] = useState<React.ReactNode>(false);

  // ---
  const [fontFamily, setFontFamily] = useState<string | undefined | { title?: string; info?: string; label?: string; }>(undefined);

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

    setFontFamily(fontFamily);
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
    snackbarDuration = 3000
  }: ShowSnackBarProps) => {
    // TODO: 스택 쌓고싶은데 삭제될 때 참조를 잃어서 삭제가 안되는 문제가 있음.
    setSnackItemStack((prev) => {
      if (prev.length === 0) {
        return [...prev, { message, type, index: index, snackbarDuration: snackbarDuration }];
      } else {
        return prev;
      };
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
      case 'all':
        setModalityVisible(false);
        setAlertVisible(false);
        setSnackItemStack([]);
        setLoaderVisible(false);
        setPopOverVisible(false);
        setBottomSheetVisible(false);
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
  }, [alertVisible, loaderVisible, modalityVisible, popOverVisible, hideOverlay]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backPressHandler);
    return () => backHandler.remove();
  }, [backPressHandler]);

  // ------------------------------------------------------------

  const overlayContextValue = useMemo(() => ({
    alertVisible,
    setAlertVisible,
    // ---
    snackItemStack,
    hideSnackBar,
    // ---
    bottomSheetVisible,
    setBottomSheetVisible,
    // ---
    loaderVisible,
    // ---
    popOverVisible,
    setPopOverVisible,
    // ---
    modalityVisible,
    setModalityVisible,
    // ---
    showAlert,
    showSnackBar,
    showBottomSheet,
    showLoader,
    showPopOverMenu,
    showModality,
    // ---
    hideOverlay,
  }), [
    alertVisible,
    setAlertVisible,
    // ---
    snackItemStack,
    hideSnackBar,
    // ---
    bottomSheetVisible,
    setBottomSheetVisible,
    // ---
    loaderVisible,
    // ---
    popOverVisible,
    setPopOverVisible,
    // ---
    modalityVisible,
    setModalityVisible,
    // ---
    showAlert,
    showSnackBar,
    showBottomSheet,
    showLoader,
    showPopOverMenu,
    showModality,
    // ---
    hideOverlay,
  ]);

  return (
    <OverlayContext.Provider value={overlayContextValue}>
      {children}

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

      <SnackbarNotify
        customSnackbar={customSnackbar}
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

      <Modality modalityComponent={modalityComponent} />

      <LoadingNotify
        loaderComponent={loaderComponent}
      />
    </OverlayContext.Provider>
  );
}
