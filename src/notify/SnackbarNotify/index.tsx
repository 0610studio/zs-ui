import React, { ReactNode } from "react";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, View } from "react-native";
import { CustomSnackbarProps } from "../../model/types";
import SnackbarItem from "./ui/SnackbarItem";
import { useNotify } from "../../model/useNotify";

const SnackbarNotify = ({
  customSnackbar
}: {
  customSnackbar?: (props: CustomSnackbarProps) => ReactNode
}) => {
  const { top } = useSafeAreaInsets();
  const { snackItemStack, hideSnackBar } = useNotify();

  return snackItemStack ? (
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
  ) : null;
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
