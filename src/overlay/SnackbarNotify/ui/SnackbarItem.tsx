import React, { ReactNode, useEffect, useCallback } from "react";
import { Platform, StyleSheet, TouchableOpacity } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { CustomSnackbarProps, SnackItem } from "../../../model/types";
import ViewAtom from "../../../ui/atoms/ViewAtom";
import { ZSText } from "../../../ui";
import { useTheme } from "../../../model/useThemeProvider";

const Snackbar = ({
  customSnackbar,
  snackItem,
  hideSnackBar,
}: {
  customSnackbar?: (props: CustomSnackbarProps) => ReactNode;
  snackItem: SnackItem;
  hideSnackBar: (index: number) => void;
}) => {
  const { type, message, snackbarDuration } = snackItem;
  const { palette } = useTheme();

  const closeSnackbar = useCallback(() => {
    hideSnackBar(snackItem.index);
  }, [hideSnackBar, snackItem.index]);

  useEffect(() => {
    const closeTimeout = setTimeout(closeSnackbar, snackbarDuration);
    return () => clearTimeout(closeTimeout);
  }, []);

  return (
    <Animated.View
      style={[styles.snackbarWrapper]}
      entering={FadeInUp}
      exiting={FadeOutUp}
    >
      <TouchableOpacity
        style={[styles.container]}
        activeOpacity={1}
        onPress={closeSnackbar}
      >
        {customSnackbar ? (
          customSnackbar({ snackType: type, snackMessage: message })
        ) : (
          <ViewAtom
            style={[
              styles.snackBar,
              { backgroundColor: type === "error" ? palette.background.danger : palette.background.success },
            ]}
          >
            <ViewAtom style={styles.messageContainer}>
              <ZSText>{message}</ZSText>
            </ViewAtom>
          </ViewAtom>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    width: "100%",
  },
  snackbarWrapper: {
    width: "96%",
    marginTop: 8,
  },
  snackBar: {
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  messageContainer: {
    flex: 1,
    flexDirection: "column",
    marginLeft: 10,
  },
});

export default Snackbar;
