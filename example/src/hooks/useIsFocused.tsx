import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

const useIsFocused = () => {
  const [isFocused, setIsFocused] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, [])
  );

  return isFocused;
};

export default useIsFocused;