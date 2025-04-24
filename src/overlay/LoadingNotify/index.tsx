import { ActivityIndicator } from "react-native";
import React, { ReactNode, useCallback } from "react";
import { useLoader } from "../../model/useOverlay";
import ModalBackground from "../ui/ModalBackground";
import { useTheme } from "../../model";
import { Z_INDEX_VALUE } from "../../model/utils";

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
    <ModalBackground zIndex={Z_INDEX_VALUE.LOADING} key={loaderVisible ? 'visibleln' : 'hiddenln'} modalBgColor={palette.modalBgColor}>
      {renderLoader()}
    </ModalBackground>
  )
}

export default LoadingNotify;
