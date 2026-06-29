import { StyleSheet, View, Image } from 'react-native';
import { CustomSnackbarProps, ZSText } from 'zs-ui';

function SnackBar({
  snackType = 'success',
  snackMessage
}: CustomSnackbarProps) {
  const SnackContent = () => (
    <View style={styles.snackbar}>
      <View style={styles.container}>
        {
          snackType === 'success' ? (
            <Image style={{ width: 24, height: 24 }} source={require('./assets/ic_toast_suc.png')} resizeMode='cover' />
          ) : (
            <Image style={{ width: 24, height: 24 }} source={require('./assets/ic_prohibition.png')} resizeMode='cover' />
          )
        }
        <View style={styles.textContainer}>
          <ZSText typo='subTitle.1' style={styles.message}>{snackMessage}</ZSText>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.surface}>
      <SnackContent />
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  snackbar: {
    width: '100%',
    paddingHorizontal: 15,
    paddingVertical: 18,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    paddingLeft: 10,
  },
  message: {
    color: '#ffffff'
  },
});

export default SnackBar;