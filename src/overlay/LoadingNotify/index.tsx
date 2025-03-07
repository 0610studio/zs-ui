import { ActivityIndicator } from "react-native";
import React, { ReactNode, useCallback } from "react";
import { useLoader } from "../../model/useOverlay";
import ModalBackground from "../ui/ModalBackground";
import { useTheme } from "../../model";

function LoadingNotify({
  loaderComponent,
}: {
  loaderComponent?: () => ReactNode;
}) {
  const { loaderVisible } = useLoader();
  const { palette } = useTheme();

  const renderLoader = useCallback(() => {
    return loaderComponent ? (
      loaderComponent()
    ) : (
      <ActivityIndicator size="large" color="#fff" />
    );
  }, [loaderComponent]);

  if (!loaderVisible) return null;

  return (
    <ModalBackground modalBgColor={palette.modalBgColor}>
      {renderLoader()}
    </ModalBackground>
  )
}

export default LoadingNotify;
