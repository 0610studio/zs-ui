import { ActivityIndicator } from "react-native";
import { ReactNode, useCallback } from "react";
import { useLoader } from "../../model/useOverlay";
import { BackPriority, useBackHandler } from "../../context/BackHandlerContext";
import ModalBackground from "../ui/ModalBackground";
import { useTheme } from "../../context/ThemeContext";
import { Z_INDEX_VALUE } from "../../model/utils";

function LoadingNotify({
  loaderComponent,
}: {
  loaderComponent?: () => ReactNode;
}) {
  const { loaderVisible } = useLoader();
  const { palette } = useTheme();

  // 로딩 중에는 아무것도 닫지 않고 back 만 소비한다
  useBackHandler(() => true, { enabled: loaderVisible, priority: BackPriority.LOADER });

  const renderLoader = useCallback(() => {
    return loaderComponent ? (
      loaderComponent()
    ) : (
      <ActivityIndicator
        size="large"
        color={palette.text.white}
      />
    );
  }, [loaderComponent, palette.text.white]);

  if (!loaderVisible) return null;

  return (
    <ModalBackground
      zIndex={Z_INDEX_VALUE.LOADING}
      key={loaderVisible ? 'visibleln' : 'hiddenln'}
      modalBgColor={palette.modalBgColor}
    >
      {renderLoader()}
    </ModalBackground>
  )
}

export default LoadingNotify;
