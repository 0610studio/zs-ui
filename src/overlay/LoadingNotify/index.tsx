import { ActivityIndicator } from "react-native";
import React, { ReactNode, useCallback } from "react";
import { useOverlay } from "../../model/useOverlay";
import ModalBackground from "../ui/ModalBackground";

// 함수 선언식으로 변경
function LoadingNotify({
  loaderComponent,
}: {
  loaderComponent?: () => ReactNode;
}) {
  const { loaderVisible } = useOverlay();

  // loaderComponent를 메모이제이션
  const renderLoader = useCallback(() => {
    return loaderComponent ? (
      loaderComponent()
    ) : (
      <ActivityIndicator size="large" color="#fff" />
    );
  }, [loaderComponent]);

  return loaderVisible ? (
    <ModalBackground>
      {renderLoader()}
    </ModalBackground>
  ) : null;
}

export default LoadingNotify;
