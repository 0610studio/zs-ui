import React, { ReactNode } from "react";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, View } from "react-native";
import { CustomSnackbarProps } from "../../model/types";
import SnackbarItem from "./ui/SnackbarItem";
import { useSnackbar } from "../../model/useOverlay";

const SnackbarNotify = ({
  customSnackbar
}: {
  customSnackbar?: (props: CustomSnackbarProps) => ReactNode
}) => {
  const { snackItemStack, hideSnackBar } = useSnackbar();
  const { top } = useSafeAreaInsets();

  // ----------------------------------------------------------------

  if (!snackItemStack) return null;

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      {
        snackItemStack.map((snackItem, index) => {
          return (
            <SnackbarItem
              key={index}
              customSnackbar={customSnackbar}
              snackItem={snackItem}
              hideSnackBar={hideSnackBar}
            />
          );
        })
      }
    </View>
  )
};

const styles = StyleSheet.create({
  container: {
    zIndex: 9997,
    width: '100%',
    alignItems: 'center',
    position: 'absolute',
  },
});

export default SnackbarNotify;
