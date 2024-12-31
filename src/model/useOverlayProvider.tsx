import { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, Keyboard, TextProps, TouchableOpacityProps } from 'react-native';
import OverlayContext from './useOverlay';
import { AlertActions, BottomSheetRef, HideOption, ModalityProps, OverlayProviderProps, PopOverMenuProps, ShowAlertProps, ShowBottomSheetProps, ShowSnackBarProps, SnackItem } from './types';
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
  const [contentsGestureEnable, setContentsGestureEnable] = useState<boolean>(false);
  const [bottomSheetVisible, setBottomSheetVisible] = useState<boolean>(false);
  const [bottomSheetBackgroundColor, setBottomSheetBackgroundColor] = useState<string>();
  const [bottomSheetComponent, setBottomSheetComponent] = useState<React.ReactNode>(false);
  const [bottomSheetPadding, setBottomSheetPadding] = useState<number | undefined>(undefined);
  const [bottomSheetMarginX, setBottomSheetMarginX] = useState<number | undefined>(undefined);
  const [bottomSheetMaxHeight, setBottomSheetMaxHeight] = useState<number>();
  const [bottomSheetScrollView, setBottomSheetScrollView] = useState<boolean>(true);
  const [isBottomRadius, setIsBottomRadius] = useState<boolean>(true);
  const [handleVisible, setHandleVisible] = useState<boolean>(true);
  const [marginBottomBS, setMarginBottomBs] = useState<number | undefined>(undefined);
  const [showsVerticalScrollIndicator, setShowsVerticalScrollIndicator] = useState<boolean>(false);
  const [headerComponent, setHeaderComponent] = useState<React.ReactNode | undefined>(undefined);
  const bottomSheetRef = useRef<BottomSheetRef | null>(null);

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
    isHandleVisible = true,
    component,
    contentsGestureEnable = true,
    marginHorizontal,
    padding,
    marginBottom,
    backgroundColor,
    isBottomRadius = true,
    maxHeight,
    isScrollView = true,
    showsVerticalScrollIndicator = false,
    headerComponent = undefined
  }: ShowBottomSheetProps) => {
    Keyboard.dismiss();
    padding && setBottomSheetPadding(padding);
    marginBottom && setMarginBottomBs(marginBottom);
    marginHorizontal && setBottomSheetMarginX(marginHorizontal);
    backgroundColor && setBottomSheetBackgroundColor(backgroundColor);
    maxHeight && setBottomSheetMaxHeight(maxHeight);
    setShowsVerticalScrollIndicator(showsVerticalScrollIndicator);
    setHeaderComponent(headerComponent);
    setContentsGestureEnable(contentsGestureEnable);
    setHandleVisible(isHandleVisible);
    setBottomSheetScrollView(isScrollView);
    setIsBottomRadius(isBottomRadius);
    setBottomSheetComponent(component);
    bottomSheetRef.current?.handleVisible(true);
  };

  const showLoader = () => {
    setLoaderVisible(true);
  };

  const showPopOverMenu = ({
    px,
    py,
    component
  }: PopOverMenuProps) => {
    setPopOverLocation({ px, py });
    setPopOverComponent(component);
    setPopOverVisible(true);
  }

  const showModality = ({
    component
  }: ModalityProps) => {
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
        bottomSheetRef.current?.handleVisible(false);
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
        bottomSheetRef.current?.handleVisible(false);
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
    if (alertVisible || modalityVisible || popOverVisible) {
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

  return (
    <OverlayContext.Provider value={{
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
    }}>
      {children}

      <BottomSheetOverlay
        ref={bottomSheetRef}
        bottomSheetComponent={bottomSheetComponent}
        contentsGestureEnable={contentsGestureEnable}
        bottomSheetPadding={bottomSheetPadding}
        marginBottomBS={marginBottomBS}
        isHandleVisible={handleVisible}
        bottomSheetMarginX={bottomSheetMarginX}
        isBottomRadius={isBottomRadius}
        bottomSheetBackgroundColor={bottomSheetBackgroundColor}
        maxHeight={bottomSheetMaxHeight}
        isScrollView={bottomSheetScrollView}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        headerComponent={headerComponent}
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
