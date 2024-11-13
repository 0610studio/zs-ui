import { Image, StyleSheet, TouchableOpacity } from "react-native"
import { ZSText, useTheme } from "zs-ui";
import ViewAtom from "zs-ui/ui/atoms/ViewAtom";

const SnackBar = ({ snackType, snackMessage }: any) => {
  const { palette } = useTheme();
  return (
    <TouchableOpacity activeOpacity={1} onPress={() => { }}
      style={[styles.snackbar, { backgroundColor: snackType === 'error' ? palette.background.danger : palette.background.success }]}>
      <ViewAtom style={{ flexDirection: 'row', alignItems: 'center' }}>
        {
          snackType === 'success' ? (
            <Image style={{ width: 30, height: 30 }} source={require('./assets/ic_toast_suc.png')} resizeMode='cover' />
          ) : (
            <Image style={{ width: 30, height: 30 }} source={require('./assets/ic_prohibition.png')} resizeMode='cover' />
          )
        }

        <ViewAtom style={{ flex: 1, flexDirection: 'column', marginLeft: 10, justifyContent: 'center' }}>
          <ZSText>{snackMessage}</ZSText>
        </ViewAtom>
      </ViewAtom>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  snackbar: {
    width: '100%',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 16,
  }
});

export default SnackBar;