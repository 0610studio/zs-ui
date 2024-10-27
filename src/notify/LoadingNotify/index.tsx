import { ActivityIndicator, BackHandler } from "react-native";
import React, { ReactNode, useEffect, useCallback } from "react";
import { useNotify } from "../../model/useNotify";
import ModalBackground from "../ui/ModalBackground";

// 함수 선언식으로 변경
function LoadingNotify({
  loaderComponent,
}: {
  loaderComponent?: () => ReactNode;
}) {
  const { loaderVisible } = useNotify();

  // BackHandler 이벤트 처리 최적화
  useEffect(() => {
    const handleBackPressed = () => {
      if (loaderVisible) return true; // 로더가 보이는 경우 뒤로가기 방지
      return false;
    };

    const handler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPressed
    );

    // cleanup 함수 추가
    return () => handler.remove();
  }, [loaderVisible]);

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
